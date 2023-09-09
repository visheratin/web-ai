import * as Comlink from "comlink";
import { Tokenizer } from "./tokenizer.js";

if (typeof self !== "undefined") {
  Comlink.expose(Tokenizer);
}
