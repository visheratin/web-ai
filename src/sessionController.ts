import * as ort from "onnxruntime-web";
import * as Comlink from "comlink";
import { Remote, wrap } from "comlink";
import { Session, SessionParams } from "./session";

export const createSession = async (modelPath: string, proxy: boolean): Promise<Session | Comlink.Remote<Session>> => {
  if (proxy && typeof document !== "undefined") {
    ort.env.wasm.proxy = true;
    const worker = new Worker(new URL("./session.js", import.meta.url), { type: "module" });
    const Channel = wrap<typeof Session>(worker);
    const session: Remote<Session> = await new Channel(SessionParams);
    await session.init(modelPath);
    return session;
  } else {
    ort.env.wasm.proxy = false;
    const session = new Session(SessionParams);
    await session.init(modelPath);
    return session;
  }
};
