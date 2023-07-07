import * as ort from "onnxruntime-common";
import Jimp from "jimp";
import Preprocessor from "./preprocessor";

export const prepareImagesTensor = async (
  inputs: string[] | ArrayBuffer[],
  preprocessor?: Preprocessor
): Promise<ort.Tensor> => {
  if (!preprocessor) {
    throw Error("the model is not initialized");
  }
  const tensors: ort.Tensor[] = new Array(inputs.length);
  for (let i = 0; i < inputs.length; i++) {
    // @ts-ignore
    const image = await Jimp.default.read(inputs[i]);
    tensors[i] = preprocessor.process(image).tensor;
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
