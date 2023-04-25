import * as ort from "onnxruntime-web";
import { BaseTextModel } from "../text/base";
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

export const prepareTextTensors = async (
  inputs: string[],
  model: BaseTextModel | BaseMultimodalModel,
  padTokenID: number,
): Promise<ort.TypedTensor<"int64">[]> => {
  if (!model.initialized || !model.tokenizer) {
    throw Error("the model is not initialized");
  }
  let maxLen = 0;
  const inputIDs: number[][] = new Array(inputs.length);
  const attentionMasks: number[][] = new Array(inputs.length);
  for (let i = 0; i < inputs.length; i++) {
    const tokens = await model.tokenizer.encode(inputs[i], true);
    inputIDs[i] = new Array(tokens.length);
    for (let j = 0; j < tokens.length; j++) {
      inputIDs[i][j] = tokens[j];
    }
    attentionMasks[i] = new Array(tokens.length).fill(1);
    if (tokens.length > maxLen) {
      maxLen = tokens.length;
    }
  }
  for (let i = 0; i < inputs.length; i++) {
    while (inputIDs[i].length < maxLen) {
      inputIDs[i].push(padTokenID);
      attentionMasks[i].push(0);
    }
  }
  const inputIDsData = new BigInt64Array(inputs.length * maxLen);
  for (let i = 0; i < inputs.length; i++) {
    for (let j = 0; j < maxLen; j++) {
      inputIDsData[i * maxLen + j] = BigInt(inputIDs[i][j]);
    }
  }
  const attentionMasksData = new BigInt64Array(inputs.length * maxLen);
  for (let i = 0; i < inputs.length; i++) {
    for (let j = 0; j < maxLen; j++) {
      attentionMasksData[i * maxLen + j] = BigInt(attentionMasks[i][j]);
    }
  }
  const inputIDsTensor = new ort.Tensor("int64", inputIDsData, [inputs.length, maxLen]);
  const attentionMaskTensor = new ort.Tensor("int64", attentionMasksData, [inputs.length, maxLen]);
  return [inputIDsTensor, attentionMaskTensor];
};
