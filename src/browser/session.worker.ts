import * as Comlink from "comlink";
import { Session } from "./session.js";

if (typeof self !== "undefined") {
  Comlink.expose(Session);
}
