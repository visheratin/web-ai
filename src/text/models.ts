import { TextMetadata } from "./metadata";
import { TextModelType } from "./modeType";

export const ListTextModels = (
  tags?: string[],
  type?: TextModelType
): TextMetadata[] => {
  if (tags) {
    return models.filter((model) => {
      return tags.every((tag) => model.tags.includes(tag));
    });
  } else {
    return models.filter((model) => {
      return model.type == type;
    });
  }
};

const models: TextMetadata[] = [
  {
    id: "grammar-t5-efficient-tiny-quant",
    title: "T5 Efficient TINY quantized",
    description: "",
    type: TextModelType.Grammar,
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
    type: TextModelType.Grammar,
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
    type: TextModelType.Grammar,
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
    type: TextModelType.Grammar,
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
  {
    id: "t5-efficient-tiny-quant",
    title: "T5 Efficient TINY quantized",
    description: "",
    type: TextModelType.FeatureExtraction,
    sizeMB: 32,
    modelPaths: new Map<string, string>([
      [
        "encoder",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/feature-extraction/t5-efficient-tiny-encoder-quant.onnx",
      ],
      [
        "decoder",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/feature-extraction/t5-efficient-tiny-decoder-quant.onnx",
      ],
    ]),
    tokenizerPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/grammar/tokenizer.json",
    tags: ["feature-extraction", "t5"],
  },
  {
    id: "t5-efficient-mini-quant",
    title: "T5 Efficient MINI quantized",
    description: "",
    type: TextModelType.FeatureExtraction,
    sizeMB: 55,
    modelPaths: new Map<string, string>([
      [
        "encoder",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/grammar/t5-efficient-mini-encoder-quant.onnx",
      ],
      [
        "decoder",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/grammar/t5-efficient-mini-decoder-quant.onnx",
      ],
    ]),
    tokenizerPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/grammar/tokenizer.json",
    tags: ["feature-extraction", "t5"],
  },
  {
    id: "t5-efficient-tiny",
    title: "T5 Efficient TINY",
    description: "",
    type: TextModelType.FeatureExtraction,
    sizeMB: 122,
    modelPaths: new Map<string, string>([
      [
        "encoder",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/feature-extraction/t5-efficient-tiny-encoder.onnx",
      ],
      [
        "decoder",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/feature-extraction/t5-efficient-tiny-decoder.onnx",
      ],
    ]),
    tokenizerPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/grammar/tokenizer.json",
    tags: ["feature-extraction", "t5"],
  },
  {
    id: "t5-efficient-tiny",
    title: "T5 Efficient MINI",
    description: "",
    type: TextModelType.FeatureExtraction,
    sizeMB: 214,
    modelPaths: new Map<string, string>([
      [
        "encoder",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/feature-extraction/t5-efficient-mini-encoder.onnx",
      ],
      [
        "decoder",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/feature-extraction/t5-efficient-mini-decoder.onnx",
      ],
    ]),
    tokenizerPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/grammar/tokenizer.json",
    tags: ["feature-extraction", "t5"],
  },
];
