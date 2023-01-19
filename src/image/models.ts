import { ImageMetadata } from "./metadata";
import { ImageModelType } from "./modelType";

export const ListImageModels = (tags?: string[], type?: ImageModelType): ImageMetadata[] => {
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

const classificationExamples: string[] = [
  "https://edge-ai-models.s3.us-east-2.amazonaws.com/images/classification/image-1.jpg",
  "https://edge-ai-models.s3.us-east-2.amazonaws.com/images/classification/image-2.jpg",
  "https://edge-ai-models.s3.us-east-2.amazonaws.com/images/classification/image-3.jpg",
  "https://edge-ai-models.s3.us-east-2.amazonaws.com/images/classification/image-4.jpg",
  "https://edge-ai-models.s3.us-east-2.amazonaws.com/images/classification/image-5.jpg",
  "https://edge-ai-models.s3.us-east-2.amazonaws.com/images/classification/image-6.jpg",
];

const segmentationExamples: string[] = [
  "https://edge-ai-models.s3.us-east-2.amazonaws.com/images/segmentation/image-1.jpg",
  "https://edge-ai-models.s3.us-east-2.amazonaws.com/images/segmentation/image-2.jpg",
  "https://edge-ai-models.s3.us-east-2.amazonaws.com/images/segmentation/image-3.jpg",
  "https://edge-ai-models.s3.us-east-2.amazonaws.com/images/segmentation/image-4.jpg",
  "https://edge-ai-models.s3.us-east-2.amazonaws.com/images/segmentation/image-5.jpg",
  "https://edge-ai-models.s3.us-east-2.amazonaws.com/images/segmentation/image-6.jpg",
];

export const models: ImageMetadata[] = [
  {
    id: "mobilevit-small",
    title: "MobileViT small",
    description: "",
    type: ImageModelType.Classification,
    sizeMB: 19,
    modelPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/classification/mobilevit-small.onnx.gz",
    configPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/classification/mobilevit_config.json",
    preprocessorPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/classification/mobilevit_preprocessor_config.json",
    examples: classificationExamples,
    tags: ["classification", "mobilevit"],
  },
  {
    id: "mobilevit-xsmall",
    title: "MobileViT extra small",
    description: "",
    type: ImageModelType.Classification,
    sizeMB: 8,
    modelPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/classification/mobilevit-x-small.onnx.gz",
    configPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/classification/mobilevit_config.json",
    preprocessorPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/classification/mobilevit_preprocessor_config.json",
    examples: classificationExamples,
    tags: ["classification", "mobilevit"],
  },
  {
    id: "mobilevit-xxsmall",
    title: "MobileViT extra extra small",
    description: "",
    type: ImageModelType.Classification,
    sizeMB: 5,
    modelPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/classification/mobilevit-xx-small.onnx.gz",
    configPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/classification/mobilevit_config.json",
    preprocessorPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/classification/mobilevit_preprocessor_config.json",
    examples: classificationExamples,
    tags: ["classification", "mobilevit"],
  },
  {
    id: "segformer-b2-classification",
    title: "SegFormer B2",
    description: "",
    type: ImageModelType.Classification,
    sizeMB: 95,
    modelPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/classification/segformer-b2.onnx.gz",
    configPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/classification/segformer_config.json",
    preprocessorPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/classification/segformer_preprocessor_config.json",
    examples: classificationExamples,
    tags: ["classification", "segformer"],
  },
  {
    id: "segformer-b2-classification-quant",
    title: "SegFormer B2 quantized",
    description: "",
    type: ImageModelType.Classification,
    sizeMB: 24,
    modelPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/classification/segformer-b2-quant.onnx.gz",
    configPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/classification/segformer_config.json",
    preprocessorPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/classification/segformer_preprocessor_config.json",
    examples: classificationExamples,
    tags: ["classification", "segformer"],
  },
  {
    id: "segformer-b1-classification",
    title: "SegFormer B1",
    description: "",
    type: ImageModelType.Classification,
    sizeMB: 52,
    modelPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/classification/segformer-b1.onnx.gz",
    configPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/classification/segformer_config.json",
    preprocessorPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/classification/segformer_preprocessor_config.json",
    examples: classificationExamples,
    tags: ["classification", "segformer"],
  },
  {
    id: "segformer-b1-classification-quant",
    title: "SegFormer B1 quantized",
    description: "",
    type: ImageModelType.Classification,
    sizeMB: 13,
    modelPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/classification/segformer-b1-quant.onnx.gz",
    configPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/classification/segformer_config.json",
    preprocessorPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/classification/segformer_preprocessor_config.json",
    examples: classificationExamples,
    tags: ["classification", "segformer"],
  },
  {
    id: "segformer-b0-classification",
    title: "SegFormer B0",
    description: "",
    type: ImageModelType.Classification,
    sizeMB: 14,
    modelPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/classification/segformer-b0.onnx.gz",
    configPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/classification/segformer_config.json",
    preprocessorPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/classification/segformer_preprocessor_config.json",
    examples: classificationExamples,
    tags: ["classification", "segformer"],
  },
  {
    id: "segformer-b0-classification-quant",
    title: "SegFormer B0 quantized",
    description: "",
    type: ImageModelType.Classification,
    sizeMB: 4,
    modelPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/classification/segformer-b0-quant.onnx.gz",
    configPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/classification/segformer_config.json",
    preprocessorPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/classification/segformer_preprocessor_config.json",
    examples: classificationExamples,
    tags: ["classification", "segformer"],
  },
  {
    id: "yolos-tiny",
    title: "YOLOS tiny",
    description: "",
    type: ImageModelType.ObjectDetection,
    sizeMB: 25,
    modelPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/yolo/model.onnx.gz",
    configPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/yolo/config.json",
    preprocessorPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/yolo/preprocessor_config.json",
    examples: classificationExamples,
    tags: ["object-detection", "yolo"],
  },
  {
    id: "yolos-tiny-quant",
    title: "YOLOS tiny quantized",
    description: "",
    type: ImageModelType.ObjectDetection,
    sizeMB: 25,
    modelPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/yolo/model_quant.onnx.gz",
    configPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/yolo/config.json",
    preprocessorPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/yolo/preprocessor_config.json",
    examples: classificationExamples,
    tags: ["object-detection", "yolo"],
  },
  {
    id: "segformer-b0-segmentation-quant",
    title: "SegFormer B0 quantized",
    description: "",
    type: ImageModelType.Segmentation,
    sizeMB: 4,
    modelPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/segment/b0.onnx.gz",
    configPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/segment/config.json",
    preprocessorPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/segment/preprocessor_config.json",
    examples: segmentationExamples,
    tags: ["segmentation", "segformer"],
  },
  {
    id: "segformer-b1-segmentation-quant",
    title: "SegFormer B1 quantized",
    description: "",
    type: ImageModelType.Segmentation,
    sizeMB: 14,
    modelPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/segment/b1.onnx.gz",
    configPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/segment/config.json",
    preprocessorPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/segment/preprocessor_config.json",
    examples: segmentationExamples,
    tags: ["segmentation", "segformer"],
  },
  {
    id: "segformer-b4-segmentation-quant",
    title: "SegFormer B4 quantized",
    description: "",
    type: ImageModelType.Segmentation,
    sizeMB: 64,
    modelPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/segment/b4.onnx.gz",
    configPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/segment/config.json",
    preprocessorPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/segment/preprocessor_config.json",
    examples: segmentationExamples,
    tags: ["segmentation", "segformer"],
  },
  {
    id: "superres",
    title: "Super Resolution",
    description: "",
    type: ImageModelType.Img2Img,
    sizeMB: 43,
    modelPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/superres/model.onnx.gz",
    preprocessorPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/superres/preprocessor_config.json",
    examples: classificationExamples,
    tags: ["img2img", "superres"],
  },
  {
    id: "superres-quant",
    title: "Super Resolution quantized",
    description: "",
    type: ImageModelType.Img2Img,
    sizeMB: 10,
    modelPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/superres/model_quant.onnx",
    preprocessorPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/superres/preprocessor_config.json",
    examples: classificationExamples,
    tags: ["img2img", "superres"],
  },
];
