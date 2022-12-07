import { FeatureExtractionModel } from "./featureExtractionModel";
import { TextModel } from "./interfaces";
import { TextMetadata } from "./metadata";
import { TextModelType } from "./modeType";
import { Seq2SeqModel } from "./seq2seqModel";

export const ListTextModels = (tags?: string[], type?: TextModelType): TextMetadata[] => {
  if (!tags && !type) {
    return models;
  }
  return models.filter((model) => {
    let tagCheck = true;
    if (tags && tags.length > 0) {
      tagCheck = tags.every((tag) => model.tags.includes(tag));
    }
    let typeCheck = true;
    if (type) {
      typeCheck = model.type == type;
    }
    return tagCheck && typeCheck;
  });
};

export const GetModel = (id: string): TextModel | undefined => {
  for (let modelMetadata of models) {
    if (modelMetadata.id === id) {
      switch (modelMetadata.type) {
        case TextModelType.FeatureExtraction: {
          return new FeatureExtractionModel(modelMetadata);
        }
        case TextModelType.Seq2Seq: {
          return new Seq2SeqModel(modelMetadata);
        }
      }
    }
  }
};

const models: TextMetadata[] = [
  {
    id: "grammar-t5-efficient-tiny-quant",
    title: "T5 Efficient TINY quantized",
    description: "",
    type: TextModelType.Seq2Seq,
    sizeMB: 32,
    modelPaths: new Map<string, string>([
      ["encoder", "https://edge-ai-models.s3.us-east-2.amazonaws.com/grammar/tiny-encoder-quant.onnx"],
      ["decoder", "https://edge-ai-models.s3.us-east-2.amazonaws.com/grammar/tiny-decoder-init-quant.onnx"],
    ]),
    tokenizerPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/grammar/tokenizer.json",
    tags: ["grammar", "t5"],
  },
  {
    id: "grammar-t5-efficient-mini-quant",
    title: "T5 Efficient MINI quantized",
    description: "",
    type: TextModelType.Seq2Seq,
    sizeMB: 55,
    modelPaths: new Map<string, string>([
      ["encoder", "https://edge-ai-models.s3.us-east-2.amazonaws.com/grammar/mini-encoder-quant.onnx"],
      ["decoder", "https://edge-ai-models.s3.us-east-2.amazonaws.com/grammar/mini-decoder-init-quant.onnx"],
    ]),
    tokenizerPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/grammar/tokenizer.json",
    tags: ["grammar", "t5"],
  },
  {
    id: "grammar-t5-efficient-tiny",
    title: "T5 Efficient TINY",
    description: "",
    type: TextModelType.Seq2Seq,
    sizeMB: 122,
    modelPaths: new Map<string, string>([
      ["encoder", "https://edge-ai-models.s3.us-east-2.amazonaws.com/grammar/tiny-encoder.onnx"],
      ["decoder", "https://edge-ai-models.s3.us-east-2.amazonaws.com/grammar/tiny-decoder-init.onnx"],
    ]),
    tokenizerPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/grammar/tokenizer.json",
    tags: ["grammar", "t5"],
  },
  {
    id: "grammar-t5-efficient-tiny",
    title: "T5 Efficient MINI",
    description: "",
    type: TextModelType.Seq2Seq,
    sizeMB: 214,
    modelPaths: new Map<string, string>([
      ["encoder", "https://edge-ai-models.s3.us-east-2.amazonaws.com/grammar/mini-encoder.onnx"],
      ["decoder", "https://edge-ai-models.s3.us-east-2.amazonaws.com/grammar/mini-decoder-init.onnx"],
    ]),
    tokenizerPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/grammar/tokenizer.json",
    tags: ["grammar", "t5"],
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
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/feature-extraction/t5-efficient-mini-encoder-quant.onnx",
      ],
      [
        "decoder",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/feature-extraction/t5-efficient-mini-decoder-quant.onnx",
      ],
    ]),
    tokenizerPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/grammar/tokenizer.json",
    tags: ["feature-extraction", "t5"],
  },
  {
    id: "t5-efficient-mini",
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
    tokenizerPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/grammar/tokenizer.json",
    tags: ["feature-extraction", "t5"],
  },
  {
    id: "t5-flan-small",
    title: "T5 Flan small",
    description: "",
    type: TextModelType.Seq2Seq,
    sizeMB: 355,
    modelPaths: new Map<string, string>([
      ["encoder", "https://edge-ai-models.s3.us-east-2.amazonaws.com/flan/flan-t5-small-encoder.onnx"],
      ["decoder", "https://edge-ai-models.s3.us-east-2.amazonaws.com/flan/flan-t5-small-decoder.onnx"],
    ]),
    tokenizerPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/grammar/tokenizer.json",
    tags: ["general", "t5-flan"],
  },
];
