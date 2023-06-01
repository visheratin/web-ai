import * as ort from "onnxruntime-web";
import { softmax } from "./utils";
import { ImageProcessingResult } from "./interfaces";
import { prepareImagesTensor } from "../utils/prepare-image";
import { BaseImageModel } from "./base";

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
  results: ClassificationPrediction[] | ClassificationPrediction[][];
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
export class ClassificationModel extends BaseImageModel {
  /**
   * Processes the image and generates the classification predictions.
   *
   * @param input - either URL to the image or Buffer with the image.
   * @param num - maximum number of predictions to generate.
   *
   * @returns classification predictions.
   */
  process = async (inputs: string | ArrayBuffer | string[] | ArrayBuffer[], num = 3): Promise<ClassificationResult> => {
    if (!this.initialized || !this.preprocessor || !this.config) {
      throw Error("the model is not initialized");
    }
    if (typeof inputs === "string") {
      inputs = [inputs];
    }
    if (inputs instanceof ArrayBuffer) {
      inputs = [inputs];
    }
    const tensor = await prepareImagesTensor(inputs, this);
    const start = new Date();
    const output = await this.runInference(tensor, num);
    const end = new Date();
    const elapsed = (end.getTime() - start.getTime()) / 1000;
    const result: ClassificationResult = {
      results: output,
      elapsed: elapsed,
    };
    if (output.length === 1) {
      result.results = output[0];
    }
    return result;
  };

  private runInference = async (input: ort.Tensor, clsNum: number): Promise<ClassificationPrediction[][]> => {
    if (!this.initialized || !this.sessions || !this.config) {
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
    const logits = outputData[outputNames[0]];
    const result: ClassificationPrediction[][] = [];
    for (let i = 0; i < logits.dims[0]; i++) {
      const res: ClassificationPrediction[] = new Array(clsNum).fill({
        class: "unknown",
        confidence: 0,
      });
      // @ts-ignore
      const sm = softmax(logits.data.slice(i * logits.dims[1], (i + 1) * logits.dims[1]));
      for (let k = 0; k < sm.length; k++) {
        for (let j = 0; j < res.length; j++) {
          if (res[j].confidence < sm[k]) {
            const cls = this.config.classes.get(k);
            if (!cls) {
              continue;
            }
            res[j] = {
              class: cls,
              confidence: sm[k],
            };
            break;
          }
        }
      }
      res.sort((a, b) => b.confidence - a.confidence);
      result.push(res);
    }
    return result;
  };
}
