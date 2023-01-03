import { FeatureExtractionModel } from "./featureExtractionModel";
import { ITextModel } from "./interfaces";
import { models } from "./models";
import { TextModelType } from "./modeType";
import { Seq2SeqModel } from "./seq2seqModel";

export interface InitTextModelResult {
  model: ITextModel;
  elapsed: number;
}

export class TextModel {
  static create = async (
    id: string,
    cache_size_mb: number = 500,
    proxy: boolean = true,
  ): Promise<InitTextModelResult> => {
    for (let modelMetadata of models) {
      if (modelMetadata.id === id) {
        switch (modelMetadata.type) {
          case TextModelType.FeatureExtraction: {
            let model = new FeatureExtractionModel(modelMetadata);
            const elapsed = await model.init(cache_size_mb, proxy);
            return {
              model: model,
              elapsed: elapsed,
            };
          }
          case TextModelType.Seq2Seq: {
            let model = new Seq2SeqModel(modelMetadata);
            const elapsed = await model.init(cache_size_mb, proxy);
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
