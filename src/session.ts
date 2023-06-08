import * as ort from "onnxruntime-node";
import * as pako from "pako";
import { SessionParameters } from "./sessionParams";

export class Session {
  ortSession: ort.InferenceSession | undefined;
  cacheSize: number;
  params: SessionParameters;

  constructor(params: SessionParameters) {
    this.params = params;
    const cacheSize = params.cacheSizeMB * 1e6;
    this.cacheSize = cacheSize;
  }

  init = async (modelPath: string) => {
    ort.env.wasm.numThreads = this.params.numThreads;
    ort.env.wasm.wasmPaths = this.params.wasmRoot;
    let modelData: ArrayBuffer = new ArrayBuffer(0);
    modelData = await this.fetchData(modelPath);
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
    return modelData;
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
