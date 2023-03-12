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
    memEstimateMB: 450,
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
    outputNames: new Map<string, string>([
      ["encoder", "hidden_states"],
      ["decoder", "logits"],
    ]),
    tokenizerPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/text/seq2seq/grammar-correction/t5-tiny/tokenizer.json",
    tags: ["grammar", "t5"],
    referenceURL: "https://huggingface.co/visheratin/t5-efficient-tiny-grammar-correction",
  },
  {
    id: "grammar-t5-efficient-tiny-quant",
    title: "T5 Efficient tiny quantized",
    description: "",
    memEstimateMB: 200,
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
    outputNames: new Map<string, string>([
      ["encoder", "hidden_states"],
      ["decoder", "logits"],
    ]),
    tokenizerPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/text/seq2seq/grammar-correction/t5-tiny/tokenizer.json",
    tags: ["grammar", "t5"],
    referenceURL: "https://huggingface.co/visheratin/t5-efficient-tiny-grammar-correction",
  },
  {
    id: "grammar-t5-efficient-mini",
    title: "T5 Efficient mini",
    description: "",
    memEstimateMB: 600,
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
    outputNames: new Map<string, string>([
      ["encoder", "hidden_states"],
      ["decoder", "logits"],
    ]),
    tokenizerPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/text/seq2seq/grammar-correction/t5-mini/tokenizer.json",
    tags: ["grammar", "t5"],
    referenceURL: "https://huggingface.co/visheratin/t5-efficient-mini-grammar-correction",
  },
  {
    id: "grammar-t5-efficient-mini-quant",
    title: "T5 Efficient mini quantized",
    description: "",
    memEstimateMB: 250,
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
    outputNames: new Map<string, string>([
      ["encoder", "hidden_states"],
      ["decoder", "logits"],
    ]),
    tokenizerPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/text/seq2seq/grammar-correction/t5-mini/tokenizer.json",
    tags: ["grammar", "t5"],
    referenceURL: "https://huggingface.co/visheratin/t5-efficient-mini-grammar-correction",
  },
  {
    id: "t5-flan-small",
    title: "T5 Flan small",
    description: "",
    memEstimateMB: 1000,
    type: TextModelType.Seq2Seq,
    sizeMB: 330,
    modelPaths: new Map<string, string>([
      ["encoder", "https://edge-ai-models.s3.us-east-2.amazonaws.com/text/seq2seq/general/flan-t5/encoder.onnx.gz"],
      ["decoder", "https://edge-ai-models.s3.us-east-2.amazonaws.com/text/seq2seq/general/flan-t5/decoder.onnx.gz"],
    ]),
    outputNames: new Map<string, string>([
      ["encoder", "hidden_states"],
      ["decoder", "logits"],
    ]),
    tokenizerPath: "https://huggingface.co/google/flan-t5-small/resolve/main/tokenizer.json",
    tags: ["general", "t5-flan"],
    referenceURL: "https://huggingface.co/google/flan-t5-small",
  },
  {
    id: "summarization-cnn-dailymail",
    title: "T5 for text summarization",
    description: "",
    memEstimateMB: 1100,
    type: TextModelType.Seq2Seq,
    sizeMB: 328,
    modelPaths: new Map<string, string>([
      [
        "encoder",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/text/seq2seq/summarization/minhtoanphan/encoder.onnx.gz",
      ],
      [
        "decoder",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/text/seq2seq/summarization/minhtoanphan/decoder.onnx.gz",
      ],
    ]),
    outputNames: new Map<string, string>([
      ["encoder", "hidden_states"],
      ["decoder", "logits"],
    ]),
    tokenizerPath: "https://huggingface.co/minhtoan/t5-finetune-cnndaily-news/resolve/main/tokenizer.json",
    tags: ["summarization", "t5"],
    prefixes: ["summarize"],
    referenceURL: "https://huggingface.co/minhtoan/t5-finetune-cnndaily-news",
  },
  {
    id: "summarization-cnn-dailymail-quant",
    title: "T5 for text summarization quantized",
    description: "",
    memEstimateMB: 400,
    type: TextModelType.Seq2Seq,
    sizeMB: 63,
    modelPaths: new Map<string, string>([
      [
        "encoder",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/text/seq2seq/summarization/minhtoanphan/encoder-quant.onnx.gz",
      ],
      [
        "decoder",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/text/seq2seq/summarization/minhtoanphan/decoder-quant.onnx.gz",
      ],
    ]),
    outputNames: new Map<string, string>([
      ["encoder", "hidden_states"],
      ["decoder", "logits"],
    ]),
    tokenizerPath: "https://huggingface.co/minhtoan/t5-finetune-cnndaily-news/resolve/main/tokenizer.json",
    tags: ["summarization", "t5"],
    prefixes: ["summarize"],
    referenceURL: "https://huggingface.co/minhtoan/t5-finetune-cnndaily-news",
  },
  {
    id: "sentence-t5",
    title: "Sentence T5",
    description: "",
    memEstimateMB: 1000,
    type: TextModelType.FeatureExtraction,
    sizeMB: 190,
    modelPaths: new Map<string, string>([
      ["encoder", "https://edge-ai-models.s3.us-east-2.amazonaws.com/text/feature-extraction/sentence-t5/base.onnx.gz"],
      [
        "dense",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/text/feature-extraction/sentence-t5/base-dense.onnx.gz",
      ],
    ]),
    outputNames: new Map<string, string>([["encoder", "hidden_states"]]),
    tokenizerPath: "https://huggingface.co/sentence-transformers/sentence-t5-base/resolve/main/tokenizer.json",
    tags: ["feature-extraction", "t5"],
    referenceURL: "https://huggingface.co/sentence-transformers/sentence-t5-base",
  },
  {
    id: "sentence-t5-quant",
    title: "Sentence T5 quantized",
    description: "",
    memEstimateMB: 400,
    type: TextModelType.FeatureExtraction,
    sizeMB: 79,
    modelPaths: new Map<string, string>([
      [
        "encoder",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/text/feature-extraction/sentence-t5/base-quant.onnx.gz",
      ],
      [
        "dense",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/text/feature-extraction/sentence-t5/base-dense-quant.onnx.gz",
      ],
    ]),
    outputNames: new Map<string, string>([["encoder", "hidden_states"]]),
    tokenizerPath: "https://huggingface.co/sentence-transformers/sentence-t5-base/resolve/main/tokenizer.json",
    tags: ["feature-extraction", "t5"],
    referenceURL: "https://huggingface.co/sentence-transformers/sentence-t5-base",
  },
  {
    id: "sentence-t5-large-quant",
    title: "Sentence T5 large quantized",
    description: "",
    memEstimateMB: 1000,
    type: TextModelType.FeatureExtraction,
    sizeMB: 242,
    modelPaths: new Map<string, string>([
      [
        "encoder",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/text/feature-extraction/sentence-t5/large-quant.onnx.gz",
      ],
      [
        "dense",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/text/feature-extraction/sentence-t5/large-dense-quant.onnx.gz",
      ],
    ]),
    outputNames: new Map<string, string>([["encoder", "hidden_states"]]),
    tokenizerPath: "https://huggingface.co/sentence-transformers/sentence-t5-large/resolve/main/tokenizer.json",
    tags: ["feature-extraction", "t5"],
    referenceURL: "https://huggingface.co/sentence-transformers/sentence-t5-large",
  },
  {
    id: "gtr-t5",
    title: "GTR T5",
    description: "",
    memEstimateMB: 1000,
    type: TextModelType.FeatureExtraction,
    sizeMB: 185,
    modelPaths: new Map<string, string>([
      ["encoder", "https://edge-ai-models.s3.us-east-2.amazonaws.com/text/feature-extraction/gtr-t5/base.onnx.gz"],
      ["dense", "https://edge-ai-models.s3.us-east-2.amazonaws.com/text/feature-extraction/gtr-t5/base-dense.onnx.gz"],
    ]),
    outputNames: new Map<string, string>([["encoder", "hidden_states"]]),
    tokenizerPath: "https://huggingface.co/sentence-transformers/sentence-t5-base/resolve/main/tokenizer.json",
    tags: ["feature-extraction", "t5"],
    referenceURL: "https://huggingface.co/sentence-transformers/gtr-t5-base",
  },
  {
    id: "gtr-t5-quant",
    title: "GTR T5 quantized",
    description: "",
    memEstimateMB: 400,
    type: TextModelType.FeatureExtraction,
    sizeMB: 78,
    modelPaths: new Map<string, string>([
      [
        "encoder",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/text/feature-extraction/gtr-t5/base-quant.onnx.gz",
      ],
      [
        "dense",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/text/feature-extraction/gtr-t5/base-dense-quant.onnx.gz",
      ],
    ]),
    outputNames: new Map<string, string>([["encoder", "hidden_states"]]),
    tokenizerPath: "https://huggingface.co/sentence-transformers/sentence-t5-base/resolve/main/tokenizer.json",
    tags: ["feature-extraction", "t5"],
    referenceURL: "https://huggingface.co/sentence-transformers/gtr-t5-base",
  },
  {
    id: "gtr-t5-large-quant",
    title: "GTR T5 large quantized",
    description: "",
    memEstimateMB: 1000,
    type: TextModelType.FeatureExtraction,
    sizeMB: 242,
    modelPaths: new Map<string, string>([
      [
        "encoder",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/text/feature-extraction/gtr-t5/large-quant.onnx.gz",
      ],
      [
        "dense",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/text/feature-extraction/gtr-t5/large-dense-quant.onnx.gz",
      ],
    ]),
    outputNames: new Map<string, string>([["encoder", "hidden_states"]]),
    tokenizerPath: "https://huggingface.co/sentence-transformers/sentence-t5-large/resolve/main/tokenizer.json",
    tags: ["feature-extraction", "t5"],
    referenceURL: "https://huggingface.co/sentence-transformers/gtr-t5-large",
  },
  {
    id: "mini-lm-v2",
    title: "Mini model for sentence embeddings",
    description: "",
    memEstimateMB: 300,
    type: TextModelType.FeatureExtraction,
    sizeMB: 80,
    modelPaths: new Map<string, string>([
      ["encoder", "https://edge-ai-models.s3.us-east-2.amazonaws.com/text/feature-extraction/miniLM-v2/model.onnx.gz"],
    ]),
    outputNames: new Map<string, string>([["encoder", "last_hidden_state"]]),
    tokenizerPath: "https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/resolve/main/tokenizer.json",
    tags: ["feature-extraction", "t5"],
    referenceURL: "https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2",
  },
  {
    id: "mini-lm-v2-quant",
    title: "Quantized mini model for sentence embeddings",
    description: "",
    memEstimateMB: 100,
    type: TextModelType.FeatureExtraction,
    sizeMB: 15,
    modelPaths: new Map<string, string>([
      [
        "encoder",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/text/feature-extraction/miniLM-v2/model-quant.onnx.gz",
      ],
    ]),
    outputNames: new Map<string, string>([["encoder", "last_hidden_state"]]),
    tokenizerPath: "https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/resolve/main/tokenizer.json",
    tags: ["feature-extraction", "t5"],
    referenceURL: "https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2",
  },
];
