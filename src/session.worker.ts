import * as Comlink from "comlink";
import { Session } from "./session";

if (typeof self !== "undefined") {
  Comlink.expose(Session);
}
