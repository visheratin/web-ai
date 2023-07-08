import * as ort from "onnxruntime-web";
import * as Comlink from "comlink";
import { Session } from "./session.js";
import { SessionParams } from "./sessionParams.js";

export const createSession = async (
  modelPath: string,
  proxy: boolean
): Promise<Session> => {
  if (proxy && typeof document !== "undefined") {
    ort.env.wasm.proxy = true;
    const worker = new Worker(new URL("./session.worker.js", import.meta.url), {
      type: "module",
    });
    const Channel = Comlink.wrap<typeof Session>(worker);
    const session: Comlink.Remote<Session> = await new Channel(SessionParams);
    await session.init(modelPath);
    // @ts-ignore
    return session;
  } else {
    ort.env.wasm.proxy = false;
    const session = new Session(SessionParams);
    await session.init(modelPath);
    return session;
  }
};
