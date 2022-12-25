import { ClassificationModel } from "./classificationModel";
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
  static create = async (id: string): Promise<InitImageModelResult> => {
    for (let modelMetadata of models) {
      if (modelMetadata.id === id) {
        switch (modelMetadata.type) {
          case ImageModelType.Classification: {
            let model = new ClassificationModel(modelMetadata);
            const elapsed = await model.init();
            return {
              model: model,
              elapsed: elapsed,
            };
          }
          case ImageModelType.ObjectDetection: {
            let model = new ObjectDetectionModel(modelMetadata);
            const elapsed = await model.init();
            return {
              model: model,
              elapsed: elapsed,
            };
          }
          case ImageModelType.Segmentation: {
            let model = new SegmentationModel(modelMetadata);
            const elapsed = await model.init();
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
