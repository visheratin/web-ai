import { Model } from "./model";
import { Normalizer } from "./normalizer";
import { PostProcessor } from "./postProcessor";
import { PreTokenizer } from "./preTokenizer";

class Tokenizer {
  normalizer: Normalizer;
  preTokenizer: PreTokenizer;
  model: Model;
  postProcessor: PostProcessor;
}
