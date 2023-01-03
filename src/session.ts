import localforage from "localforage";
import * as ort from "onnxruntime-web";
import * as pako from "pako";
import * as Comlink from "comlink";

ort.env.wasm.wasmPaths = "https://edge-ai-models.s3.us-east-2.amazonaws.com/onnx-13/";

export class Session {
  ortSession: ort.InferenceSession | undefined;

  constructor(cache_size_mb: number) {
    const cache_size = cache_size_mb * 1e6;
    localforage.config({
      name: "Web-AI",
      version: 1.0,
      driver: localforage.INDEXEDDB,
      size: cache_size,
      storeName: "model_storage",
    });
  }

  init = async (modelPath: string) => {
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
    this.ortSession = session;
  };

  run = async (input: ort.InferenceSession.OnnxValueMapType): Promise<ort.InferenceSession.OnnxValueMapType> => {
    if (!this.ortSession) {
      throw Error("the session is not initialized. Call `init()` method first.");
    }
    return await this.ortSession.run(input);
  };

  inputNames = (): readonly string[] => {
    if (!this.ortSession) {
      throw Error("the session is not initialized. Call `init()` method first.");
    }
    return this.ortSession.inputNames;
  };

  outputNames = (): readonly string[] => {
    if (!this.ortSession) {
      throw Error("the session is not initialized. Call `init()` method first.");
    }
    return this.ortSession.outputNames;
  };
}

if (typeof self !== "undefined") {
  Comlink.expose(Session);
}
