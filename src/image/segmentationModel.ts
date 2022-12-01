// @ts-nocheck
import Config from "./config";
import { ImageMetadata } from "./metadata";
import * as ort from "onnxruntime-web";
import { createSession } from "../session";
import Jimp from "jimp";
import { Tensor } from "../tensor";
import Preprocessor from "./preprocessor";
import PreprocessorConfig from "./preprocessorConfig";

type SegmentationResult = {
  data: HTMLCanvasElement;
  elapsed: number;
};

export class SegmentationModel {
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
    input: string | ArrayBuffer
  ): Promise<SegmentationResult> => {
    const image = await Jimp.read(input);
    const tensor = this.preprocessor.process(image);
    const start = new Date();
    const output = await this.runInference(tensor);
    const end = new Date();
    const elapsed = (end.getTime() - start.getTime()) / 1000;
    const argmax = this.argmaxColors(output.ortTensor);
    const size = output.ortTensor.dims[2] * output.ortTensor.dims[3] * 4;
    const arrayBuffer = new ArrayBuffer(size);
    const pixels = new Uint8ClampedArray(arrayBuffer);
    for (let i = 0; i < size; i += 4) {
      const color = argmax[i / 4];
      pixels[i] = color[0];
      pixels[i + 1] = color[1];
      pixels[i + 2] = color[2];
      pixels[i + 3] = 255;
    }
    const imageData = new ImageData(
      pixels,
      output.ortTensor.dims[2],
      output.ortTensor.dims[3]
    );
    let resCanvas = document.createElement("canvas");
    resCanvas.width = imageData.width;
    resCanvas.height = imageData.height;
    resCanvas.getContext("2d").putImageData(imageData, 0, 0);
    const result: SegmentationResult = {
      data: resCanvas,
      elapsed: elapsed,
    };
    return result;
  };

  getClass = (inputColor: Uint8ClampedArray | number[]): string => {
    let className = "";
    let minDiff = Infinity;
    let diff = 0;
    for (let [idx, color] of this.config?.colors) {
      diff =
        Math.abs(color[0] - inputColor[0]) +
        Math.abs(color[1] - inputColor[1]) +
        Math.abs(color[2] - inputColor[2]);
      if (diff < minDiff) {
        minDiff = diff;
        className = this.config?.classes.get(idx);
      }
    }
    return className;
  };

  private argmaxColors = (tensor: ort.Tensor): number[][] => {
    const modelClasses = this.config?.colors;
    let result: number[][] = [];
    const size = 128 * 128;
    let classNumbers = new Set<number>();
    for (let idx = 0; idx < size; idx++) {
      let maxIdx = 0;
      let maxValue = -1000;
      for (let i = 0; i < modelClasses.size; i++) {
        if (tensor.data[idx + i * size] > maxValue) {
          maxValue = tensor.data[idx + i * size];
          maxIdx = i;
        }
      }
      classNumbers.add(maxIdx);
      result.push(modelClasses?.get(maxIdx));
    }
    return result;
  };

  private runInference = async (input: ort.Tensor): Promise<Tensor> => {
    const feeds: Record<string, ort.Tensor> = {};
    feeds[this.session!.inputNames[0]] = input;
    const outputData = await this.session.run(feeds);
    const output = outputData[this.session.outputNames[0]];
    return new Tensor(output);
  };
}
