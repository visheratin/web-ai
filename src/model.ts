import * as ort from "onnxruntime-web";
import { Session } from "./session";
import * as Comlink from "comlink";

export interface Model {
  session: Session | Comlink.Remote<Session>;

  process(input: ort.Tensor): Promise<ort.Tensor>;
}

export interface DecoderModel {
  session: Session | Comlink.Remote<Session>;

  process(encoderOutput: ort.Tensor, decoderInput: ort.Tensor): Promise<ort.Tensor>;
}
