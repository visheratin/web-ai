import * as ort from "onnxruntime-web";

ort.env.wasm.numThreads = 3;
ort.env.wasm.simd = true;
ort.env.wasm.proxy = true;
ort.env.wasm.wasmPaths =
  "https://edge-ai-models.s3.us-east-2.amazonaws.com/onnx-13/";

export const createSession = async (
  modelPath: string
): Promise<ort.InferenceSession> => {
  const model_data = await fetch(modelPath).then((resp) => resp.arrayBuffer());
  const session = await ort.InferenceSession.create(model_data, {
    executionProviders: ["wasm"],
    graphOptimizationLevel: "all",
    executionMode: "parallel",
  });
  return session;
};
