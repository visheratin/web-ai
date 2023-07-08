/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as ort from "onnxruntime-common";
import Jimp from "jimp";
import { softmax } from "./utils.js";
import { ImageProcessingResult } from "./interfaces.js";
import { BaseImageModel } from "./base.js";

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

export class ObjectDetectionModel extends BaseImageModel {
  process = async (input: string | Buffer): Promise<ObjectDetectionResult> => {
    if (
      !this.initialized ||
      !this.sessions ||
      !this.preprocessor ||
      !this.config
    ) {
      throw Error("the model is not initialized");
    }
    // @ts-ignore
    const image = await Jimp.read(input);
    const tensor = this.preprocessor.process(image).tensor;
    const start = new Date();
    const session = this.sessions.get("model");
    if (!session) {
      throw Error("the model is absent in the sessions map");
    }
    const feeds: Record<string, ort.Tensor> = {};
    const inputNames = await session.inputNames();
    feeds[inputNames[0]] = tensor;
    const output = await session.run(feeds);
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
      const hex =
        "#" +
        componentToHex(color[0]) +
        componentToHex(color[1]) +
        componentToHex(color[2]);
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
