import Config from "./config";
import { ImageMetadata } from "./metadata";
import * as ort from "onnxruntime-web";
import { createSession } from "../sessionController";
import Jimp from "jimp";
import Preprocessor from "./preprocessor";
import PreprocessorConfig from "./preprocessorConfig";
import { softmax } from "./utils";
import { IImageModel, ImageProcessingResult } from "./interfaces";
import { Session, SessionParams } from "../session";
import * as Comlink from "comlink";

export type ObjectDetectionPrediction = {
  class: string;
  color: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ObjectDetectionResult = ImageProcessingResult & {
  objects: ObjectDetectionPrediction[];
};

export class ObjectDetectionModel implements IImageModel {
  metadata: ImageMetadata;
  initialized: boolean;
  private config?: Config;
  private preprocessor?: Preprocessor;
  private session?: Session | Comlink.Remote<Session>;

  constructor(metadata: ImageMetadata) {
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
    if (!this.metadata.configPath) {
      throw Error("configPath is not defined");
    }
    this.config = await Config.fromFile(this.metadata.configPath);
    this.initialized = true;
    const end = new Date();
    const elapsed = (end.getTime() - start.getTime()) / 1000;
    return elapsed;
  };

  process = async (input: string | Buffer): Promise<ObjectDetectionResult> => {
    if (!this.initialized || !this.session || !this.preprocessor || !this.config) {
      throw Error("the model is not initialized");
    }
    // @ts-ignore
    const image = await Jimp.read(input);
    const tensor = this.preprocessor.process(image);
    const start = new Date();
    const feeds: Record<string, ort.Tensor> = {};
    const inputNames = await this.session.inputNames();
    feeds[inputNames[0]] = tensor;
    const output = await this.session.run(feeds);
    if (!output) {
      throw Error("model output is undefined");
    }
    const end = new Date();
    const elapsed = (end.getTime() - start.getTime()) / 1000;
    const classIndices: number[] = [];
    const classConfidences: number[] = [];
    const indices: number[] = [];
    for (let i = 0; i < output["logits"].dims[1]; i++) {
      const s = output["logits"].dims[2] * i;
      const f = output["logits"].dims[2] * (i + 1);
      const data = output["logits"].data.slice(s, f);
      // @ts-ignore
      const classes = softmax(data);
      let max = 0;
      let maxIdx = 0;
      for (let j = 0; j < classes.length - 1; j++) {
        if (classes[j] > max) {
          max = classes[j];
          maxIdx = j;
        }
      }
      const threshold = 0.9;
      if (max > threshold) {
        classIndices.push(maxIdx);
        classConfidences.push(max);
        indices.push(i);
      }
    }
    const boxes = [];
    for (let i = 0; i < indices.length; i++) {
      const index = indices[i];
      const box = output["boxes"].data.slice(4 * index, 4 * (index + 1));
      // @ts-ignore
      box[0] = box[0] - box[2] / 2;
      // @ts-ignore
      box[1] = box[1] - box[3] / 2;
      // @ts-ignore
      boxes.push(box);
    }
    const res: ObjectDetectionResult = {
      objects: [],
      elapsed: elapsed,
    };
    for (let i = 0; i < indices.length; i++) {
      const cls = this.config.classes.get(classIndices[i]);
      if (!cls) {
        continue;
      }
      const color = this.config.colors.get(classIndices[i]);
      if (!color) {
        continue;
      }
      const hex = "#" + componentToHex(color[0]) + componentToHex(color[1]) + componentToHex(color[2]);
      const box = boxes[i];
      res.objects.push({
        class: cls,
        color: hex,
        confidence: classConfidences[i],
        x: box[0],
        y: box[1],
        width: box[2],
        height: box[3],
      });
    }
    return res;
  };
}

function componentToHex(c: number) {
  const hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}
