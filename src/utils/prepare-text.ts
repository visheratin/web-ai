import * as ort from "onnxruntime-web";
import { BaseTextModel } from "../text/base";
import { BaseMultimodalModel } from "../multimodal/base";

export const prepareTextTensors = async (
  inputs: string[],
  model: BaseTextModel | BaseMultimodalModel,
  addSpecialTokens: boolean,
  padTokenID: number,
  bosTokenID?: number,
): Promise<ort.TypedTensor<"int64">[]> => {
  if (!model.initialized || !model.tokenizer) {
    throw Error("the model is not initialized");
  }
  let maxLen = 0;
  const inputIDs: number[][] = new Array(inputs.length);
  const attentionMasks: number[][] = new Array(inputs.length);
  for (let i = 0; i < inputs.length; i++) {
    const tokens = await model.tokenizer.encode(inputs[i], addSpecialTokens);
    let len = tokens.length;
    if (bosTokenID) {
      len++;
    }
    inputIDs[i] = new Array(len);
    let offset = 0;
    if (bosTokenID) {
      inputIDs[i][0] = bosTokenID;
      offset = 1;
    }
    for (let j = offset; j < len; j++) {
      if (bosTokenID) {
        inputIDs[i][j] = tokens[j - 1];
      } else {
        inputIDs[i][j] = tokens[j];
      }
    }
    attentionMasks[i] = new Array(len).fill(1);
    if (len > maxLen) {
      maxLen = len;
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
