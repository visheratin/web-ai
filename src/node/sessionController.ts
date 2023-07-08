import * as ort from "onnxruntime-node";
import { Session } from "./session.js";
import { SessionParams } from "./sessionParams.js";

export const createSession = async (
  modelPath: string,
  proxy: boolean
): Promise<Session> => {
  ort.env.wasm.proxy = false;
  const session = new Session(SessionParams);
  await session.init(modelPath);
  return session;
};
