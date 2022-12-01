import { TextMetadata } from "./metadata";

export const ListTextModels = (tags: string[]): TextMetadata[] => {
  return models.filter((model) => {
    return tags.every((tag) => model.tags.includes(tag));
  });
};

const models: TextMetadata[] = [
  {
    id: "grammar-t5-efficient-tiny-quant",
    title: "T5 Efficient TINY quantized",
    description: "",
    sizeMB: 32,
    modelPaths: new Map<string, string>([
      [
        "encoder",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/grammar/tiny-encoder-quant.onnx",
      ],
      [
        "decoder",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/grammar/tiny-decoder-init-quant.onnx",
      ],
    ]),
    tokenizerPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/grammar/tokenizer.json",
    tags: ["grammar", "t5"],
  },
  {
    id: "grammar-t5-efficient-mini-quant",
    title: "T5 Efficient MINI quantized",
    description: "",
    sizeMB: 55,
    modelPaths: new Map<string, string>([
      [
        "encoder",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/grammar/mini-encoder-quant.onnx",
      ],
      [
        "decoder",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/grammar/mini-decoder-init-quant.onnx",
      ],
    ]),
    tokenizerPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/grammar/tokenizer.json",
    tags: ["grammar", "t5"],
  },
  {
    id: "grammar-t5-efficient-tiny",
    title: "T5 Efficient TINY",
    description: "",
    sizeMB: 122,
    modelPaths: new Map<string, string>([
      [
        "encoder",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/grammar/tiny-encoder.onnx",
      ],
      [
        "decoder",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/grammar/tiny-decoder-init.onnx",
      ],
    ]),
    tokenizerPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/grammar/tokenizer.json",
    tags: ["grammar", "t5"],
  },
  {
    id: "grammar-t5-efficient-tiny",
    title: "T5 Efficient MINI",
    description: "",
    sizeMB: 214,
    modelPaths: new Map<string, string>([
      [
        "encoder",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/grammar/mini-encoder.onnx",
      ],
      [
        "decoder",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/grammar/mini-decoder-init.onnx",
      ],
    ]),
    tokenizerPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/grammar/tokenizer.json",
    tags: ["grammar", "t5"],
  },
];
