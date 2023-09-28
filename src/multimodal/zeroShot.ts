import * as ort from "onnxruntime-common";
import {
  ClassificationPrediction,
  ImageProcessingResult,
  prepareImagesTensor,
  normalize,
  softmax,
} from "../image.js";
import { prepareTextTensors } from "../text.js";
import { BaseMultimodalModel } from "./base.js";
import { Tensor } from "../common.js";

interface textInferenceResult {
  embedding: number[][];
  outputTensor: ort.Tensor;
}

interface imageInferenceResult {
  embedding: number[][];
  outputTensor: ort.Tensor;
}

export type ZeroShotResult = ImageProcessingResult & {
  results: ClassificationPrediction[] | ClassificationPrediction[][];
  textFeatures: number[][];
  imageFeatures: number[][];
};

export class ZeroShotClassificationModel extends BaseMultimodalModel {
  process = async (
    inputs: string | string[],
    classes: string[]
  ): Promise<ZeroShotResult> => {
    if (!this.initialized || !this.preprocessor || !this.tokenizer) {
      throw Error("the model is not initialized");
    }
    if (typeof inputs === "string") {
      inputs = [inputs];
    }
    const start = new Date();
    const imageTensor = await prepareImagesTensor(inputs, this.preprocessor);
    const textTensors = await prepareTextTensors(
      classes,
      this.tokenizer,
      true,
      this.metadata.tokenizerParams.padTokenID
    );

    const [imageEmbeds, textEmbeds] = await Promise.all([
      this.imageInference(imageTensor),
      this.textInference(textTensors[0], textTensors[1]),
    ]);

    const result = await this.generateLogits(textEmbeds, imageEmbeds, classes);
    const end = new Date();
    const elapsed = (end.getTime() - start.getTime()) / 1000;
    result.elapsed = elapsed;
    return result;
  };

  embedImages = async (inputs: string | string[]): Promise<number[][]> => {
    if (!this.initialized || !this.preprocessor || !this.tokenizer) {
      throw Error("the model is not initialized");
    }
    if (typeof inputs === "string") {
      inputs = [inputs];
    }
    const imageTensor = await prepareImagesTensor(inputs, this.preprocessor);
    const imageEmbeds = await this.imageInference(imageTensor);
    return imageEmbeds.embedding;
  };

  embedTexts = async (inputs: string | string[]): Promise<number[][]> => {
    if (!this.initialized || !this.tokenizer) {
      throw Error("the model is not initialized");
    }
    if (typeof inputs === "string") {
      inputs = [inputs];
    }
    const textTensors = await prepareTextTensors(
      inputs,
      this.tokenizer,
      true,
      this.metadata.tokenizerParams.padTokenID
    );
    const textEmbeds = await this.textInference(textTensors[0], textTensors[1]);
    return textEmbeds.embedding;
  };

  private imageInference = async (
    imageInput: ort.Tensor
  ): Promise<imageInferenceResult> => {
    if (!this.initialized || !this.sessions) {
      throw Error("the model is not initialized");
    }
    const feeds: Record<string, ort.Tensor> = {};
    feeds["pixel_values"] = imageInput;
    const session = this.sessions.get("image");
    if (!session) {
      throw Error("the image model is absent in the sessions map");
    }
    const outputData = await session.run(feeds);
    const outputNames = await session.outputNames();

    if (!outputNames.includes("image_embeds")) {
      throw Error("the image model does not contain image_embeds output");
    }
    let imageEmbeds: number[][] = [];
    imageEmbeds = new Array(outputData["image_embeds"].dims[0]);
    const tensor = new Tensor(outputData["image_embeds"]);
    for (let i = 0; i < outputData["image_embeds"].dims[0]; i++) {
      imageEmbeds[i] = new Array(outputData["image_embeds"].dims[1]);
      for (let j = 0; j < outputData["image_embeds"].dims[1]; j++) {
        imageEmbeds[i][j] = tensor.at([i, j]) as number;
      }
    }
    for (let i = 0; i < imageEmbeds.length; i++) {
      imageEmbeds[i] = normalize(imageEmbeds[i]);
    }
    return {
      embedding: imageEmbeds,
      outputTensor: outputData["image_embeds"],
    };
  };

  private textInference = async (
    inputIDs: ort.Tensor,
    attentionMask: ort.Tensor
  ): Promise<textInferenceResult> => {
    if (!this.initialized || !this.sessions) {
      throw Error("the model is not initialized");
    }
    const feeds: Record<string, ort.Tensor> = {};
    feeds["input_ids"] = inputIDs;
    feeds["attention_mask"] = attentionMask;
    const session = this.sessions.get("text");
    if (!session) {
      throw Error("the text model is absent in the sessions map");
    }
    const outputData = await session.run(feeds);
    const outputNames = await session.outputNames();

    if (!outputNames.includes("text_embeds")) {
      throw Error("the model does not contain text_embeds output");
    }
    let textEmbeds: number[][] = [];
    const tensor = new Tensor(outputData["text_embeds"]);
    textEmbeds = new Array(outputData["text_embeds"].dims[0]);
    for (let i = 0; i < outputData["text_embeds"].dims[0]; i++) {
      textEmbeds[i] = new Array(outputData["text_embeds"].dims[1]);
      for (let j = 0; j < outputData["text_embeds"].dims[1]; j++) {
        textEmbeds[i][j] = tensor.at([i, j]) as number;
      }
    }
    for (let i = 0; i < textEmbeds.length; i++) {
      textEmbeds[i] = normalize(textEmbeds[i]);
    }
    return {
      embedding: textEmbeds,
      outputTensor: outputData["text_embeds"],
    };
  };

  imageLogits = async (
    imageEmbeds: number[][],
    textEmbeds: number[][]
  ): Promise<number[][]> => {
    if (!this.initialized || !this.sessions) {
      throw Error("the model is not initialized");
    }
    const feeds: Record<string, ort.Tensor> = {};
    feeds["text_embeds"] = new ort.Tensor(
      Float32Array.from(textEmbeds.flat()),
      [textEmbeds.length, textEmbeds[0].length]
    );
    feeds["image_embeds"] = new ort.Tensor(
      Float32Array.from(imageEmbeds.flat()),
      [imageEmbeds.length, imageEmbeds[0].length]
    );
    const session = this.sessions.get("combine");
    if (!session) {
      throw Error("the combine model is absent in the sessions map");
    }
    const outputData = await session.run(feeds);
    const outputNames = await session.outputNames();

    if (!outputNames.includes("logits_per_image")) {
      throw Error("the model does not contain logits_per_image output");
    }
    const logits = outputData["logits_per_image"];
    const predictions: number[][] = [];
    for (let i = 0; i < logits.dims[0]; i++) {
      const sm = softmax(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        logits.data.slice(i * logits.dims[1], (i + 1) * logits.dims[1])
      );
      predictions.push(sm);
    }
    return predictions;
  };

  private generateLogits = async (
    textResults: textInferenceResult,
    imageResults: imageInferenceResult,
    classes: string[]
  ): Promise<ZeroShotResult> => {
    if (!this.initialized || !this.sessions) {
      throw Error("the model is not initialized");
    }
    const feeds: Record<string, ort.Tensor> = {};
    feeds["text_embeds"] = textResults.outputTensor;
    feeds["image_embeds"] = imageResults.outputTensor;
    const session = this.sessions.get("combine");
    if (!session) {
      throw Error("the combine model is absent in the sessions map");
    }
    const outputData = await session.run(feeds);
    const outputNames = await session.outputNames();

    if (!outputNames.includes("logits_per_image")) {
      throw Error("the model does not contain logits_per_image output");
    }
    const logits = outputData["logits_per_image"];
    const predictions: ClassificationPrediction[][] = [];
    for (let i = 0; i < logits.dims[0]; i++) {
      const res: ClassificationPrediction[] = new Array(classes.length).fill({
        class: "unknown",
        confidence: 0,
      });
      const sm = softmax(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        logits.data.slice(i * logits.dims[1], (i + 1) * logits.dims[1])
      );
      for (let i = 0; i < sm.length; i++) {
        res[i] = {
          class: classes[i],
          confidence: sm[i],
        };
      }
      res.sort((a, b) => b.confidence - a.confidence);
      predictions.push(res);
    }

    const result: ZeroShotResult = {
      results: predictions,
      imageFeatures: imageResults.embedding,
      textFeatures: textResults.embedding,
      elapsed: 0,
    };
    if (predictions.length === 1) {
      result.results = predictions[0];
    }
    return result;
  };
}
