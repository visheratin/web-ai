import { ClassificationModel } from "./classificationModel";
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
  static create = async (
    id: string,
    cache_size_mb: number = 500,
    proxy: boolean = true,
  ): Promise<InitImageModelResult> => {
    for (let modelMetadata of models) {
      if (modelMetadata.id === id) {
        switch (modelMetadata.type) {
          case ImageModelType.Classification: {
            let model = new ClassificationModel(modelMetadata);
            const elapsed = await model.init(cache_size_mb, proxy);
            return {
              model: model,
              elapsed: elapsed,
            };
          }
          case ImageModelType.ObjectDetection: {
            let model = new ObjectDetectionModel(modelMetadata);
            const elapsed = await model.init(cache_size_mb, proxy);
            return {
              model: model,
              elapsed: elapsed,
            };
          }
          case ImageModelType.Segmentation: {
            let model = new SegmentationModel(modelMetadata);
            const elapsed = await model.init(cache_size_mb, proxy);
            return {
              model: model,
              elapsed: elapsed,
            };
          }
          case ImageModelType.Img2Img: {
            let model = new Img2ImgModel(modelMetadata);
            const elapsed = await model.init(cache_size_mb, proxy);
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
