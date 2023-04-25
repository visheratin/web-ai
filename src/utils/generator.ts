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
  let decoderInput = new ort.Tensor("int64", new BigInt64Array(input.dims[0]).fill(BigInt(options.bosTokenID)), [
    input.dims[0],
    1,
  ]);
  let decoderAttention = new ort.Tensor("int64", new BigInt64Array(input.dims[0]).fill(1n), [input.dims[0], 1]);
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
      }
    }
    const newDecoderTokens: bigint[] = [];
    const newDecoderAttention: bigint[] = [];
    for (let i = 0; i < decoderInput.dims[0]; i++) {
      for (let j = 0; j < decoderInput.dims[1]; j++) {
        const idx = i * decoderInput.dims[1] + j;
        newDecoderTokens.push(BigInt(decoderInput.data[idx]));
        newDecoderAttention.push(decoderAttention.data[idx]);
      }
      newDecoderTokens.push(BigInt(newTokenIDs[i]));
      if (newTokenIDs[i] === options.eosTokenID || newTokenIDs[i] === options.padTokenID) {
        newDecoderAttention.push(0n);
      } else {
        newDecoderAttention.push(1n);
      }
    }
    decoderInput = new ort.Tensor("int64", new BigInt64Array(newDecoderTokens), [
      decoderInput.dims[0],
      decoderInput.dims[1] + 1,
    ]);
    decoderAttention = new ort.Tensor("int64", new BigInt64Array(newDecoderAttention), [
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
  const [batchSize, seqLength, vocabSize] = logits.dims;
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
