import { ClassificationModel } from "./classificationModel";
import { ImageFeatureExtractionModel } from "./featureExtractionModel";
import { Img2ImgModel } from "./img2img";
import { IImageModel } from "./interfaces";
import { models } from "./models";
import { ImageModelType } from "./modelType";
import { ObjectDetectionModel } from "./objectDetectionModel";
import { SegmentationModel } from "./segmentationModel";

export interface InitImageModelResult {
  model: IImageModel;
  elapsed: number;
}

export class ImageModel {
  static create = async (id: string, cacheSizeMB = 500, proxy = true): Promise<InitImageModelResult> => {
    for (const modelMetadata of models) {
      if (modelMetadata.id === id) {
        switch (modelMetadata.type) {
          case ImageModelType.Classification: {
            const model = new ClassificationModel(modelMetadata);
            const elapsed = await model.init(cacheSizeMB, proxy);
            return {
              model: model,
              elapsed: elapsed,
            };
          }
          case ImageModelType.ObjectDetection: {
            const model = new ObjectDetectionModel(modelMetadata);
            const elapsed = await model.init(cacheSizeMB, proxy);
            return {
              model: model,
              elapsed: elapsed,
            };
          }
          case ImageModelType.Segmentation: {
            const model = new SegmentationModel(modelMetadata);
            const elapsed = await model.init(cacheSizeMB, proxy);
            return {
              model: model,
              elapsed: elapsed,
            };
          }
          case ImageModelType.Img2Img: {
            const model = new Img2ImgModel(modelMetadata);
            const elapsed = await model.init(cacheSizeMB, proxy);
            return {
              model: model,
              elapsed: elapsed,
            };
          }
          case ImageModelType.FeatureExtraction: {
            const model = new ImageFeatureExtractionModel(modelMetadata);
            const elapsed = await model.init(cacheSizeMB, proxy);
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
