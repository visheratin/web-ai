import * as ort from "onnxruntime-common";

export interface Session {
  init: (modelPath: string) => Promise<void>;
  run: (
    input: ort.InferenceSession.OnnxValueMapType
  ) => Promise<ort.InferenceSession.OnnxValueMapType>;
  inputNames: () => readonly string[];
  outputNames: () => readonly string[];
}
