import { MultimodalModelType } from "./modelType";
import { models } from "./models";
import { ZeroShotClassificationModel } from "./zeroShot";

export interface InitMultimodalModelResult {
  model: MultimodalModel;
  elapsed: number;
}

export class MultimodalModel {
  static create = async (id: string, proxy = true): Promise<InitMultimodalModelResult> => {
    for (const modelMetadata of models) {
      if (modelMetadata.id === id) {
        switch (modelMetadata.type) {
          case MultimodalModelType.ZeroShotClassification: {
            const model = new ZeroShotClassificationModel(modelMetadata);
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
