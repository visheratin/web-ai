import * as ort from "onnxruntime-web";
import * as Comlink from "comlink";
import Worker from "worker-loader!./session";
import { Remote, wrap } from "comlink";
import { Session } from "./session";

ort.env.wasm.numThreads = 3;
ort.env.wasm.simd = true;
ort.env.wasm.proxy = true;
ort.env.wasm.wasmPaths = "https://edge-ai-models.s3.us-east-2.amazonaws.com/onnx-13/";

export const createSession = async (
  modelPath: string,
  proxy: boolean = true,
): Promise<Session | Comlink.Remote<Session>> => {
  if (proxy) {
    const Channel = wrap<typeof Session>(new Worker());
    const session: Remote<Session> = await new Channel();
    await session.init(modelPath);
    return session;
  } else {
    const session = new Session();
    await session.init(modelPath);
    return session;
  }
};
