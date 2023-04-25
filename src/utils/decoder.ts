import { Session } from "../session";
import * as Comlink from "comlink";
import * as ort from "onnxruntime-web";
import { GeneratorType } from "./generator";

export class Decoder {
  session: Session | Comlink.Remote<Session>;
  outputName: string;
  type: GeneratorType;

  constructor(session: Session | Comlink.Remote<Session>, outputName: string, type: GeneratorType) {
    this.session = session;
    this.outputName = outputName;
    this.type = type;
  }

  process = async (
    encoderOutput: ort.Tensor,
    decoderInput: ort.Tensor,
    decoderAttention?: ort.Tensor,
    encoderAttention?: ort.Tensor,
  ): Promise<ort.Tensor> => {
    if (!this.session) {
      throw new Error("Session is not initialized");
    }
    let decoderFeeds = {};
    decoderFeeds = {
      input_ids: decoderInput,
      encoder_hidden_states: encoderOutput,
    };
    const inputNames = await this.session.inputNames();
    if (inputNames.includes("attention_mask")) {
      if (!decoderAttention) {
        throw new Error("Decoder attention mask is not provided");
      }
      decoderFeeds["attention_mask"] = decoderAttention;
    }
    if (inputNames.includes("encoder_attention_mask")) {
      if (!encoderAttention) {
        throw new Error("Encoder attention mask is not provided");
      }
      decoderFeeds["encoder_attention_mask"] = encoderAttention;
    }
    const output = await this.session.run(decoderFeeds);
    const result = output[this.outputName];
    return result;
  };
}
