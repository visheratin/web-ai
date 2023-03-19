import Config from "./config";
import { ImageMetadata } from "./metadata";
import * as ort from "onnxruntime-web";
import { createSession } from "../sessionController";
import Jimp from "jimp";
import Preprocessor from "./preprocessor";
import PreprocessorConfig from "./preprocessorConfig";
import { IImageModel, ImageProcessingResult } from "./interfaces";
import { Session, SessionParams } from "../session";
import * as Comlink from "comlink";

type SegmentationResult = ImageProcessingResult & {
  canvas: HTMLCanvasElement;
};

export class SegmentationModel implements IImageModel {
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

  init = async (proxy = true): Promise<number> => {
    const start = new Date();
    this.session = await createSession(this.metadata.modelPath, proxy);
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

  process = async (input: string | Buffer): Promise<SegmentationResult> => {
    if (!this.initialized || !this.preprocessor) {
      throw Error("the model is not initialized");
    }
    // @ts-ignore
    const image = await Jimp.read(input);
    const tensor = this.preprocessor.process(image);
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
    const resCanvas = document.createElement("canvas");
    resCanvas.width = imageData.width;
    resCanvas.height = imageData.height;
    resCanvas.getContext("2d")?.putImageData(imageData, 0, 0);
    const result: SegmentationResult = {
      canvas: resCanvas,
      elapsed: elapsed,
    };
    return result;
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
    if (!this.initialized || !this.session) {
      throw Error("the model is not initialized");
    }
    const feeds: Record<string, ort.Tensor> = {};
    const inputNames = await this.session.inputNames();
    feeds[inputNames[0]] = input;
    const outputData = await this.session.run(feeds);
    const outputNames = await this.session.outputNames();
    const output = outputData[outputNames[0]];
    return output;
  };
}
