import { TextMetadata } from "./metadata";
import { TextModelType } from "./modeType";

export const ListTextModels = (tags?: string[], type?: TextModelType): TextMetadata[] => {
  if (!tags && !type) {
    return models;
  }
  return models.filter((model) => {
    let tagCheck = true;
    if (model.tags && tags && tags.length > 0) {
      tagCheck = tags.every((tag) => model.tags!.includes(tag));
    }
    let typeCheck = true;
    if (type) {
      typeCheck = model.type === type;
    }
    return tagCheck && typeCheck;
  });
};

export const models: TextMetadata[] = [
  {
    id: "grammar-t5-efficient-tiny",
    title: "T5 Efficient tiny",
    description: "",
    type: TextModelType.Seq2Seq,
    sizeMB: 113,
    modelPaths: new Map<string, string>([
      [
        "encoder",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/text/seq2seq/grammar-correction/t5-tiny/encoder.onnx.gz",
      ],
      [
        "decoder",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/text/seq2seq/grammar-correction/t5-tiny/decoder.onnx.gz",
      ],
    ]),
    tokenizerPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/text/seq2seq/grammar-correction/t5-tiny/tokenizer.json",
    tags: ["grammar", "t5"],
  },
  {
    id: "grammar-t5-efficient-tiny-quant",
    title: "T5 Efficient tiny quantized",
    description: "",
    type: TextModelType.Seq2Seq,
    sizeMB: 32,
    modelPaths: new Map<string, string>([
      [
        "encoder",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/text/seq2seq/grammar-correction/t5-tiny/encoder-quant.onnx.gz",
      ],
      [
        "decoder",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/text/seq2seq/grammar-correction/t5-tiny/decoder-quant.onnx.gz",
      ],
    ]),
    tokenizerPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/text/seq2seq/grammar-correction/t5-tiny/tokenizer.json",
    tags: ["grammar", "t5"],
  },
  {
    id: "grammar-t5-efficient-mini",
    title: "T5 Efficient mini",
    description: "",
    type: TextModelType.Seq2Seq,
    sizeMB: 197,
    modelPaths: new Map<string, string>([
      [
        "encoder",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/text/seq2seq/grammar-correction/t5-mini/encoder.onnx.gz",
      ],
      [
        "decoder",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/text/seq2seq/grammar-correction/t5-mini/decoder.onnx.gz",
      ],
    ]),
    tokenizerPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/text/seq2seq/grammar-correction/t5-mini/tokenizer.json",
    tags: ["grammar", "t5"],
  },
  {
    id: "grammar-t5-efficient-mini-quant",
    title: "T5 Efficient mini quantized",
    description: "",
    type: TextModelType.Seq2Seq,
    sizeMB: 38,
    modelPaths: new Map<string, string>([
      [
        "encoder",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/text/seq2seq/grammar-correction/t5-mini/encoder-quant.onnx.gz",
      ],
      [
        "decoder",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/text/seq2seq/grammar-correction/t5-mini/decoder-quant.onnx.gz",
      ],
    ]),
    tokenizerPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/text/seq2seq/grammar-correction/t5-mini/tokenizer.json",
    tags: ["grammar", "t5"],
  },
  {
    id: "t5-efficient-mini",
    title: "T5 Efficient mini",
    description: "",
    type: TextModelType.FeatureExtraction,
    sizeMB: 94,
    modelPaths: new Map<string, string>([
      ["encoder", "https://edge-ai-models.s3.us-east-2.amazonaws.com/text/feature-extraction/t5-mini/encoder.onnx.gz"],
      ["decoder", "https://edge-ai-models.s3.us-east-2.amazonaws.com/text/feature-extraction/t5-mini/decoder.onnx.gz"],
    ]),
    tokenizerPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/text/feature-extraction/t5-mini/tokenizer.json",
    tags: ["feature-extraction", "t5"],
  },
  {
    id: "t5-efficient-mini-quant",
    title: "T5 Efficient mini quantized",
    description: "",
    type: TextModelType.FeatureExtraction,
    sizeMB: 38,
    modelPaths: new Map<string, string>([
      [
        "encoder",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/text/feature-extraction/t5-mini/encoder-quant.onnx.gz",
      ],
      [
        "decoder",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/text/feature-extraction/t5-mini/decoder-quant.onnx.gz",
      ],
    ]),
    tokenizerPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/text/feature-extraction/t5-mini/tokenizer.json",
    tags: ["feature-extraction", "t5"],
  },
  {
    id: "t5-flan-small",
    title: "T5 Flan small",
    description: "",
    type: TextModelType.Seq2Seq,
    sizeMB: 330,
    modelPaths: new Map<string, string>([
      ["encoder", "https://edge-ai-models.s3.us-east-2.amazonaws.com/text/seq2seq/general/flan-t5/encoder.onnx.gz"],
      ["decoder", "https://edge-ai-models.s3.us-east-2.amazonaws.com/text/seq2seq/general/flan-t5/decoder.onnx.gz"],
    ]),
    tokenizerPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/text/seq2seq/general/flan-t5/tokenizer.json",
    tags: ["general", "t5-flan"],
  },
];
