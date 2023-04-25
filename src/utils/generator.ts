import * as ort from "onnxruntime-web";
import { GenerationConfig } from "./generationConfig";
import { Encoder } from "./encoder";
import { Decoder } from "./decoder";

export enum GeneratorType {
  Unknown = 1,
  Img2Seq,
  Seq2Seq,
}

export async function* generate(
  input: ort.Tensor,
  encoder: Encoder,
  decoder: Decoder,
  options: GenerationConfig,
  inputAttentionMask?: ort.Tensor,
  initDecoderInput?: ort.TypedTensor<"int64">,
  initDecoderAttentionMask?: ort.TypedTensor<"int64">,
): AsyncIterable<number[]> {
  const sampler = (x: ort.Tensor) => greedySampler(x);
  const encoderOutput = await encoder.process(input, inputAttentionMask);
  let len = 0;
  let decoderInput = new ort.Tensor("int64", new BigInt64Array([BigInt(options.bosTokenID)]), [1, 1]);
  let decoderAttention = new ort.Tensor("int64", new BigInt64Array([BigInt(1)]), [1, 1]);
  if (initDecoderInput) {
    decoderInput = initDecoderInput;
  }
  if (initDecoderAttentionMask) {
    decoderAttention = initDecoderAttentionMask;
  }
  const genFinished: boolean[] = new Array(input.dims[0]).fill(false);
  while (true) {
    const decoderOutput = await decoder.process(encoderOutput, decoderInput, decoderAttention, inputAttentionMask);
    const newTokenIDs = sampler(decoderOutput);
    yield newTokenIDs;
    for (let i = 0; i < newTokenIDs.length; i++) {
      if (newTokenIDs[i] === options.eosTokenID) {
        genFinished[i] = true;
        newTokenIDs[i] = options.padTokenID;
      }
    }
    const newDecoderTokens = new BigInt64Array(decoderInput.data.length + newTokenIDs.length);
    const newDecoderAttention = new BigInt64Array(decoderInput.data.length + newTokenIDs.length);
    for (let i = 0; i < decoderInput.dims[0]; i++) {
      let attentionSet = false;
      for (let j = 0; j < decoderInput.dims[1]; j++) {
        newDecoderTokens[i * decoderInput.dims[1] + j] = BigInt(decoderInput.data[i * decoderInput.dims[1] + j]);
        if (decoderAttention.data[i * decoderInput.dims[1] + j] === 1n) {
          newDecoderAttention[i * decoderInput.dims[1] + j] = 1n;
        } else {
          if (!attentionSet) {
            newDecoderAttention[i * decoderInput.dims[1] + j] = 1n;
            attentionSet = true;
          } else {
            newDecoderAttention[i * decoderInput.dims[1] + j] = 0n;
          }
        }
      }
      if (!attentionSet) {
        newDecoderAttention[i * decoderInput.dims[1] + decoderInput.dims[1]] = 1n;
      } else {
        newDecoderAttention[i * decoderInput.dims[1] + decoderInput.dims[1]] = 0n;
      }
      newDecoderTokens[i * decoderInput.dims[1] + decoderInput.dims[1]] = BigInt(newTokenIDs[i]);
    }
    decoderInput = new ort.Tensor("int64", newDecoderTokens, [decoderInput.dims[0], decoderInput.dims[1] + 1]);
    decoderAttention = new ort.Tensor("int64", newDecoderAttention, [
      decoderAttention.dims[0],
      decoderAttention.dims[1] + 1,
    ]);
    len += 1;
    const allGenerated = genFinished.every((x) => x);
    if (
      (options.maxTokens && len === options.maxTokens) ||
      (options.maxLength && len === options.maxLength) ||
      (options.eosTokenID && allGenerated)
    ) {
      break;
    }
  }
}

const greedySampler = (logits: ort.Tensor): number[] => {
  const shape = logits.dims;
  const [batchSize, seqLength, vocabSize] = shape;
  const size = seqLength * vocabSize;
  const result: number[] = new Array(batchSize);
  for (let idx = 0; idx < batchSize; idx++) {
    const startIndex = (idx + 1) * size - vocabSize;
    let maxIdx = 0;
    let max = logits.data[startIndex];
    for (let i = 1; i < vocabSize; i++) {
      const l = logits.data[startIndex + i];
      if (l > max) {
        maxIdx = i;
        max = l;
      }
    }
    result[idx] = maxIdx;
  }
  return result;
};
