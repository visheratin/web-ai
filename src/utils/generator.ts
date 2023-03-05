import * as ort from "onnxruntime-web";
import { GenerationConfig } from "./generationConfig";
import { DecoderModel, Model } from "../model";

export async function* generate(
  input: ort.Tensor,
  encoder: Model,
  decoder: DecoderModel,
  options: GenerationConfig,
): AsyncIterable<number> {
  const sampler = (x: ort.Tensor) => greedySampler(x);
  const encoderOutput = await encoder.process(input);
  let len = 0;
  let decoderInput = new ort.Tensor("int64", new BigInt64Array([BigInt(options.bosTokenID!)]), [1, 1]);
  while (true) {
    const decoderOutput = await decoder.process(encoderOutput, decoderInput);
    const newTokenID = sampler(decoderOutput);
    yield newTokenID;
    if (!decoderInput) {
      decoderInput = new ort.Tensor("int64", new BigInt64Array([BigInt(newTokenID)]), [1, 1]);
    } else {
      const newInput = new ort.Tensor("int64", new BigInt64Array(decoderInput.data.length + 1), [
        1,
        decoderInput.data.length + 1,
      ]);
      newInput.data.set(decoderInput.data);
      newInput.data[decoderInput.data.length] = BigInt(newTokenID);
      decoderInput = newInput;
    }
    len += 1;
    if (
      (options.maxTokens && len === options.maxTokens) ||
      (options.maxLength && len === options.maxLength) ||
      (options.eosTokenID && newTokenID === options.eosTokenID)
    ) {
      break;
    }
  }
}

const greedySampler = (logits: ort.Tensor): number => {
  const shape = logits.dims;
  const [batchSize, seqLength, vocabSize] = shape;
  const size = batchSize * seqLength * vocabSize;
  const startIndex = size - vocabSize;
  let maxIdx = 0;
  let max = logits.data[startIndex + maxIdx];
  for (let i = 1; i < vocabSize; i++) {
    const l = logits.data[startIndex + i];
    if (l > max) {
      maxIdx = i;
      max = l;
    }
  }
  return maxIdx;
};
