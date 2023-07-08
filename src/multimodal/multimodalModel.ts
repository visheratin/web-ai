import { Session, Tokenizer } from "../common.js";
import { Img2TextModel } from "./img2text.js";
import { ModelType } from "./modelType.js";
import { models } from "./models.js";
import { ZeroShotClassificationModel } from "./zeroShot.js";

export interface InitMultimodalModelResult {
  model: MultimodalModel;
  elapsed: number;
}

export class MultimodalModel {
  static create = async (
    id: string,
    proxy = true
  ): Promise<InitMultimodalModelResult> => {
    for (const modelMetadata of models) {
      if (modelMetadata.id === id) {
        switch (modelMetadata.type) {
          case ModelType.ZeroShotClassification: {
            const model = new ZeroShotClassificationModel(modelMetadata);
            const elapsed = await model.init(proxy);
            return {
              model: model,
              elapsed: elapsed,
            };
          }
          case ModelType.Img2Text: {
            const model = new Img2TextModel(modelMetadata);
            const elapsed = await model.init(proxy);
            return {
              model: model,
              elapsed: elapsed,
            };
          }
        }
      }
    }
    throw Error("there is no text model with specified id");
  };
}
