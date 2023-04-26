import { createSession } from "../sessionController";
import { MultimodalMetadata } from "./metadata";
import { Encoder } from "../utils/encoder";
import { Decoder } from "../utils/decoder";
import { GeneratorType, generate } from "../utils/generator";
import { GenerationConfig } from "../utils/generationConfig";
import { loadTokenizer } from "../text/tokenizer";
import { BaseMultimodalModel } from "./base";
import { ImageProcessingResult } from "../image/interfaces";
import { prepareImagesTensor, prepareTextTensors } from "../utils/prepare";
import PreprocessorConfig from "../image/preprocessorConfig";
import Preprocessor from "../image/preprocessor";

export type Img2TextResult = ImageProcessingResult & {
  text: string[];
};

export class Img2TextModel extends BaseMultimodalModel {
  private encoder?: Encoder;
  private decoder?: Decoder;

  constructor(metadata: MultimodalMetadata) {
    super(metadata);
  }

  init = async (proxy = true): Promise<number> => {
    const start = new Date();
    const encoderPath = this.metadata.modelPaths.get("encoder");
    if (!encoderPath) {
      throw new Error("model paths do not have the 'encoder' path");
    }
    const encoderOutputName = this.metadata.outputNames?.get("encoder");
    if (!encoderOutputName) {
      throw new Error("output names do not have the 'encoder' path");
    }
    const encoderSession = await createSession(encoderPath, proxy);
    const decoderPath = this.metadata.modelPaths.get("decoder");
    if (!decoderPath) {
      throw new Error("model paths do not have the 'decoder' path");
    }
    const decoderOutputName = this.metadata.outputNames?.get("decoder");
    if (!decoderOutputName) {
      throw new Error("output names do not have the 'decoder' path");
    }
    const decoderSession = await createSession(decoderPath, proxy);
    this.encoder = new Encoder(encoderSession, encoderOutputName, GeneratorType.Img2Seq);
    this.decoder = new Decoder(decoderSession, decoderOutputName, GeneratorType.Img2Seq);
    const preprocessorConfig = await PreprocessorConfig.fromFile(this.metadata.preprocessorPath);
    this.preprocessor = new Preprocessor(preprocessorConfig);
    this.tokenizer = await loadTokenizer(this.metadata.tokenizerPath);
    const end = new Date();
    const elapsed = (end.getTime() - start.getTime()) / 1000;
    this.initialized = true;
    return elapsed;
  };

  process = async (
    imageInputs: string | ArrayBuffer | string[] | ArrayBuffer[],
    textInputs: string | string[],
  ): Promise<Img2TextResult> => {
    if (!this.initialized || !this.encoder || !this.decoder || !this.tokenizer) {
      throw Error("the model is not initialized");
    }
    if (typeof imageInputs === "string") {
      imageInputs = [imageInputs];
    }
    if (imageInputs instanceof ArrayBuffer) {
      imageInputs = [imageInputs];
    }
    if (typeof textInputs === "string") {
      textInputs = [textInputs];
    }
    const imageTensor = await prepareImagesTensor(imageInputs, this);
    if (
      this.metadata.tokenizerParams.bosTokenID === undefined ||
      this.metadata.tokenizerParams.eosTokenID === undefined
    ) {
      throw Error("the model does not have the bosTokenID or eosTokenID");
    }
    const textTensors = await prepareTextTensors(
      textInputs,
      this,
      false,
      this.metadata.tokenizerParams.padTokenID,
      this.metadata.tokenizerParams.bosTokenID,
    );
    const generationConfig: GenerationConfig = {
      maxLength: 500,
      eosTokenID: this.metadata.tokenizerParams.eosTokenID,
      bosTokenID: this.metadata.tokenizerParams.bosTokenID,
      padTokenID: this.metadata.tokenizerParams.padTokenID,
    };
    const start = new Date();
    const outputTokenIDs: number[][] = [];
    const result: string[] = [];
    // const imageAttention = new ort.Tensor(
    //   "int64",
    //   new BigInt64Array(imageTensor.data.length).fill(1n),
    //   imageTensor.dims,
    // );
    for await (const tokenIDs of generate(
      imageTensor,
      this.encoder,
      this.decoder,
      generationConfig,
      undefined,
      textTensors[0],
      textTensors[1],
    )) {
      for (let i = 0; i < tokenIDs.length; i++) {
        if (tokenIDs[i] !== this.metadata.tokenizerParams.padTokenID) {
          if (!outputTokenIDs[i]) outputTokenIDs[i] = [];
          outputTokenIDs[i].push(tokenIDs[i]);
        }
        const outputTokens = new Uint32Array(outputTokenIDs[i]);
        const output: string = this.tokenizer.decode(outputTokens, true).trim();
        result[i] = output;
      }
    }
    const end = new Date();
    const elapsed = (end.getTime() - start.getTime()) / 1000;
    return {
      text: result,
      elapsed: elapsed,
    };
  };

  async *processStream(
    imageInputs: string | ArrayBuffer | string[] | ArrayBuffer[],
    textInputs: string | string[],
  ): AsyncIterable<string[]> {
    if (!this.initialized || !this.encoder || !this.decoder || !this.tokenizer) {
      throw Error("the model is not initialized");
    }
    if (typeof imageInputs === "string") {
      imageInputs = [imageInputs];
    }
    if (imageInputs instanceof ArrayBuffer) {
      imageInputs = [imageInputs];
    }
    if (typeof textInputs === "string") {
      textInputs = [textInputs];
    }
    const imageTensor = await prepareImagesTensor(imageInputs, this);
    const textTensors = await prepareTextTensors(
      textInputs,
      this,
      false,
      this.metadata.tokenizerParams.padTokenID,
      this.metadata.tokenizerParams.bosTokenID,
    );
    if (
      this.metadata.tokenizerParams.bosTokenID === undefined ||
      this.metadata.tokenizerParams.eosTokenID === undefined
    ) {
      throw Error("the model does not have the bosTokenID or eosTokenID");
    }
    const generationConfig: GenerationConfig = {
      maxLength: 500,
      eosTokenID: this.metadata.tokenizerParams.eosTokenID,
      bosTokenID: this.metadata.tokenizerParams.bosTokenID,
      padTokenID: this.metadata.tokenizerParams.padTokenID,
    };
    const outputTokenIDs: number[][] = [];
    let oldOutput: string[] = new Array(textInputs.length).fill("");
    const diffs: string[] = new Array(textInputs.length).fill("");
    for await (const tokenIDs of generate(
      imageTensor,
      this.encoder,
      this.decoder,
      generationConfig,
      undefined,
      textTensors[0],
      textTensors[1],
    )) {
      const newOutput: string[] = [];
      for (let i = 0; i < tokenIDs.length; i++) {
        if (tokenIDs[i] !== this.metadata.tokenizerParams.padTokenID) {
          if (!outputTokenIDs[i]) outputTokenIDs[i] = [];
          outputTokenIDs[i].push(tokenIDs[i]);
        }
        const outputTokens = new Uint32Array(outputTokenIDs[i]);
        const output: string = this.tokenizer.decode(outputTokens, true);
        newOutput.push(output);
        diffs[i] = output.substring(oldOutput[i].length);
      }
      yield diffs;
      oldOutput = newOutput;
    }
  }
}
