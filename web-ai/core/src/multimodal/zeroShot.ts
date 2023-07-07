import * as ort from "onnxruntime-common";
import {
  ClassificationPrediction,
  ImageProcessingResult,
  prepareImagesTensor,
  normalize,
  softmax,
} from "../image";
import { prepareTextTensors } from "../text";
import { BaseMultimodalModel } from "./base";

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
    const result = await this.runInference(
      imageTensor,
      textTensors[0],
      textTensors[1],
      classes
    );
    const end = new Date();
    const elapsed = (end.getTime() - start.getTime()) / 1000;
    result.elapsed = elapsed;
    return result;
  };

  private runInference = async (
    imageInput: ort.Tensor,
    inputIDs: ort.Tensor,
    attentionMask: ort.Tensor,
    classes: string[]
  ): Promise<ZeroShotResult> => {
    if (!this.initialized || !this.sessions) {
      throw Error("the model is not initialized");
    }
    const feeds: Record<string, ort.Tensor> = {};
    feeds["pixel_values"] = imageInput;
    feeds["input_ids"] = inputIDs;
    feeds["attention_mask"] = attentionMask;
    const session = this.sessions.get("model");
    if (!session) {
      throw Error("the model is absent in the sessions map");
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

    let imageEmbeds: number[][] = [];
    if (outputNames.includes("image_embeds")) {
      imageEmbeds = new Array(outputData["image_embeds"].dims[0]);
      for (let i = 0; i < outputData["image_embeds"].dims[0]; i++) {
        imageEmbeds[i] = new Array(outputData["image_embeds"].dims[1]);
        for (let j = 0; j < outputData["image_embeds"].dims[1]; j++) {
          imageEmbeds[i][j] = Number(
            outputData["image_embeds"].data[
              i * outputData["image_embeds"].dims[1] + j
            ]
          );
        }
      }
      for (let i = 0; i < imageEmbeds.length; i++) {
        imageEmbeds[i] = normalize(imageEmbeds[i]);
      }
    }

    let textEmbeds: number[][] = [];
    if (outputNames.includes("text_embeds")) {
      textEmbeds = new Array(outputData["text_embeds"].dims[0]);
      for (let i = 0; i < outputData["text_embeds"].dims[0]; i++) {
        textEmbeds[i] = new Array(outputData["text_embeds"].dims[1]);
        for (let j = 0; j < outputData["text_embeds"].dims[1]; j++) {
          textEmbeds[i][j] = Number(
            outputData["text_embeds"].data[
              i * outputData["text_embeds"].dims[1] + j
            ]
          );
        }
      }
      for (let i = 0; i < textEmbeds.length; i++) {
        textEmbeds[i] = normalize(textEmbeds[i]);
      }
    }
    const result: ZeroShotResult = {
      results: predictions,
      imageFeatures: imageEmbeds,
      textFeatures: textEmbeds,
      elapsed: 0,
    };
    if (predictions.length === 1) {
      result.results = predictions[0];
    }
    return result;
  };
}
