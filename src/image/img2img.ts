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
  data: ArrayBuffer;
  width: number;
  height: number;
};

/**
 * Model for classifying images.
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
  process = async (input: string | Buffer, num: number = 3): Promise<Img2ImgResult> => {
    if (!this.initialized || !this.preprocessor) {
      throw Error("the model is not initialized");
    }
    // @ts-ignore
    let image = await Jimp.read(input);
    const tensor = this.preprocessor.process(image);
    const start = new Date();
    const output = await this.runInference(tensor);
    const end = new Date();
    const elapsed = (end.getTime() - start.getTime()) / 1000;
    console.log(elapsed);
    const size = output.dims[2] * output.dims[3];
    const arrayBuffer = new ArrayBuffer(size * 4);
    const pixels = new Uint8ClampedArray(arrayBuffer);
    for (let i = 0; i < size; i++) {
      let value = output.data[i] as number;
      if (value < 0) {
        value = 0;
      } else {
        if (value > 1) {
          value = 1;
        }
      }
      value *= 255.0;
      pixels[4 * i] = value;

      value = output.data[size + i] as number;
      if (value < 0) {
        value = 0;
      } else {
        if (value > 1) {
          value = 1;
        }
      }
      value *= 255.0;
      pixels[4 * i + 1] = value;

      value = output.data[2 * size + i] as number;
      if (value < 0) {
        value = 0;
      } else {
        if (value > 1) {
          value = 1;
        }
      }
      value *= 255.0;
      pixels[4 * i + 2] = value;
      pixels[4 * i + 3] = 255;
    }
    return {
      data: arrayBuffer,
      width: output.dims[3],
      height: output.dims[2],
      elapsed: elapsed,
    };
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
