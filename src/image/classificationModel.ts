import Config from "./config";
import { ImageMetadata } from "./metadata";
import * as ort from "onnxruntime-web";
import { createSession } from "../session";
import Jimp from "jimp";
import Preprocessor from "./preprocessor";
import PreprocessorConfig from "./preprocessorConfig";
import { softmax } from "./utils";
import { IImageModel, ImageProcessingResult } from "./interfaces";

/**
 * Class predicted by the model.
 *
 * @param class - class name.
 * @param confidence - how confident the model is in the prediction. Value in range [0,1].
 */
export type ClassificationPrediction = {
  class: string;
  confidence: number;
};

/**
 * Output of the classification model.
 *
 * @param results - array of `ClassificationPrediction` values.
 * @param elapsed - time taken to process the input, in seconds.
 */
export type ClassificationResult = ImageProcessingResult & {
  results: ClassificationPrediction[];
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
export class ClassificationModel implements IImageModel {
  metadata: ImageMetadata;
  initialized: boolean;
  private config?: Config;
  private preprocessor?: Preprocessor;
  private session?: ort.InferenceSession;

  constructor(metadata: ImageMetadata) {
    this.metadata = metadata;
    this.initialized = false;
  }

  /**
   * Initializes the model for running.
   *
   * @returns Time taken to initialize the model, in seconds.
   */
  init = async (): Promise<number> => {
    const start = new Date();
    this.session = await createSession(this.metadata.modelPath);
    const preprocessorConfig = await PreprocessorConfig.fromFile(this.metadata.preprocessorPath);
    this.preprocessor = new Preprocessor(preprocessorConfig);
    this.config = await Config.fromFile(this.metadata.configPath);
    this.initialized = true;
    const end = new Date();
    const elapsed = (end.getTime() - start.getTime()) / 1000;
    return elapsed;
  };

  /**
   * Processes the image and generates the classification predictions.
   *
   * @param input - either URL to the image or Buffer with the image.
   * @param num - maximum number of predictions to generate.
   *
   * @returns classification predictions.
   */
  process = async (input: string | Buffer, num: number = 3): Promise<ClassificationResult> => {
    if (!this.initialized || !this.preprocessor || !this.config) {
      throw Error("the model is not initialized");
    }
    // @ts-ignore
    let image = await Jimp.read(input);
    const tensor = this.preprocessor.process(image);
    const start = new Date();
    const output = await this.runInference(tensor);
    const end = new Date();
    const elapsed = (end.getTime() - start.getTime()) / 1000;
    let res: ClassificationPrediction[] = new Array(num).fill({
      class: "unknown",
      confidence: 0,
    });
    // @ts-ignore
    const result = softmax(output.data);
    for (let i = 0; i < output.data.length; i++) {
      for (let j = 0; j < res.length; j++) {
        if (res[j].confidence < result[i]) {
          const cls = this.config.classes.get(i);
          if (!cls) {
            continue;
          }
          res[j] = {
            class: cls,
            confidence: result[i],
          };
          break;
        }
      }
    }
    return {
      results: res,
      elapsed: elapsed,
    };
  };

  private runInference = async (input: ort.Tensor): Promise<ort.Tensor> => {
    if (!this.initialized || !this.session) {
      throw Error("the model is not initialized");
    }
    const feeds: Record<string, ort.Tensor> = {};
    feeds[this.session.inputNames[0]] = input;
    const outputData = await this.session.run(feeds);
    const output = outputData[this.session.outputNames[0]];
    return output;
  };
}
