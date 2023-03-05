import { Model } from "../model";
import { Session } from "../session";
import * as Comlink from "comlink";
import * as ort from "onnxruntime-web";

export class Encoder implements Model {
  session: Session | Comlink.Remote<Session>;
  outputName: string;

  constructor(session: Session | Comlink.Remote<Session>, outputName: string) {
    this.session = session;
    this.outputName = outputName;
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
    const result = output[this.outputName];
    return result;
  };
}
