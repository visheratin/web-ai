import { ClassificationModel } from "./classificationModel";
import { ImageFeatureExtractionModel } from "./featureExtractionModel";
import { Img2ImgModel } from "./img2imgModel";
import { models } from "./models";
import { ImageModelType } from "./modelType";
import { ObjectDetectionModel } from "./objectDetectionModel";
import { SegmentationModel } from "./segmentationModel";

export interface InitImageModelResult {
  model: ImageModel;
  elapsed: number;
}

export class ImageModel {
  static create = async (id: string, proxy = true): Promise<InitImageModelResult> => {
    for (const modelMetadata of models) {
      if (modelMetadata.id === id) {
        switch (modelMetadata.type) {
          case ImageModelType.Classification: {
            const model = new ClassificationModel(modelMetadata);
            const elapsed = await model.init(proxy);
            return {
              model: model,
              elapsed: elapsed,
            };
          }
          case ImageModelType.ObjectDetection: {
            const model = new ObjectDetectionModel(modelMetadata);
            const elapsed = await model.init(proxy);
            return {
              model: model,
              elapsed: elapsed,
            };
          }
          case ImageModelType.Segmentation: {
            const model = new SegmentationModel(modelMetadata);
            const elapsed = await model.init(proxy);
            return {
              model: model,
              elapsed: elapsed,
            };
          }
          case ImageModelType.Img2Img: {
            const model = new Img2ImgModel(modelMetadata);
            const elapsed = await model.init(proxy);
            return {
              model: model,
              elapsed: elapsed,
            };
          }
          case ImageModelType.FeatureExtraction: {
            const model = new ImageFeatureExtractionModel(modelMetadata);
            const elapsed = await model.init(proxy);
            return {
              model: model,
              elapsed: elapsed,
            };
          }
        }
      }
    }
    throw Error("there is no image model with specified id");
  };
}
