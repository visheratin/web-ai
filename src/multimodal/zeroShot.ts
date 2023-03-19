import { MultimodalMetadata } from "./metadata";
import * as ort from "onnxruntime-web";
import { createSession } from "../sessionController";
import Jimp from "jimp";
import Preprocessor from "../image/preprocessor";
import PreprocessorConfig from "../image/preprocessorConfig";
import { normalize, softmax } from "../image/utils";
import { Session, SessionParams } from "../session";
import * as Comlink from "comlink";
import { WasmTokenizer } from "@visheratin/tokenizers";
import { loadTokenizer } from "../text/tokenizer";
import { ClassificationPrediction } from "../image/classificationModel";
import { ImageProcessingResult } from "../image";

export type ZeroShotResult = ImageProcessingResult & {
  results: ClassificationPrediction[][];
  textFeatures: number[][];
  imageFeatures: number[][];
};

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

  init = async (proxy = true): Promise<number> => {
    const start = new Date();
    this.session = await createSession(this.metadata.modelPath, proxy);
    const preprocessorConfig = await PreprocessorConfig.fromFile(this.metadata.preprocessorPath);
    this.preprocessor = new Preprocessor(preprocessorConfig);
    this.tokenizer = await loadTokenizer(this.metadata.tokenizerPath);
    this.initialized = true;
    const end = new Date();
    const elapsed = (end.getTime() - start.getTime()) / 1000;
    return elapsed;
  };

  process = async (inputs: string[] | Buffer[], classes: string[]): Promise<ZeroShotResult> => {
    if (!this.initialized || !this.preprocessor) {
      throw Error("the model is not initialized");
    }
    const start = new Date();
    const imageTensor = await this.prepareImagesTensor(inputs);
    const textTensors = await this.prepareClassTensors(classes);
    const result = await this.runInference(imageTensor, textTensors[0], textTensors[1], classes);
    const end = new Date();
    const elapsed = (end.getTime() - start.getTime()) / 1000;
    result.elapsed = elapsed;
    return result;
  };

  prepareImagesTensor = async (inputs: string[] | Buffer[]): Promise<ort.Tensor> => {
    if (!this.initialized || !this.preprocessor) {
      throw Error("the model is not initialized");
    }
    const tensors: ort.Tensor[] = new Array(inputs.length);
    for (let i = 0; i < inputs.length; i++) {
      // @ts-ignore
      const image = await Jimp.read(inputs[i]);
      tensors[i] = this.preprocessor.process(image);
    }
    const resultData = new Float32Array(tensors.length * tensors[0].data.length);
    for (let i = 0; i < tensors.length; i++) {
      for (let j = 0; j < tensors[0].data.length; j++) {
        // @ts-ignore
        resultData[i * tensors[0].data.length + j] = tensors[i].data[j];
      }
    }
    return new ort.Tensor("float32", resultData, [
      tensors.length,
      tensors[0].dims[1],
      tensors[0].dims[2],
      tensors[0].dims[3],
    ]);
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
    classes: string[],
  ): Promise<ZeroShotResult> => {
    if (!this.initialized || !this.session) {
      throw Error("the model is not initialized");
    }
    const feeds: Record<string, ort.Tensor> = {};
    feeds["pixel_values"] = imageInput;
    feeds["input_ids"] = inputIDs;
    feeds["attention_mask"] = attentionMask;
    const outputData = await this.session.run(feeds);
    const outputNames = await this.session.outputNames();

    if (!outputNames.includes("logits_per_image")) {
      throw Error("the model does not contain logits_per_image output");
    }
    const logits = outputData["logits_per_image"];
    const result: ClassificationPrediction[][] = [];
    for (let i = 0; i < logits.dims[0]; i++) {
      const res: ClassificationPrediction[] = new Array(classes.length).fill({
        class: "unknown",
        confidence: 0,
      });
      // @ts-ignore
      const sm = softmax(logits.data.slice(i * logits.dims[1], (i + 1) * logits.dims[1]));
      for (let i = 0; i < sm.length; i++) {
        res[i] = {
          class: classes[i],
          confidence: sm[i],
        };
      }
      res.sort((a, b) => b.confidence - a.confidence);
      result.push(res);
    }

    let imageEmbeds: number[][] = [];
    if (outputNames.includes("image_embeds")) {
      imageEmbeds = new Array(outputData["image_embeds"].dims[0]);
      for (let i = 0; i < outputData["image_embeds"].dims[0]; i++) {
        imageEmbeds[i] = new Array(outputData["image_embeds"].dims[1]);
        for (let j = 0; j < outputData["image_embeds"].dims[1]; j++) {
          imageEmbeds[i][j] = Number(outputData["image_embeds"].data[i * outputData["image_embeds"].dims[1] + j]);
        }
      }
      for (let i = 0; i < imageEmbeds.length; i++) {
        imageEmbeds[i] = normalize(imageEmbeds[i]);
      }
    }

    let textEmbeds: number[][] = [];
    if (outputNames.includes("text_embeds")) {
      textEmbeds = new Array(outputData["text_embeds"].dims[0]);
      for (let i = 0; i < outputData["text_embeds"].dims[0]; i++) {
        textEmbeds[i] = new Array(outputData["text_embeds"].dims[1]);
        for (let j = 0; j < outputData["text_embeds"].dims[1]; j++) {
          textEmbeds[i][j] = Number(outputData["text_embeds"].data[i * outputData["text_embeds"].dims[1] + j]);
        }
      }
      for (let i = 0; i < textEmbeds.length; i++) {
        textEmbeds[i] = normalize(textEmbeds[i]);
      }
    }

    return {
      results: result,
      imageFeatures: imageEmbeds,
      textFeatures: textEmbeds,
      elapsed: 0,
    };
  };
}
