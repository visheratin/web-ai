import { createSession } from "../sessionController";
import { MultimodalMetadata } from "./metadata";
import { Encoder } from "../utils/encoder";
import { Decoder } from "../utils/decoder";
import { GeneratorType, encodeData, generate } from "../utils/generator";
import { GenerationConfig } from "../utils/generationConfig";
import { loadTokenizer } from "../text/tokenizer";
import { BaseMultimodalModel } from "./base";
import { ImageProcessingResult } from "../image/interfaces";
import { prepareTextTensors } from "../utils/prepare-text";
import { prepareImagesTensor } from "../utils/prepare-image";
import PreprocessorConfig from "../image/preprocessorConfig";
import Preprocessor from "../image/preprocessor";
import * as ort from "onnxruntime-web";

export type Img2TextResult = ImageProcessingResult & {
  text: string[];
};

export class Img2TextModel extends BaseMultimodalModel {
  private imageEncoder?: Encoder;
  private textEncoder?: Encoder;
  private textDecoder?: Decoder;

  constructor(metadata: MultimodalMetadata) {
    super(metadata);
  }

  init = async (proxy = true): Promise<number> => {
    const start = new Date();
    const imageEncoderPath = this.metadata.modelPaths.get("image-encoder");
    if (!imageEncoderPath) {
      throw new Error("model paths do not have the 'image-encoder' path");
    }
    const imageEncoderOutputName = this.metadata.outputNames?.get("image-encoder");
    if (!imageEncoderOutputName) {
      throw new Error("output names do not have the 'encoder' path");
    }
    const imageEncoderSession = await createSession(imageEncoderPath, proxy);
    this.imageEncoder = new Encoder(imageEncoderSession, imageEncoderOutputName, GeneratorType.Img2Seq);
    if (this.metadata.modelPaths.has("text-encoder")) {
      const textEncoderPath = this.metadata.modelPaths.get("text-encoder");
      if (!textEncoderPath) {
        throw new Error("model paths do not have the 'text-encoder' path");
      }
      const textEncoderOutputName = this.metadata.outputNames?.get("text-encoder");
      if (!textEncoderOutputName) {
        throw new Error("output names do not have the 'encoder' path");
      }
      const textEncoderSession = await createSession(textEncoderPath, proxy);
      this.textEncoder = new Encoder(textEncoderSession, textEncoderOutputName, GeneratorType.Seq2Seq);
    }
    const decoderPath = this.metadata.modelPaths.get("text-decoder");
    if (!decoderPath) {
      throw new Error("model paths do not have the 'text-decoder' path");
    }
    const decoderOutputName = this.metadata.outputNames?.get("text-decoder");
    if (!decoderOutputName) {
      throw new Error("output names do not have the 'text-decoder' path");
    }
    const decoderSession = await createSession(decoderPath, proxy);
    this.textDecoder = new Decoder(decoderSession, decoderOutputName, GeneratorType.Img2Seq);
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
    if (!this.initialized || !this.imageEncoder || !this.textDecoder || !this.tokenizer) {
      throw Error("the model is not initialized");
    }
    const start = new Date();
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
    const outputTokenIDs: number[][] = [];
    const result: string[] = [];
    let encoderOutput: ort.Tensor;
    let generateFunc: AsyncIterable<number[]>;
    if (this.textEncoder) {
      encoderOutput = await encodeData(
        this.imageEncoder,
        imageTensor,
        undefined,
        this.textEncoder,
        textTensors[0],
        textTensors[1],
      );
      generateFunc = generate(encoderOutput, this.textDecoder, generationConfig);
    } else {
      encoderOutput = await encodeData(this.imageEncoder, imageTensor);
      generateFunc = generate(
        encoderOutput,
        this.textDecoder,
        generationConfig,
        undefined,
        textTensors[0],
        textTensors[1],
      );
    }
    for await (const tokenIDs of generateFunc) {
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
    if (!this.initialized || !this.imageEncoder || !this.textDecoder || !this.tokenizer) {
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
    let encoderOutput: ort.Tensor;
    let generateFunc: AsyncIterable<number[]>;
    if (this.textEncoder) {
      encoderOutput = await encodeData(
        this.imageEncoder,
        imageTensor,
        undefined,
        this.textEncoder,
        textTensors[0],
        textTensors[1],
      );
      generateFunc = generate(encoderOutput, this.textDecoder, generationConfig);
    } else {
      encoderOutput = await encodeData(this.imageEncoder, imageTensor);
      generateFunc = generate(
        encoderOutput,
        this.textDecoder,
        generationConfig,
        undefined,
        textTensors[0],
        textTensors[1],
      );
    }
    for await (const tokenIDs of generateFunc) {
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
