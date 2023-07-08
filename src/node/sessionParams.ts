import { SessionParameters } from "../common.js";

export const SessionParams: SessionParameters = {
  numThreads: 0,
  executionProviders: ["wasm"],
  memoryLimitMB: 0,
  cacheSizeMB: 2500,
  wasmRoot: "https://edge-ai-models.s3.us-east-2.amazonaws.com/onnx-15/",
  tokenizersPath:
    "https://edge-ai-models.s3.us-east-2.amazonaws.com/tokenizers.wasm",
};
