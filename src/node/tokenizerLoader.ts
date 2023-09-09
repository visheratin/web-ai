import { Tokenizer } from "./tokenizer";

export const loadTokenizer = async (
  tokenizerPath: string,
  proxy: boolean = true
): Promise<Tokenizer> => {
  const tokenizer = new Tokenizer(tokenizerPath);
  await tokenizer.init();
  return tokenizer;
};
