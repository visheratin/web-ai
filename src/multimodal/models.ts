import { MultimodalMetadata } from "./metadata.js";
import { MultimodalModelType } from "./modelType.js";

export const ListMultimodalModels = (
  tags?: string[],
  type?: MultimodalModelType
): MultimodalMetadata[] => {
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
      typeCheck = model.type == type;
    }
    return tagCheck && typeCheck;
  });
};

export const models: MultimodalMetadata[] = [
  {
    id: "clip-base",
    title: "CLIP for zero-shot classification",
    description: "",
    memEstimateMB: 850,
    type: MultimodalModelType.ZeroShotClassification,
    sizeMB: 370,
    modelPaths: new Map([
      [
        "model",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/multimodal/clip-base/model.onnx.gz",
      ],
    ]),
    preprocessorPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/multimodal/clip-base/preprocessor_config.json",
    tokenizerPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/multimodal/clip-base/tokenizer.json",
    tokenizerParams: {
      bosTokenID: 49406,
      eosTokenID: 49407,
      padTokenID: 49407,
    },
    tags: ["classification", "clip"],
    referenceURL: "https://huggingface.co/openai/clip-vit-base-patch32",
  },
  {
    id: "clip-base-quant",
    title: "CLIP for zero-shot classification quantized",
    description: "",
    memEstimateMB: 500,
    type: MultimodalModelType.ZeroShotClassification,
    sizeMB: 102,
    modelPaths: new Map([
      [
        "model",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/multimodal/clip-base/model-quant.onnx.gz",
      ],
    ]),
    preprocessorPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/multimodal/clip-base/preprocessor_config.json",
    tokenizerPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/multimodal/clip-base/tokenizer.json",
    tokenizerParams: {
      bosTokenID: 49406,
      eosTokenID: 49407,
      padTokenID: 49407,
    },
    tags: ["classification", "clip"],
    referenceURL: "https://huggingface.co/openai/clip-vit-base-patch32",
  },
  {
    id: "blip-base",
    title: "BLIP for image captioning",
    description: "",
    memEstimateMB: 2100,
    type: MultimodalModelType.Img2Text,
    sizeMB: 872,
    modelPaths: new Map([
      [
        "image-encoder",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/multimodal/blip-base/encoder.onnx.gz",
      ],
      [
        "text-decoder",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/multimodal/blip-base/decoder.onnx.gz",
      ],
    ]),
    outputNames: new Map<string, string>([
      ["image-encoder", "last_hidden_state"],
      ["text-decoder", "logits"],
    ]),
    preprocessorPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/multimodal/blip-base/preprocessor_config.json",
    tokenizerPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/multimodal/blip-base/tokenizer.json",
    tokenizerParams: {
      bosTokenID: 30522,
      eosTokenID: 2,
      padTokenID: 0,
    },
    tags: ["image-captioning", "blip"],
    referenceURL:
      "https://huggingface.co/Salesforce/blip-image-captioning-base",
  },
  {
    id: "blip-base-quant",
    title: "BLIP for image captioning quantized",
    description: "",
    memEstimateMB: 2100,
    type: MultimodalModelType.Img2Text,
    sizeMB: 161,
    modelPaths: new Map([
      [
        "image-encoder",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/multimodal/blip-base/encoder-quant.onnx.gz",
      ],
      [
        "text-decoder",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/multimodal/blip-base/decoder-quant.onnx.gz",
      ],
    ]),
    outputNames: new Map<string, string>([
      ["image-encoder", "last_hidden_state"],
      ["text-decoder", "logits"],
    ]),
    preprocessorPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/multimodal/blip-base/preprocessor_config.json",
    tokenizerPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/multimodal/blip-base/tokenizer.json",
    tokenizerParams: {
      bosTokenID: 30522,
      eosTokenID: 102,
      padTokenID: 0,
    },
    tags: ["image-captioning", "blip"],
    referenceURL:
      "https://huggingface.co/Salesforce/blip-image-captioning-base",
  },
  {
    id: "blip-vqa-quant",
    title: "BLIP for question answering quantized",
    description: "",
    memEstimateMB: 2100,
    type: MultimodalModelType.Img2Text,
    sizeMB: 161,
    modelPaths: new Map([
      [
        "image-encoder",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/multimodal/blip-vqa/image-encoder-quant.onnx.gz",
      ],
      [
        "text-encoder",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/multimodal/blip-vqa/text-encoder-quant.onnx.gz",
      ],
      [
        "text-decoder",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/multimodal/blip-vqa/text-decoder-quant.onnx.gz",
      ],
    ]),
    outputNames: new Map<string, string>([
      ["image-encoder", "last_hidden_state"],
      ["text-encoder", "last_hidden_state"],
      ["text-decoder", "logits"],
    ]),
    preprocessorPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/multimodal/blip-vqa/preprocessor_config.json",
    tokenizerPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/multimodal/blip-vqa/tokenizer.json",
    tokenizerParams: {
      bosTokenID: 30522,
      eosTokenID: 102,
      padTokenID: 0,
    },
    tags: ["image-captioning", "blip"],
    referenceURL: "https://huggingface.co/Salesforce/blip-vqa-base",
  },
  {
    id: "vit-gpt2",
    title: "ViT-GPT2 for image captioning",
    description: "",
    memEstimateMB: 1800,
    type: MultimodalModelType.Img2Text,
    sizeMB: 980,
    modelPaths: new Map([
      [
        "image-encoder",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/multimodal/vit-gpt2/encoder.onnx.gz",
      ],
      [
        "text-decoder",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/multimodal/vit-gpt2/decoder.onnx.gz",
      ],
    ]),
    outputNames: new Map<string, string>([
      ["image-encoder", "last_hidden_state"],
      ["text-decoder", "logits"],
    ]),
    preprocessorPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/multimodal/vit-gpt2/preprocessor_config.json",
    tokenizerPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/multimodal/vit-gpt2/tokenizer.json",
    tokenizerParams: {
      bosTokenID: 50256,
      eosTokenID: 50256,
      padTokenID: 50256,
    },
    tags: ["image-captioning", "vit-gpt2"],
    referenceURL: "https://huggingface.co/nlpconnect/vit-gpt2-image-captioning",
  },
  {
    id: "vit-gpt2-quant",
    title: "ViT-GPT2 for image captioning quantized",
    description: "",
    memEstimateMB: 1800,
    type: MultimodalModelType.Img2Text,
    sizeMB: 183,
    modelPaths: new Map([
      [
        "image-encoder",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/multimodal/vit-gpt2/encoder-quant.onnx.gz",
      ],
      [
        "text-decoder",
        "https://edge-ai-models.s3.us-east-2.amazonaws.com/multimodal/vit-gpt2/decoder-quant.onnx.gz",
      ],
    ]),
    outputNames: new Map<string, string>([
      ["image-encoder", "last_hidden_state"],
      ["text-decoder", "logits"],
    ]),
    preprocessorPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/multimodal/vit-gpt2/preprocessor_config.json",
    tokenizerPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/multimodal/vit-gpt2/tokenizer.json",
    tokenizerParams: {
      bosTokenID: 50256,
      eosTokenID: 50256,
      padTokenID: 50256,
    },
    tags: ["image-captioning", "vit-gpt2"],
    referenceURL: "https://huggingface.co/nlpconnect/vit-gpt2-image-captioning",
  },
];
