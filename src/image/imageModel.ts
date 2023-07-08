import { Session } from "../common.js";
import { ClassificationModel } from "./classificationModel.js";
import { FeatureExtractionModel } from "./featureExtractionModel.js";
import { Img2ImgModel } from "./img2imgModel.js";
import { models } from "./models.js";
import { ModelType } from "./modelType.js";
import { ObjectDetectionModel } from "./objectDetectionModel.js";
import { SegmentAnythingModel } from "./samModel.js";
import { SegmentationModel } from "./segmentationModel.js";

export interface InitImageModelResult {
  model: ImageModel;
  elapsed: number;
}

export class ImageModel {
  static create = async (
    id: string,
    proxy = true
  ): Promise<InitImageModelResult> => {
    for (const modelMetadata of models) {
      if (modelMetadata.id === id) {
        switch (modelMetadata.type) {
          case ModelType.Classification: {
            const model = new ClassificationModel(modelMetadata);
            const elapsed = await model.init(proxy);
            return {
              model: model,
              elapsed: elapsed,
            };
          }
          case ModelType.ObjectDetection: {
            const model = new ObjectDetectionModel(modelMetadata);
            const elapsed = await model.init(proxy);
            return {
              model: model,
              elapsed: elapsed,
            };
          }
          case ModelType.Segmentation: {
            const model = new SegmentationModel(modelMetadata);
            const elapsed = await model.init(proxy);
            return {
              model: model,
              elapsed: elapsed,
            };
          }
          case ModelType.Img2Img: {
            const model = new Img2ImgModel(modelMetadata);
            const elapsed = await model.init(proxy);
            return {
              model: model,
              elapsed: elapsed,
            };
          }
          case ModelType.FeatureExtraction: {
            const model = new FeatureExtractionModel(modelMetadata);
            const elapsed = await model.init(proxy);
            return {
              model: model,
              elapsed: elapsed,
            };
          }
          case ModelType.SegmentAnything: {
            const model = new SegmentAnythingModel(modelMetadata);
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
