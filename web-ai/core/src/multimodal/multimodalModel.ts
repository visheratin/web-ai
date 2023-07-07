import { Session, Tokenizer } from "../common";
import { Img2TextModel } from "./img2text";
import { MultimodalModelType } from "./modelType";
import { models } from "./models";
import { ZeroShotClassificationModel } from "./zeroShot";

export interface InitMultimodalModelResult {
  model: MultimodalModel;
  elapsed: number;
}

export class MultimodalModel {
  static create = async (
    id: string,
    createSession: (path: string, proxy: boolean) => Promise<Session>,
    loadTokenizer: (path: string) => Promise<Tokenizer>,
    proxy = true
  ): Promise<InitMultimodalModelResult> => {
    for (const modelMetadata of models) {
      if (modelMetadata.id === id) {
        switch (modelMetadata.type) {
          case MultimodalModelType.ZeroShotClassification: {
            const model = new ZeroShotClassificationModel(modelMetadata);
            const elapsed = await model.init(
              createSession,
              loadTokenizer,
              proxy
            );
            return {
              model: model,
              elapsed: elapsed,
            };
          }
          case MultimodalModelType.Img2Text: {
            const model = new Img2TextModel(modelMetadata);
            const elapsed = await model.init(
              createSession,
              loadTokenizer,
              proxy
            );
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
