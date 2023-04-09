import * as ort from "onnxruntime-web";
import Jimp from "jimp";
import { ImageProcessingResult } from "./interfaces";
import { BaseImageModel } from "./base";

export type SegmentationResult = ImageProcessingResult & {
  canvas: HTMLCanvasElement | OffscreenCanvas;
};

export class SegmentationModel extends BaseImageModel {
  process = async (input: string | Buffer): Promise<SegmentationResult> => {
    if (!this.initialized || !this.preprocessor) {
      throw Error("the model is not initialized");
    }
    // @ts-ignore
    const image = await Jimp.read(input);
    const tensor = this.preprocessor.process(image).tensor;
    const start = new Date();
    const output = await this.runInference(tensor);
    const end = new Date();
    const elapsed = (end.getTime() - start.getTime()) / 1000;
    const argmax = this.argmaxColors(output);
    const size = output.dims[2] * output.dims[3] * 4;
    const arrayBuffer = new ArrayBuffer(size);
    const pixels = new Uint8ClampedArray(arrayBuffer);
    for (let i = 0; i < size; i += 4) {
      const color = argmax[i / 4];
      pixels[i] = color[0];
      pixels[i + 1] = color[1];
      pixels[i + 2] = color[2];
      pixels[i + 3] = 255;
    }
    const imageData = new ImageData(pixels, output.dims[2], output.dims[3]);
    const resCanvas = this.createCanvas(imageData.width, imageData.height);
    const ctx = resCanvas.getContext("2d");
    if (ctx instanceof OffscreenCanvasRenderingContext2D || ctx instanceof CanvasRenderingContext2D) {
      ctx.putImageData(imageData, 0, 0);
    } else {
      throw new Error("Invalid rendering context");
    }
    const result: SegmentationResult = {
      canvas: resCanvas,
      elapsed: elapsed,
    };
    return result;
  };

  createCanvas = (width: number, height: number) => {
    if (typeof OffscreenCanvas !== "undefined") {
      return new OffscreenCanvas(width, height);
    } else if (typeof document !== "undefined") {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      return canvas;
    } else {
      throw new Error("Canvas creation is not supported in this environment");
    }
  };

  getClass = (inputColor: Uint8ClampedArray | number[]): string => {
    if (!this.initialized || !this.config) {
      throw Error("the model is not initialized");
    }
    let className = "";
    let minDiff = Infinity;
    let diff = 0;
    for (const [idx, color] of this.config.colors) {
      diff =
        Math.abs(color[0] - inputColor[0]) + Math.abs(color[1] - inputColor[1]) + Math.abs(color[2] - inputColor[2]);
      if (diff < minDiff) {
        minDiff = diff;
        className = this.config?.classes.get(idx) as string;
      }
    }
    return className;
  };

  private argmaxColors = (tensor: ort.Tensor): number[][] => {
    if (!this.initialized || !this.config) {
      throw Error("the model is not initialized");
    }
    const modelClasses = this.config?.colors;
    const result: number[][] = [];
    const size = 128 * 128;
    const classNumbers = new Set<number>();
    for (let idx = 0; idx < size; idx++) {
      let maxIdx = 0;
      let maxValue = -1000;
      for (let i = 0; i < modelClasses.size; i++) {
        if ((tensor.data[idx + i * size] as number) > maxValue) {
          maxValue = tensor.data[idx + i * size] as number;
          maxIdx = i;
        }
      }
      classNumbers.add(maxIdx);
      const color = modelClasses.get(maxIdx);
      if (!color) {
        result.push([0, 0, 0]);
      } else {
        result.push(color);
      }
    }
    return result;
  };

  private runInference = async (input: ort.Tensor): Promise<ort.Tensor> => {
    if (!this.initialized || !this.sessions) {
      throw Error("the model is not initialized");
    }
    const session = this.sessions.get("model");
    if (!session) {
      throw Error("the model is absent in the sessions map");
    }
    const feeds: Record<string, ort.Tensor> = {};
    const inputNames = await session.inputNames();
    feeds[inputNames[0]] = input;
    const outputData = await session.run(feeds);
    const outputNames = await session.outputNames();
    const output = outputData[outputNames[0]];
    return output;
  };
}
