// @ts-nocheck
import * as ort from "onnxruntime-web";
import { Session } from "../session";
import * as Comlink from "comlink";

interface GenerateOptions {
  maxLength: number;
  topK: number;
}

export class T5ForConditionalGeneration {
  encoderSession: Session | Comlink.Remote<Session>;
  decoderSession: Session | Comlink.Remote<Session>;

  constructor(encoderSession: Session | Comlink.Remote<Session>, decoderSession: Session | Comlink.Remote<Session>) {
    this.encoderSession = encoderSession;
    this.decoderSession = decoderSession;
  }

  async generate(inputTokenIds: number[], options: GenerateOptions): Promise<number[]> {
    const maxLength = options.maxLength || 100;
    const topK = options.topK || 0;
    const startOfDecoderTokenId = 0;
    const endOfDecoderTokenId = 1;
    let encoderOutputs = null;
    let numOutputTokens = 1;
    let shouldContinue = true;
    const maxOutputTokens = numOutputTokens + maxLength;
    let sampler = (x: ort.Tensor) => this.sampleLogitsGreedily(x);
    if (topK > 0) {
      sampler = (x: ort.Tensor) => this.sampleLogitsTopK(x, topK);
    }
    let outputTokenIds = [startOfDecoderTokenId];
    while (shouldContinue && numOutputTokens < maxOutputTokens) {
      let output = await this.forward(inputTokenIds, outputTokenIds, encoderOutputs);
      encoderOutputs = output.encoderOutputs;
      let newTokenId = sampler(output.logits);
      outputTokenIds.push(newTokenId);
      numOutputTokens++;
      if (newTokenId === endOfDecoderTokenId) {
        break;
      }
    }
    return outputTokenIds;
  }

  sampleLogitsGreedily(logits: ort.Tensor): number {
    let shape = logits.dims;
    let [batchSize, seqLength, vocabSize] = shape;
    let n = batchSize * seqLength * vocabSize;
    let startIndex = n - vocabSize;
    let argmaxi = 0;
    let argmax = logits.data[startIndex + argmaxi];
    for (let i = 1; i < vocabSize; i++) {
      let l = logits.data[startIndex + i];
      if (l > argmax) {
        argmaxi = i;
        argmax = l;
      }
    }
    return argmaxi;
  }

  sampleLogitsTopK(logits: ort.Tensor, k: number): number {
    let shape = logits.dims;
    let [batchSize, seqLength, vocabSize] = shape;
    let n = batchSize * seqLength * vocabSize;
    let startIndex = n - vocabSize;
    let logs = logits.data.slice(startIndex) as Float32Array;
    k = Math.min(k, vocabSize);
    let logitAndId = Array.from(logs)
      .map((x, i) => [x, i])
      .sort((a, b) => b[0] - a[0]);
    const sMin = Math.exp(-100.0);
    let sumS = 0.0;
    for (let i = 0; i < logitAndId.length; i++) {
      const s = i < k ? Math.exp(logitAndId[i][0]) : sMin;
      sumS += s;
      logitAndId[i][0] = s;
    }
    let r = Math.random() * sumS;
    for (let i = 0; i < logitAndId.length; i++) {
      r -= logitAndId[i][0];
      if (r <= 0) {
        return logitAndId[i][1];
      }
    }
    return logitAndId[0][1];
  }

  async forward(
    inputIds: number[],
    decoderInputIds: number[],
    encoderOutputs: ort.Tensor | null,
  ): Promise<Seq2SeqLMOutput> {
    const inputIdsTensor = new ort.Tensor("int64", new BigInt64Array(inputIds.map((x) => BigInt(x))), [
      1,
      inputIds.length,
    ]);
    const encoderAttentionMaskTensor = new ort.Tensor("int64", new BigInt64Array(inputIds.length).fill(1n), [
      1,
      inputIds.length,
    ]);
    if (encoderOutputs === null) {
      const encoderFeeds = {
        input_ids: inputIdsTensor,
        attention_mask: encoderAttentionMaskTensor,
      };
      const encoderResults = await this.encoderSession.run(encoderFeeds);
      const encoderHiddenStates = encoderResults.hidden_states;
      encoderOutputs = encoderHiddenStates;
    }
    const decoderInputIdsTensor = new ort.Tensor("int64", new BigInt64Array(decoderInputIds.map((x) => BigInt(x))), [
      1,
      decoderInputIds.length,
    ]);
    const attentionMaskTensor = new ort.Tensor("int64", new BigInt64Array(inputIds.length).fill(1n), [
      1,
      inputIds.length,
    ]);
    const encoderOutputsClone = structuredClone(encoderOutputs);
    const encoderOutputsTensor = new ort.Tensor(encoderOutputsClone.data, encoderOutputsClone.dims);
    const decoderFeeds = {
      input_ids: decoderInputIdsTensor,
      encoder_attention_mask: attentionMaskTensor,
      encoder_hidden_states: encoderOutputsTensor,
    };
    let logits = null;
    const initDecoderResults = await this.decoderSession.run(decoderFeeds);
    logits = initDecoderResults.logits;
    return new Seq2SeqLMOutput(logits, encoderOutputs);
  }
}

class Seq2SeqLMOutput {
  logits: ort.Tensor;
  encoderOutputs: any;
  constructor(logits: ort.Tensor, encoderOutputs) {
    this.logits = logits;
    this.encoderOutputs = encoderOutputs;
  }
}

export class T5Encoder {
  encoderSession: Session | Comlink.Remote<Session>;

  constructor(encoderSession: Session | Comlink.Remote<Session>) {
    this.encoderSession = encoderSession;
  }

  async forward(inputIds: number[]): Promise<ort.Tensor> {
    const inputIdsTensor = new ort.Tensor("int64", new BigInt64Array(inputIds.map((x) => BigInt(x))), [
      1,
      inputIds.length,
    ]);
    const encoderAttentionMaskTensor = new ort.Tensor("int64", new BigInt64Array(inputIds.length).fill(1n), [
      1,
      inputIds.length,
    ]);
    const encoderFeeds = {
      input_ids: inputIdsTensor,
      attention_mask: encoderAttentionMaskTensor,
    };
    const encoderResults = await this.encoderSession.run(encoderFeeds);
    return encoderResults.hidden_states;
  }
}
