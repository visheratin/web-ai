import Config from "./config";
import { Metadata } from "./metadata";
import * as ort from "onnxruntime-web";
import { createSession } from "../session";
import Jimp from "jimp";
import { Tensor } from "../tensor";
import Preprocessor from "./preprocessor";
import PreprocessorConfig from "./preprocessorConfig";
import { softmax } from "./utils";

export type ClassificationPrediction = {
  class: string;
  confidence: number;
};

export type ClassificationResult = {
  results: ClassificationPrediction[];
  elapsed: number;
};

export class ClassificationModel {
  metadata: Metadata;
  private config: Config | null;
  private preprocessor: Preprocessor;
  private session: ort.InferenceSession | null;

  constructor(metadata: Metadata, config: Config | null) {
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
    num: number = 3
  ): Promise<ClassificationResult> => {
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
    const result = softmax(output.ortTensor.data);
    for (let i = 0; i < output.ortTensor.data.length; i++) {
      for (let j = 0; j < res.length; j++) {
        if (res[j].confidence < result[i]) {
          res[j] = {
            class: this.config.classes.get(i),
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

  private runInference = async (input: ort.Tensor): Promise<Tensor> => {
    const feeds: Record<string, ort.Tensor> = {};
    feeds[this.session!.inputNames[0]] = input;
    const outputData = await this.session.run(feeds);
    const output = outputData[this.session.outputNames[0]];
    return new Tensor(output);
  };
}
