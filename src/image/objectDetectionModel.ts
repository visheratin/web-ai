// @ts-nocheck
import Config from "./config";
import { ImageMetadata } from "./metadata";
import * as ort from "onnxruntime-web";
import { createSession } from "../session";
import Jimp from "jimp";
import Preprocessor from "./preprocessor";
import PreprocessorConfig from "./preprocessorConfig";
import { softmax } from "./utils";

export type ObjectDetectionPrediction = {
  class: string;
  color: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ObjectDetectionResult = {
  objects: ObjectDetectionPrediction[];
  elapsed: number;
};

export class ObjectDetectionModel {
  metadata: ImageMetadata;
  private config: Config | null;
  private preprocessor: Preprocessor;
  private session: ort.InferenceSession | null;

  constructor(metadata: ImageMetadata, config: Config | null) {
    this.metadata = metadata;
    this.session = null;
    this.config = config;
  }

  init = async (): Promise<number> => {
    const start = new Date();
    this.session = await createSession(this.metadata.modelPath);
    const preprocessorConfig = await PreprocessorConfig.fromFile(
      this.metadata.preprocessorPath
    );
    this.preprocessor = new Preprocessor(preprocessorConfig);
    if (this.config === null) {
      this.config = await Config.fromFile(this.metadata.configPath);
    }
    const end = new Date();
    const elapsed = (end.getTime() - start.getTime()) / 1000;
    return elapsed;
  };

  process = async (
    input: string | ArrayBuffer,
    threshold: number
  ): Promise<ObjectDetectionResult> => {
    let image = await Jimp.read(input);
    const tensor = this.preprocessor.process(image);
    const start = new Date();
    const feeds: Record<string, ort.Tensor> = {};
    feeds[this.session!.inputNames[0]] = tensor;
    const output = await this.session?.run(feeds);
    if (!output) {
      throw Error("model output is undefined");
    }
    const end = new Date();
    const elapsed = (end.getTime() - start.getTime()) / 1000;
    let classIndices: number[] = [];
    let classConfidences: number[] = [];
    let indices: number[] = [];
    for (let i = 0; i < output["logits"].dims[1]; i++) {
      const s = output["logits"].dims[2] * i;
      const f = output["logits"].dims[2] * (i + 1);
      const data = output["logits"].data.slice(s, f);
      const classes = softmax(data);
      let max = 0;
      let maxIdx = 0;
      for (let j = 0; j < classes.length - 1; j++) {
        if (classes[j] > max) {
          max = classes[j];
          maxIdx = j;
        }
      }
      if (max > threshold) {
        classIndices.push(maxIdx);
        classConfidences.push(max);
        indices.push(i);
      }
    }
    let boxes = [];
    for (let i = 0; i < indices.length; i++) {
      const index = indices[i];
      let box = output["boxes"].data.slice(4 * index, 4 * (index + 1));
      box[0] = box[0] - box[2] / 2;
      box[1] = box[1] - box[3] / 2;
      boxes.push(box);
    }
    let res: ObjectDetectionResult = {
      objects: [],
      elapsed: elapsed,
    };
    for (let i = 0; i < indices.length; i++) {
      const cls = this.config?.classes.get(classIndices[i]);
      const color = this.config?.colors.get(classIndices[i]);
      const hex =
        "#" +
        componentToHex(color[0]) +
        componentToHex(color[1]) +
        componentToHex(color[2]);
      const box = boxes[i];
      res.objects.push({
        class: cls as string,
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
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}
