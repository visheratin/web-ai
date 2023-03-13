import { MultimodalMetadata } from "./metadata";
import * as ort from "onnxruntime-web";
import { createSession } from "../sessionController";
import Jimp from "jimp";
import Preprocessor from "../image/preprocessor";
import PreprocessorConfig from "../image/preprocessorConfig";
import { softmax } from "../image/utils";
import { Session, SessionParams } from "../session";
import * as Comlink from "comlink";
import { WasmTokenizer } from "@visheratin/tokenizers";
import { loadTokenizer } from "../text/tokenizer";
import { ClassificationPrediction, ClassificationResult } from "../image/classificationModel";

export class ZeroShotClassificationModel {
  metadata: MultimodalMetadata;
  initialized: boolean;
  private preprocessor?: Preprocessor;
  private tokenizer?: WasmTokenizer;
  private session?: Session | Comlink.Remote<Session>;

  constructor(metadata: MultimodalMetadata) {
    if (SessionParams.memoryLimitMB > 0 && SessionParams.memoryLimitMB < metadata.memEstimateMB) {
      throw new Error(
        `The model requires ${metadata.memEstimateMB} MB of memory, but the current memory limit is 
          ${SessionParams.memoryLimitMB} MB.`,
      );
    }
    this.metadata = metadata;
    this.initialized = false;
  }

  init = async (cacheSizeMB = 500, proxy = true): Promise<number> => {
    const start = new Date();
    this.session = await createSession(this.metadata.modelPath, cacheSizeMB, proxy);
    const preprocessorConfig = await PreprocessorConfig.fromFile(this.metadata.preprocessorPath);
    this.preprocessor = new Preprocessor(preprocessorConfig);
    this.tokenizer = await loadTokenizer(this.metadata.tokenizerPath);
    this.initialized = true;
    const end = new Date();
    const elapsed = (end.getTime() - start.getTime()) / 1000;
    return elapsed;
  };

  process = async (input: string | Buffer, classes: string[]): Promise<ClassificationResult> => {
    if (!this.initialized || !this.preprocessor) {
      throw Error("the model is not initialized");
    }
    const start = new Date();
    // @ts-ignore
    const image = await Jimp.read(input);
    const imageTensor = this.preprocessor.process(image);
    const textTensors = await this.prepareClassTensors(classes);
    const output = await this.runInference(imageTensor, textTensors[0], textTensors[1]);
    const end = new Date();
    const elapsed = (end.getTime() - start.getTime()) / 1000;
    const res: ClassificationPrediction[] = new Array(classes.length).fill({
      class: "unknown",
      confidence: 0,
    });
    // @ts-ignore
    const result = softmax(output.data);
    for (let i = 0; i < output.data.length; i++) {
      res[i] = {
        class: classes[i],
        confidence: result[i],
      };
    }
    res.sort((a, b) => b.confidence - a.confidence);
    return {
      results: res,
      elapsed: elapsed,
    };
  };

  prepareClassTensors = async (classes: string[]): Promise<ort.Tensor[]> => {
    if (!this.initialized || !this.tokenizer) {
      throw Error("the model is not initialized");
    }
    let maxLen = 0;
    const inputIDs: number[][] = new Array(classes.length);
    const attentionMasks: number[][] = new Array(classes.length);
    for (let i = 0; i < classes.length; i++) {
      const tokens = await this.tokenizer.encode(classes[i], true);
      inputIDs[i] = new Array(tokens.length);
      for (let j = 0; j < tokens.length; j++) {
        inputIDs[i][j] = tokens[j];
      }
      attentionMasks[i] = new Array(tokens.length).fill(1);
      if (tokens.length > maxLen) {
        maxLen = tokens.length;
      }
    }
    for (let i = 0; i < classes.length; i++) {
      while (inputIDs[i].length < maxLen) {
        inputIDs[i].push(0);
        attentionMasks[i].push(0);
      }
    }
    const inputIDsData = new BigInt64Array(classes.length * maxLen);
    for (let i = 0; i < classes.length; i++) {
      for (let j = 0; j < maxLen; j++) {
        inputIDsData[i * maxLen + j] = BigInt(inputIDs[i][j]);
      }
    }
    const attentionMasksData = new BigInt64Array(classes.length * maxLen);
    for (let i = 0; i < classes.length; i++) {
      for (let j = 0; j < maxLen; j++) {
        attentionMasksData[i * maxLen + j] = BigInt(attentionMasks[i][j]);
      }
    }
    const inputIDsTensor = new ort.Tensor("int64", inputIDsData, [classes.length, maxLen]);
    const attentionMaskTensor = new ort.Tensor("int64", attentionMasksData, [classes.length, maxLen]);
    return [inputIDsTensor, attentionMaskTensor];
  };

  private runInference = async (
    imageInput: ort.Tensor,
    inputIDs: ort.Tensor,
    attentionMask: ort.Tensor,
  ): Promise<ort.Tensor> => {
    if (!this.initialized || !this.session) {
      throw Error("the model is not initialized");
    }
    const feeds: Record<string, ort.Tensor> = {};
    feeds["pixel_values"] = imageInput;
    feeds["input_ids"] = inputIDs;
    feeds["attention_mask"] = attentionMask;
    const outputData = await this.session.run(feeds);
    const outputNames = await this.session.outputNames();
    const output = outputData[outputNames[0]];
    return output;
  };
}
