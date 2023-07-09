import { SessionParameters } from "../common.js";

export const SessionParams: SessionParameters = {
  numThreads: 0,
  executionProviders: ["wasm"],
  memoryLimitMB: 0,
  cacheSizeMB: 2500,
  wasmRoot: "https://web-ai-models.org/onnx-15/",
  tokenizersPath: "https://web-ai-models.org/tokenizers.wasm",
};
