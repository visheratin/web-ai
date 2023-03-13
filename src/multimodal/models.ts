import { MultimodalMetadata } from "./metadata";
import { MultimodalModelType } from "./modelType";

export const ListMultimodalModels = (tags?: string[], type?: MultimodalModelType): MultimodalMetadata[] => {
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
    title: "CLIP base",
    description: "",
    memEstimateMB: 100,
    type: MultimodalModelType.ZeroShotClassification,
    sizeMB: 370,
    modelPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/multimodal/clip-base/model.onnx.gz",
    preprocessorPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/multimodal/clip-base/preprocessor_config.json",
    tokenizerPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/multimodal/clip-base/tokenizer.json",
    tags: ["classification", "clip"],
    referenceURL: "https://huggingface.co/openai/clip-vit-base-patch32",
  },
  {
    id: "clip-base-quant",
    title: "CLIP base quantized",
    description: "",
    memEstimateMB: 100,
    type: MultimodalModelType.ZeroShotClassification,
    sizeMB: 102,
    modelPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/multimodal/clip-base/model-quant.onnx.gz",
    preprocessorPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/multimodal/clip-base/preprocessor_config.json",
    tokenizerPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/multimodal/clip-base/tokenizer.json",
    tags: ["classification", "clip"],
    referenceURL: "https://huggingface.co/openai/clip-vit-base-patch32",
  },
];
