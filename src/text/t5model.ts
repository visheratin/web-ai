import { DecoderModel, Model } from "../model";
import { Session } from "../session";
import * as Comlink from "comlink";
import * as ort from "onnxruntime-web";

export class T5Encoder implements Model {
  session: Session | Comlink.Remote<Session>;

  constructor(session: Session | Comlink.Remote<Session>) {
    this.session = session;
  }

  process = async (input: ort.Tensor): Promise<ort.Tensor> => {
    const attentionTensor = new ort.Tensor("int64", new BigInt64Array(input.data.length).fill(1n), [
      1,
      input.data.length,
    ]);
    const encoderFeeds = {
      input_ids: input,
      attention_mask: attentionTensor,
    };
    const output = await this.session.run(encoderFeeds);
    const result = output.hidden_states;
    return result;
  };
}

export class T5Decoder implements DecoderModel {
  session: Session | Comlink.Remote<Session>;

  constructor(session: Session | Comlink.Remote<Session>) {
    this.session = session;
  }

  process = async (encoderOutput: ort.Tensor, decoderInput: ort.Tensor): Promise<ort.Tensor> => {
    const attentionTensor = new ort.Tensor("int64", new BigInt64Array(encoderOutput.dims[1]).fill(1n), [
      1,
      encoderOutput.dims[1],
    ]);
    const decoderFeeds = {
      input_ids: decoderInput,
      encoder_attention_mask: attentionTensor,
      encoder_hidden_states: encoderOutput,
    };
    const output = await this.session.run(decoderFeeds);
    const result = output.logits;
    return result;
  };
}
