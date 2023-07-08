import localforage from "localforage";
import * as ort from "onnxruntime-web";
import * as pako from "pako";
import { SessionParameters } from "./sessionParams.js";

export const clearCache = async () => {
  await localforage.clear();
};

export class Session {
  ortSession: ort.InferenceSession | undefined;
  cacheSize: number;
  params: SessionParameters;

  constructor(params: SessionParameters) {
    this.params = params;
    const cacheSize = params.cacheSizeMB * 1e6;
    localforage.config({
      name: "Web-AI",
      version: 1.0,
      driver: localforage.INDEXEDDB,
      storeName: "model_storage",
    });
    this.cacheSize = cacheSize;
  }

  init = async (modelPath: string) => {
    ort.env.wasm.numThreads = this.params.numThreads;
    ort.env.wasm.wasmPaths = this.params.wasmRoot;
    let modelData: ArrayBuffer = new ArrayBuffer(0);
    try {
      const cachedData = await localforage.getItem(modelPath);
      if (cachedData !== null) {
        modelData = cachedData as ArrayBuffer;
      } else {
        modelData = await this.fetchData(modelPath);
      }
    } catch (err) {
      console.error("unable to load the data from cache");
      console.error(err);
      modelData = await this.fetchData(modelPath);
    }
    const session = await ort.InferenceSession.create(modelData, {
      executionProviders: this.params.executionProviders,
      graphOptimizationLevel: "all",
      executionMode: "parallel",
    });
    this.ortSession = session;
  };

  fetchData = async (modelPath: string): Promise<ArrayBuffer> => {
    const extension = modelPath.split(".").pop();
    let modelData = await fetch(modelPath).then((resp) => resp.arrayBuffer());
    if (extension === "gz") {
      modelData = pako.inflate(modelData);
    }
    if (modelData.byteLength > this.cacheSize) {
      console.warn("the model is too large to be cached");
    } else {
      await this.validateCache(modelData);
      localforage.setItem(modelPath, modelData);
    }
    return modelData;
  };

  validateCache = async (modelData: ArrayBuffer) => {
    try {
      const cacheKeys = await localforage.keys();
      let cacheSize = 0;
      const cacheItemSizes = new Map<string, number>();
      for (const key of cacheKeys) {
        const data = (await localforage.getItem(key)) as ArrayBuffer;
        cacheSize += data.byteLength;
        cacheItemSizes.set(key, data.byteLength);
      }
      let newCacheSize = cacheSize + modelData.byteLength;
      while (newCacheSize > this.cacheSize) {
        const [key, size] = cacheItemSizes.entries().next().value;
        cacheItemSizes.delete(key);
        newCacheSize -= size;
        await localforage.removeItem(key);
      }
    } catch (err) {
      console.error("unable to validate the cache");
      console.error(err);
    }
  };

  run = async (
    input: ort.InferenceSession.OnnxValueMapType
  ): Promise<ort.InferenceSession.OnnxValueMapType> => {
    if (!this.ortSession) {
      throw Error(
        "the session is not initialized. Call `init()` method first."
      );
    }
    return await this.ortSession.run(input);
  };

  inputNames = (): readonly string[] => {
    if (!this.ortSession) {
      throw Error(
        "the session is not initialized. Call `init()` method first."
      );
    }
    return this.ortSession.inputNames;
  };

  outputNames = (): readonly string[] => {
    if (!this.ortSession) {
      throw Error(
        "the session is not initialized. Call `init()` method first."
      );
    }
    return this.ortSession.outputNames;
  };
}
