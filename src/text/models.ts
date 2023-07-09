import { TextMetadata } from "./metadata.js";
import { ModelType } from "./modeType.js";

export const ListTextModels = (
  tags?: string[],
  type?: ModelType
): TextMetadata[] => {
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
    type: ModelType.Seq2Seq,
    sizeMB: 113,
    modelPaths: new Map<string, string>([
      [
        "encoder",
        "https://web-ai-models.org/text/seq2seq/grammar-correction/t5-tiny/encoder.onnx.gz",
      ],
      [
        "decoder",
        "https://web-ai-models.org/text/seq2seq/grammar-correction/t5-tiny/decoder.onnx.gz",
      ],
    ]),
    outputNames: new Map<string, string>([
      ["encoder", "hidden_states"],
      ["decoder", "logits"],
    ]),
    tokenizerPath:
      "https://web-ai-models.org/text/seq2seq/grammar-correction/t5-tiny/tokenizer.json",
    tokenizerParams: {
      bosTokenID: 0,
      eosTokenID: 1,
      padTokenID: 0,
    },
    tags: ["grammar", "t5"],
    referenceURL:
      "https://huggingface.co/visheratin/t5-efficient-tiny-grammar-correction",
  },
  {
    id: "grammar-t5-efficient-tiny-quant",
    title: "T5 Efficient tiny quantized",
    description: "",
    memEstimateMB: 200,
    type: ModelType.Seq2Seq,
    sizeMB: 32,
    modelPaths: new Map<string, string>([
      [
        "encoder",
        "https://web-ai-models.org/text/seq2seq/grammar-correction/t5-tiny/encoder-quant.onnx.gz",
      ],
      [
        "decoder",
        "https://web-ai-models.org/text/seq2seq/grammar-correction/t5-tiny/decoder-quant.onnx.gz",
      ],
    ]),
    outputNames: new Map<string, string>([
      ["encoder", "hidden_states"],
      ["decoder", "logits"],
    ]),
    tokenizerPath:
      "https://web-ai-models.org/text/seq2seq/grammar-correction/t5-tiny/tokenizer.json",
    tokenizerParams: {
      bosTokenID: 0,
      eosTokenID: 1,
      padTokenID: 0,
    },
    tags: ["grammar", "t5"],
    referenceURL:
      "https://huggingface.co/visheratin/t5-efficient-tiny-grammar-correction",
  },
  {
    id: "grammar-t5-efficient-mini",
    title: "T5 Efficient mini",
    description: "",
    memEstimateMB: 600,
    type: ModelType.Seq2Seq,
    sizeMB: 197,
    modelPaths: new Map<string, string>([
      [
        "encoder",
        "https://web-ai-models.org/text/seq2seq/grammar-correction/t5-mini/encoder.onnx.gz",
      ],
      [
        "decoder",
        "https://web-ai-models.org/text/seq2seq/grammar-correction/t5-mini/decoder.onnx.gz",
      ],
    ]),
    outputNames: new Map<string, string>([
      ["encoder", "hidden_states"],
      ["decoder", "logits"],
    ]),
    tokenizerPath:
      "https://web-ai-models.org/text/seq2seq/grammar-correction/t5-mini/tokenizer.json",
    tokenizerParams: {
      bosTokenID: 0,
      eosTokenID: 1,
      padTokenID: 0,
    },
    tags: ["grammar", "t5"],
    referenceURL:
      "https://huggingface.co/visheratin/t5-efficient-mini-grammar-correction",
  },
  {
    id: "grammar-t5-efficient-mini-quant",
    title: "T5 Efficient mini quantized",
    description: "",
    memEstimateMB: 250,
    type: ModelType.Seq2Seq,
    sizeMB: 38,
    modelPaths: new Map<string, string>([
      [
        "encoder",
        "https://web-ai-models.org/text/seq2seq/grammar-correction/t5-mini/encoder-quant.onnx.gz",
      ],
      [
        "decoder",
        "https://web-ai-models.org/text/seq2seq/grammar-correction/t5-mini/decoder-quant.onnx.gz",
      ],
    ]),
    outputNames: new Map<string, string>([
      ["encoder", "hidden_states"],
      ["decoder", "logits"],
    ]),
    tokenizerPath:
      "https://web-ai-models.org/text/seq2seq/grammar-correction/t5-mini/tokenizer.json",
    tokenizerParams: {
      bosTokenID: 0,
      eosTokenID: 1,
      padTokenID: 0,
    },
    tags: ["grammar", "t5"],
    referenceURL:
      "https://huggingface.co/visheratin/t5-efficient-mini-grammar-correction",
  },
  {
    id: "flan-t5-small",
    title: "T5 Flan small",
    description: "",
    memEstimateMB: 1000,
    type: ModelType.Seq2Seq,
    sizeMB: 330,
    modelPaths: new Map<string, string>([
      [
        "encoder",
        "https://web-ai-models.org/text/seq2seq/general/flan-t5-small/encoder.onnx.gz",
      ],
      [
        "decoder",
        "https://web-ai-models.org/text/seq2seq/general/flan-t5-small/decoder.onnx.gz",
      ],
    ]),
    outputNames: new Map<string, string>([
      ["encoder", "hidden_states"],
      ["decoder", "logits"],
    ]),
    tokenizerPath:
      "https://web-ai-models.org/text/seq2seq/general/flan-t5-small/tokenizer.json",
    tokenizerParams: {
      bosTokenID: 0,
      eosTokenID: 1,
      padTokenID: 0,
    },
    tags: ["general", "flan-t5"],
    referenceURL: "https://huggingface.co/google/flan-t5-small",
  },
  {
    id: "summarization-cnn-dailymail",
    title: "T5 for text summarization",
    description: "",
    memEstimateMB: 1100,
    type: ModelType.Seq2Seq,
    sizeMB: 328,
    modelPaths: new Map<string, string>([
      [
        "encoder",
        "https://web-ai-models.org/text/seq2seq/summarization/minhtoanphan/encoder.onnx.gz",
      ],
      [
        "decoder",
        "https://web-ai-models.org/text/seq2seq/summarization/minhtoanphan/decoder.onnx.gz",
      ],
    ]),
    outputNames: new Map<string, string>([
      ["encoder", "hidden_states"],
      ["decoder", "logits"],
    ]),
    tokenizerPath:
      "https://web-ai-models.org/text/seq2seq/summarization/minhtoanphan/tokenizer.json",
    tokenizerParams: {
      bosTokenID: 0,
      eosTokenID: 1,
      padTokenID: 0,
    },
    tags: ["summarization", "t5"],
    prefixes: ["summarize"],
    referenceURL: "https://huggingface.co/minhtoan/t5-finetune-cnndaily-news",
  },
  {
    id: "summarization-cnn-dailymail-quant",
    title: "T5 for text summarization quantized",
    description: "",
    memEstimateMB: 400,
    type: ModelType.Seq2Seq,
    sizeMB: 63,
    modelPaths: new Map<string, string>([
      [
        "encoder",
        "https://web-ai-models.org/text/seq2seq/summarization/minhtoanphan/encoder-quant.onnx.gz",
      ],
      [
        "decoder",
        "https://web-ai-models.org/text/seq2seq/summarization/minhtoanphan/decoder-quant.onnx.gz",
      ],
    ]),
    outputNames: new Map<string, string>([
      ["encoder", "hidden_states"],
      ["decoder", "logits"],
    ]),
    tokenizerPath:
      "https://huggingface.co/minhtoan/t5-finetune-cnndaily-news/resolve/main/tokenizer.json",
    tokenizerParams: {
      bosTokenID: 0,
      eosTokenID: 1,
      padTokenID: 0,
    },
    tags: ["summarization", "t5"],
    prefixes: ["summarize"],
    referenceURL: "https://huggingface.co/minhtoan/t5-finetune-cnndaily-news",
  },
  {
    id: "sentence-t5",
    title: "Sentence T5",
    description: "",
    memEstimateMB: 1000,
    type: ModelType.FeatureExtraction,
    sizeMB: 190,
    modelPaths: new Map<string, string>([
      [
        "encoder",
        "https://web-ai-models.org/text/feature-extraction/sentence-t5/base.onnx.gz",
      ],
      [
        "dense",
        "https://web-ai-models.org/text/feature-extraction/sentence-t5/base-dense.onnx.gz",
      ],
    ]),
    outputNames: new Map<string, string>([["encoder", "hidden_states"]]),
    tokenizerPath:
      "https://huggingface.co/sentence-transformers/sentence-t5-base/resolve/main/tokenizer.json",
    tokenizerParams: {
      bosTokenID: 0,
      eosTokenID: 1,
      padTokenID: 0,
    },
    tags: ["feature-extraction", "t5"],
    referenceURL:
      "https://huggingface.co/sentence-transformers/sentence-t5-base",
  },
  {
    id: "sentence-t5-quant",
    title: "Sentence T5 quantized",
    description: "",
    memEstimateMB: 400,
    type: ModelType.FeatureExtraction,
    sizeMB: 79,
    modelPaths: new Map<string, string>([
      [
        "encoder",
        "https://web-ai-models.org/text/feature-extraction/sentence-t5/base-quant.onnx.gz",
      ],
      [
        "dense",
        "https://web-ai-models.org/text/feature-extraction/sentence-t5/base-dense-quant.onnx.gz",
      ],
    ]),
    outputNames: new Map<string, string>([["encoder", "hidden_states"]]),
    tokenizerPath:
      "https://huggingface.co/sentence-transformers/sentence-t5-base/resolve/main/tokenizer.json",
    tokenizerParams: {
      bosTokenID: 0,
      eosTokenID: 1,
      padTokenID: 0,
    },
    tags: ["feature-extraction", "t5"],
    referenceURL:
      "https://huggingface.co/sentence-transformers/sentence-t5-base",
  },
  {
    id: "sentence-t5-large-quant",
    title: "Sentence T5 large quantized",
    description: "",
    memEstimateMB: 1000,
    type: ModelType.FeatureExtraction,
    sizeMB: 242,
    modelPaths: new Map<string, string>([
      [
        "encoder",
        "https://web-ai-models.org/text/feature-extraction/sentence-t5/large-quant.onnx.gz",
      ],
      [
        "dense",
        "https://web-ai-models.org/text/feature-extraction/sentence-t5/large-dense-quant.onnx.gz",
      ],
    ]),
    outputNames: new Map<string, string>([["encoder", "hidden_states"]]),
    tokenizerPath:
      "https://huggingface.co/sentence-transformers/sentence-t5-large/resolve/main/tokenizer.json",
    tokenizerParams: {
      bosTokenID: 0,
      eosTokenID: 1,
      padTokenID: 0,
    },
    tags: ["feature-extraction", "t5"],
    referenceURL:
      "https://huggingface.co/sentence-transformers/sentence-t5-large",
  },
  {
    id: "gtr-t5",
    title: "GTR T5",
    description: "",
    memEstimateMB: 1000,
    type: ModelType.FeatureExtraction,
    sizeMB: 185,
    modelPaths: new Map<string, string>([
      [
        "encoder",
        "https://web-ai-models.org/text/feature-extraction/gtr-t5/base.onnx.gz",
      ],
      [
        "dense",
        "https://web-ai-models.org/text/feature-extraction/gtr-t5/base-dense.onnx.gz",
      ],
    ]),
    outputNames: new Map<string, string>([["encoder", "hidden_states"]]),
    tokenizerPath:
      "https://huggingface.co/sentence-transformers/sentence-t5-base/resolve/main/tokenizer.json",
    tokenizerParams: {
      bosTokenID: 0,
      eosTokenID: 1,
      padTokenID: 0,
    },
    tags: ["feature-extraction", "t5"],
    referenceURL: "https://huggingface.co/sentence-transformers/gtr-t5-base",
  },
  {
    id: "gtr-t5-quant",
    title: "GTR T5 quantized",
    description: "",
    memEstimateMB: 400,
    type: ModelType.FeatureExtraction,
    sizeMB: 78,
    modelPaths: new Map<string, string>([
      [
        "encoder",
        "https://web-ai-models.org/text/feature-extraction/gtr-t5/base-quant.onnx.gz",
      ],
      [
        "dense",
        "https://web-ai-models.org/text/feature-extraction/gtr-t5/base-dense-quant.onnx.gz",
      ],
    ]),
    outputNames: new Map<string, string>([["encoder", "hidden_states"]]),
    tokenizerPath:
      "https://huggingface.co/sentence-transformers/sentence-t5-base/resolve/main/tokenizer.json",
    tokenizerParams: {
      bosTokenID: 0,
      eosTokenID: 1,
      padTokenID: 0,
    },
    tags: ["feature-extraction", "t5"],
    referenceURL: "https://huggingface.co/sentence-transformers/gtr-t5-base",
  },
  {
    id: "gtr-t5-large-quant",
    title: "GTR T5 large quantized",
    description: "",
    memEstimateMB: 1000,
    type: ModelType.FeatureExtraction,
    sizeMB: 242,
    modelPaths: new Map<string, string>([
      [
        "encoder",
        "https://web-ai-models.org/text/feature-extraction/gtr-t5/large-quant.onnx.gz",
      ],
      [
        "dense",
        "https://web-ai-models.org/text/feature-extraction/gtr-t5/large-dense-quant.onnx.gz",
      ],
    ]),
    outputNames: new Map<string, string>([["encoder", "hidden_states"]]),
    tokenizerPath:
      "https://huggingface.co/sentence-transformers/sentence-t5-large/resolve/main/tokenizer.json",
    tokenizerParams: {
      bosTokenID: 0,
      eosTokenID: 1,
      padTokenID: 0,
    },
    tags: ["feature-extraction", "t5"],
    referenceURL: "https://huggingface.co/sentence-transformers/gtr-t5-large",
  },
  {
    id: "mini-lm-v2",
    title: "Mini model for sentence embeddings",
    description: "",
    memEstimateMB: 300,
    type: ModelType.FeatureExtraction,
    sizeMB: 80,
    modelPaths: new Map<string, string>([
      [
        "encoder",
        "https://web-ai-models.org/text/feature-extraction/miniLM-v2/model.onnx.gz",
      ],
    ]),
    outputNames: new Map<string, string>([["encoder", "last_hidden_state"]]),
    tokenizerPath:
      "https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/resolve/main/tokenizer.json",
    tokenizerParams: {
      bosTokenID: 0,
      eosTokenID: 1,
      padTokenID: 0,
    },
    tags: ["feature-extraction", "t5"],
    referenceURL:
      "https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2",
  },
  {
    id: "mini-lm-v2-quant",
    title: "Quantized mini model for sentence embeddings",
    description: "",
    memEstimateMB: 100,
    type: ModelType.FeatureExtraction,
    sizeMB: 15,
    modelPaths: new Map<string, string>([
      [
        "encoder",
        "https://web-ai-models.org/text/feature-extraction/miniLM-v2/model-quant.onnx.gz",
      ],
    ]),
    outputNames: new Map<string, string>([["encoder", "last_hidden_state"]]),
    tokenizerPath:
      "https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/resolve/main/tokenizer.json",
    tokenizerParams: {
      bosTokenID: 0,
      eosTokenID: 1,
      padTokenID: 0,
    },
    tags: ["feature-extraction", "t5"],
    referenceURL:
      "https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2",
  },
  {
    id: "flan-t5-samsum-quant",
    title: "Flan T5 for chat summarization quantized",
    description: "",
    memEstimateMB: 400,
    type: ModelType.Seq2Seq,
    sizeMB: 185,
    modelPaths: new Map<string, string>([
      [
        "encoder",
        "https://web-ai-models.org/text/seq2seq/summarization/samsum/encoder-quant.onnx.gz",
      ],
      [
        "decoder",
        "https://web-ai-models.org/text/seq2seq/summarization/samsum/decoder-quant.onnx.gz",
      ],
    ]),
    outputNames: new Map<string, string>([
      ["encoder", "last_hidden_state"],
      ["decoder", "logits"],
    ]),
    tokenizerPath:
      "https://web-ai-models.org/text/seq2seq/summarization/samsum/tokenizer.json",
    tokenizerParams: {
      bosTokenID: 0,
      eosTokenID: 1,
      padTokenID: 0,
    },
    tags: ["summarization", "flan-t5"],
    prefixes: ["summarize"],
    referenceURL: "https://huggingface.co/philschmid/flan-t5-base-samsum",
  },
  {
    id: "flan-t5-base-quant",
    title: "Flan T5 quantized",
    description: "",
    memEstimateMB: 400,
    type: ModelType.Seq2Seq,
    sizeMB: 185,
    modelPaths: new Map<string, string>([
      [
        "encoder",
        "https://web-ai-models.org/text/seq2seq/general/flan-t5-base/encoder-quant.onnx.gz",
      ],
      [
        "decoder",
        "https://web-ai-models.org/text/seq2seq/general/flan-t5-base/decoder-quant.onnx.gz",
      ],
    ]),
    outputNames: new Map<string, string>([
      ["encoder", "last_hidden_state"],
      ["decoder", "logits"],
    ]),
    tokenizerPath:
      "https://web-ai-models.org/text/seq2seq/general/flan-t5-base/tokenizer.json",
    tokenizerParams: {
      bosTokenID: 0,
      eosTokenID: 1,
      padTokenID: 0,
    },
    tags: ["summarization", "flan-t5"],
    prefixes: ["summarize"],
    referenceURL: "https://huggingface.co/philschmid/flan-t5-base-samsum",
  },
];
