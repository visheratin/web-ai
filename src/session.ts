import localforage from "localforage";
import * as ort from "onnxruntime-web";
import * as pako from "pako";

ort.env.wasm.numThreads = 3;
ort.env.wasm.simd = true;
ort.env.wasm.proxy = true;
ort.env.wasm.wasmPaths = "https://edge-ai-models.s3.us-east-2.amazonaws.com/onnx-13/";

export const createSession = async (modelPath: string): Promise<ort.InferenceSession> => {
  let modelData: ArrayBuffer = new ArrayBuffer(0);
  try {
    const cachedData = await localforage.getItem(modelPath);
    if (cachedData !== null) {
      modelData = cachedData as ArrayBuffer;
    } else {
      modelData = await fetch(modelPath).then((resp) => resp.arrayBuffer());
      localforage.setItem(modelPath, modelData);
    }
  } catch (err) {
    console.log("unable to load the data from cache");
    console.log(err);
    modelData = await fetch(modelPath).then((resp) => resp.arrayBuffer());
    localforage.setItem(modelPath, modelData);
  }
  const extension = modelPath.split(".").pop();
  if (extension === "gz") {
    modelData = pako.inflate(modelData);
  }
  const session = await ort.InferenceSession.create(modelData, {
    executionProviders: ["wasm"],
    graphOptimizationLevel: "all",
    executionMode: "parallel",
  });
  return session;
};
