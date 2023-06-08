import * as ort from "onnxruntime-node";
import { BaseMultimodalModel } from "../multimodal/base";
import { BaseImageModel } from "../image/base";
import Jimp from "jimp";

export const prepareImagesTensor = async (
  inputs: string[] | ArrayBuffer[],
  model: BaseImageModel | BaseMultimodalModel,
): Promise<ort.Tensor> => {
  if (!model.initialized || !model.preprocessor) {
    throw Error("the model is not initialized");
  }
  const tensors: ort.Tensor[] = new Array(inputs.length);
  for (let i = 0; i < inputs.length; i++) {
    // @ts-ignore
    const image = await Jimp.read(inputs[i]);
    tensors[i] = model.preprocessor.process(image).tensor;
  }
  const resultData = new Float32Array(tensors.length * tensors[0].data.length);
  for (let i = 0; i < tensors.length; i++) {
    for (let j = 0; j < tensors[0].data.length; j++) {
      // @ts-ignore
      resultData[i * tensors[0].data.length + j] = tensors[i].data[j];
    }
  }
  return new ort.Tensor("float32", resultData, [
    tensors.length,
    tensors[0].dims[1],
    tensors[0].dims[2],
    tensors[0].dims[3],
  ]);
};
