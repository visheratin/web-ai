import { DecoderModel } from "../model";
import { Session } from "../session";
import * as Comlink from "comlink";
import * as ort from "onnxruntime-web";

export class Decoder implements DecoderModel {
  session: Session | Comlink.Remote<Session>;
  outputName: string;

  constructor(session: Session | Comlink.Remote<Session>, outputName: string) {
    this.session = session;
    this.outputName = outputName;
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
    const result = output[this.outputName];
    return result;
  };
}
