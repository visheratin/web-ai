import { Session } from "./session.js";
import * as ort from "onnxruntime-common";
import { GeneratorType } from "./generator.js";

export type ValueMapType = {
  [name: string]: ort.OnnxValue;
};

export class Decoder {
  session: Session;
  outputName: string;
  type: GeneratorType;

  constructor(session: Session, outputName: string, type: GeneratorType) {
    this.session = session;
    this.outputName = outputName;
    this.type = type;
  }

  process = async (
    encoderOutput: ort.Tensor,
    decoderInput: ort.Tensor,
    decoderAttention?: ort.Tensor,
    encoderAttention?: ort.Tensor
  ): Promise<ort.Tensor> => {
    if (!this.session) {
      throw new Error("Session is not initialized");
    }
    const decoderFeeds: ValueMapType = {
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
