import { ImageMetadata } from "./metadata";
import * as ort from "onnxruntime-web";
import { createSession } from "../sessionController";
import Jimp from "jimp";
import Preprocessor from "./preprocessor";
import PreprocessorConfig from "./preprocessorConfig";
import { IImageModel, ImageProcessingResult } from "./interfaces";
import { Session } from "../session";
import * as Comlink from "comlink";

/**
 * Output of the image-to-image model.
 *
 * @param data - array buffer with the resulting image.
 */
export type Img2ImgResult = ImageProcessingResult & {
  data: ImageData;
};

/**
 * Model for generating images from images.
 *
 * @implements IImageModel
 *
 * @remarks
 * The model is initialized via `init()` function. The model cannot be used if it is not initialized.
 *
 * @param metadata - information about the model.
 * @param initialized - flag indicating if the model was initialized.
 */
export class Img2ImgModel implements IImageModel {
  metadata: ImageMetadata;
  initialized: boolean;
  private preprocessor?: Preprocessor;
  private session?: Session | Comlink.Remote<Session>;

  constructor(metadata: ImageMetadata) {
    this.metadata = metadata;
    this.initialized = false;
  }

  /**
   * Initializes the model for running.
   *
   * @returns Time taken to initialize the model, in seconds.
   */
  init = async (cache_size_mb: number = 500, proxy: boolean = true): Promise<number> => {
    const start = new Date();
    this.session = await createSession(this.metadata.modelPath, cache_size_mb, proxy);
    const preprocessorConfig = await PreprocessorConfig.fromFile(this.metadata.preprocessorPath);
    this.preprocessor = new Preprocessor(preprocessorConfig);
    this.initialized = true;
    const end = new Date();
    const elapsed = (end.getTime() - start.getTime()) / 1000;
    return elapsed;
  };

  /**
   * Processes the image and generates the image from the input.
   *
   * @param input - either URL to the image or Buffer with the image.
   *
   * @returns generated image.
   */
  process = async (input: string | ArrayBuffer, resize: number = 0): Promise<Img2ImgResult> => {
    if (!this.initialized || !this.preprocessor) {
      throw Error("the model is not initialized");
    }
    // @ts-ignore
    let image = await Jimp.read(input);
    if (resize > 0) {
      image = this.prepareImage(image);
    }
    const tensor = this.preprocessor.process(image);
    const start = new Date();
    const output = await this.runInference(tensor);
    const end = new Date();
    const elapsed = (end.getTime() - start.getTime()) / 1000;
    let startX = 0;
    let startY = 0;
    let endX = output.dims[3];
    let endY = output.dims[2];
    if (this.preprocessor && this.preprocessor.config && this.preprocessor.config.pad) {
      const padSize = this.preprocessor.config.padSize;
      const paddedWidth = Math.ceil(image.bitmap.width / padSize) * padSize;
      const xDiff = paddedWidth - image.bitmap.width;
      const paddedHeight = Math.ceil(image.bitmap.height / padSize) * padSize;
      const yDiff = paddedHeight - image.bitmap.height;
      const xRatio = output.dims[3] / paddedWidth;
      const yRatio = output.dims[2] / paddedHeight;
      const xPad = Math.floor((xDiff * xRatio) / 2);
      const yPad = Math.floor((yDiff * yRatio) / 2);
      startX = xPad;
      startY = yPad;
      endX = Math.ceil(output.dims[3] - xPad);
      endY = Math.ceil(output.dims[2] - yPad);
    }
    const width = endX - startX;
    const height = endY - startY;
    const size = output.dims[2] * output.dims[3];
    const arrayBuffer = new ArrayBuffer(width * height * 4);
    const pixels = new Uint8ClampedArray(arrayBuffer);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixIdx = 4 * (y * width + x);
        const tensorIdx = (y + startY) * output.dims[3] + x + startX;
        let value = output.data[tensorIdx] as number;
        if (value < 0) {
          value = 0;
        } else {
          if (value > 1) {
            value = 1;
          }
        }
        value *= 255.0;
        pixels[pixIdx] = value;

        value = output.data[size + tensorIdx] as number;
        if (value < 0) {
          value = 0;
        } else {
          if (value > 1) {
            value = 1;
          }
        }
        value *= 255.0;
        pixels[pixIdx + 1] = value;

        value = output.data[2 * size + tensorIdx] as number;
        if (value < 0) {
          value = 0;
        } else {
          if (value > 1) {
            value = 1;
          }
        }
        value *= 255.0;
        pixels[pixIdx + 2] = value;
        pixels[pixIdx + 3] = 255;
      }
    }
    let imageData = new ImageData(pixels, width, height);
    return {
      data: imageData,
      elapsed: elapsed,
    };
  };

  private prepareImage = (image: Jimp): Jimp => {
    const { width, height } = image.bitmap;
    const maxDimension = Math.max(width, height);
    const scale = 300 / maxDimension;
    const newWidth = width * scale;
    const newHeight = height * scale;
    return image.resize(newWidth, newHeight);
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
