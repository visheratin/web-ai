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

const superresExamples: string[] = [
  "https://edge-ai-models.s3.us-east-2.amazonaws.com/images/superres/butterfly.png",
  "https://edge-ai-models.s3.us-east-2.amazonaws.com/images/superres/shanghai.jpg",
  "https://edge-ai-models.s3.us-east-2.amazonaws.com/images/superres/tree.jpg",
];

export const models: ImageMetadata[] = [
  {
    id: "mobilevit-small",
    title: "MobileViT small",
    description: "",
    type: ImageModelType.Classification,
    sizeMB: 19,
    modelPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/classification/mobilevit-small/model.onnx.gz",
    configPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/classification/mobilevit-small/config.json",
    preprocessorPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/classification/mobilevit-small/preprocessor_config.json",
    examples: classificationExamples,
    tags: ["classification", "mobilevit"],
    referenceURL: "https://huggingface.co/apple/mobilevit-small",
  },
  {
    id: "mobilevit-small-quant",
    title: "MobileViT small quantized",
    description: "",
    type: ImageModelType.Classification,
    sizeMB: 4,
    modelPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/classification/mobilevit-small/model-quant.onnx.gz",
    configPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/classification/mobilevit-small/config.json",
    preprocessorPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/classification/mobilevit-small/preprocessor_config.json",
    examples: classificationExamples,
    tags: ["classification", "mobilevit"],
    referenceURL: "https://huggingface.co/apple/mobilevit-small",
  },
  {
    id: "mobilevit-xsmall",
    title: "MobileViT extra small",
    description: "",
    type: ImageModelType.Classification,
    sizeMB: 8,
    modelPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/classification/mobilevit-x-small/model.onnx.gz",
    configPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/classification/mobilevit-x-small/config.json",
    preprocessorPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/classification/mobilevit-x-small/preprocessor_config.json",
    examples: classificationExamples,
    tags: ["classification", "mobilevit"],
    referenceURL: "https://huggingface.co/apple/mobilevit-x-small",
  },
  {
    id: "mobilevit-xsmall-quant",
    title: "MobileViT extra small quantized",
    description: "",
    type: ImageModelType.Classification,
    sizeMB: 2,
    modelPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/classification/mobilevit-x-small/model-quant.onnx.gz",
    configPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/classification/mobilevit-x-small/config.json",
    preprocessorPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/classification/mobilevit-x-small/preprocessor_config.json",
    examples: classificationExamples,
    tags: ["classification", "mobilevit"],
    referenceURL: "https://huggingface.co/apple/mobilevit-x-small",
  },
  {
    id: "mobilevit-xxsmall",
    title: "MobileViT extra extra small",
    description: "",
    type: ImageModelType.Classification,
    sizeMB: 5,
    modelPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/classification/mobilevit-xx-small/model.onnx.gz",
    configPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/classification/mobilevit-xx-small/config.json",
    preprocessorPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/classification/mobilevit-xx-small/preprocessor_config.json",
    examples: classificationExamples,
    tags: ["classification", "mobilevit"],
    referenceURL: "https://huggingface.co/apple/mobilevit-xx-small",
  },
  {
    id: "mobilevit-xxsmall-quant",
    title: "MobileViT extra extra small quantized",
    description: "",
    type: ImageModelType.Classification,
    sizeMB: 1,
    modelPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/classification/mobilevit-xx-small/model-quant.onnx.gz",
    configPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/classification/mobilevit-xx-small/config.json",
    preprocessorPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/classification/mobilevit-xx-small/preprocessor_config.json",
    examples: classificationExamples,
    tags: ["classification", "mobilevit"],
    referenceURL: "https://huggingface.co/apple/mobilevit-xx-small",
  },
  {
    id: "segformer-b2-classification",
    title: "SegFormer large",
    description: "",
    type: ImageModelType.Classification,
    sizeMB: 90,
    modelPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/classification/segformer-b2/model.onnx.gz",
    configPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/classification/segformer-b2/config.json",
    preprocessorPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/classification/segformer-b2/config.json",
    examples: classificationExamples,
    tags: ["classification", "segformer"],
    referenceURL: "https://huggingface.co/nvidia/segformer-b2-finetuned-ade-512-512",
  },
  {
    id: "segformer-b2-classification-quant",
    title: "SegFormer large quantized",
    description: "",
    type: ImageModelType.Classification,
    sizeMB: 18,
    modelPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/classification/segformer-b2/model-quant.onnx.gz",
    configPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/classification/segformer-b2/config.json",
    preprocessorPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/classification/segformer-b2/preprocessor_config.json",
    examples: classificationExamples,
    tags: ["classification", "segformer"],
    referenceURL: "https://huggingface.co/nvidia/segformer-b2-finetuned-ade-512-512",
  },
  {
    id: "segformer-b1-classification",
    title: "SegFormer medium",
    description: "",
    type: ImageModelType.Classification,
    sizeMB: 50,
    modelPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/classification/segformer-b1/model.onnx.gz",
    configPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/classification/segformer-b1/config.json",
    preprocessorPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/classification/segformer-b1/preprocessor_config.json",
    examples: classificationExamples,
    tags: ["classification", "segformer"],
    referenceURL: "https://huggingface.co/nvidia/segformer-b1-finetuned-ade-512-512",
  },
  {
    id: "segformer-b1-classification-quant",
    title: "SegFormer meduim quantized",
    description: "",
    type: ImageModelType.Classification,
    sizeMB: 10,
    modelPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/classification/segformer-b1/model-quant.onnx.gz",
    configPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/classification/segformer-b1/config.json",
    preprocessorPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/classification/segformer-b1/preprocessor_config.json",
    examples: classificationExamples,
    tags: ["classification", "segformer"],
    referenceURL: "https://huggingface.co/nvidia/segformer-b1-finetuned-ade-512-512",
  },
  {
    id: "segformer-b0-classification",
    title: "SegFormer small",
    description: "",
    type: ImageModelType.Classification,
    sizeMB: 13,
    modelPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/classification/segformer-b0/model.onnx.gz",
    configPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/classification/segformer-b0/config.json",
    preprocessorPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/classification/segformer-b0/preprocessor_config.json",
    examples: classificationExamples,
    tags: ["classification", "segformer"],
    referenceURL: "https://huggingface.co/nvidia/segformer-b0-finetuned-ade-512-512",
  },
  {
    id: "segformer-b0-classification-quant",
    title: "SegFormer B0 quantized",
    description: "",
    type: ImageModelType.Classification,
    sizeMB: 3,
    modelPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/classification/segformer-b0/model-quant.onnx.gz",
    configPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/classification/segformer-b0/config.json",
    preprocessorPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/classification/segformer-b0/preprocessor_config.json",
    examples: classificationExamples,
    tags: ["classification", "segformer"],
    referenceURL: "https://huggingface.co/nvidia/segformer-b0-finetuned-ade-512-512",
  },
  {
    id: "yolos-tiny",
    title: "YOLOS tiny",
    description: "",
    type: ImageModelType.ObjectDetection,
    sizeMB: 24,
    modelPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/object-detection/yolos/model.onnx.gz",
    configPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/object-detection/yolos/config.json",
    preprocessorPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/object-detection/yolos/preprocessor_config.json",
    examples: classificationExamples,
    tags: ["object-detection", "yolo"],
    referenceURL: "https://huggingface.co/hustvl/yolos-tiny",
  },
  {
    id: "yolos-tiny-quant",
    title: "YOLOS tiny quantized",
    description: "",
    type: ImageModelType.ObjectDetection,
    sizeMB: 8,
    modelPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/object-detection/yolos/model-quant.onnx.gz",
    configPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/object-detection/yolos/config.json",
    preprocessorPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/object-detection/yolos/preprocessor_config.json",
    examples: classificationExamples,
    tags: ["object-detection", "yolo"],
    referenceURL: "https://huggingface.co/hustvl/yolos-tiny",
  },
  {
    id: "segformer-b0-segmentation-quant",
    title: "SegFormer small quantized",
    description: "",
    type: ImageModelType.Segmentation,
    sizeMB: 3,
    modelPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/segmentation/segformer-b0/model-quant.onnx.gz",
    configPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/segmentation/segformer-b0/config.json",
    preprocessorPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/segmentation/segformer-b0/preprocessor_config.json",
    examples: segmentationExamples,
    tags: ["segmentation", "segformer"],
    referenceURL: "https://huggingface.co/nvidia/segformer-b0-finetuned-ade-512-512",
  },
  {
    id: "segformer-b1-segmentation-quant",
    title: "SegFormer meduim quantized",
    description: "",
    type: ImageModelType.Segmentation,
    sizeMB: 9,
    modelPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/segmentation/segformer-b0/model-quant.onnx.gz",
    configPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/segmentation/segformer-b0/config.json",
    preprocessorPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/segmentation/segformer-b0/preprocessor_config.json",
    examples: segmentationExamples,
    tags: ["segmentation", "segformer"],
    referenceURL: "https://huggingface.co/nvidia/segformer-b1-finetuned-ade-512-512",
  },
  {
    id: "segformer-b4-segmentation-quant",
    title: "SegFormer large quantized",
    description: "",
    type: ImageModelType.Segmentation,
    sizeMB: 42,
    modelPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/segmentation/segformer-b4/model.onnx.gz",
    configPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/segmentation/segformer-b0/config.json",
    preprocessorPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/segmentation/segformer-b0/preprocessor_config.json",
    examples: segmentationExamples,
    tags: ["segmentation", "segformer"],
    referenceURL: "https://huggingface.co/nvidia/segformer-b4-finetuned-ade-512-512",
  },
  {
    id: "superres-standard",
    title: "Super-resolution x2 regular",
    description: "",
    type: ImageModelType.Img2Img,
    sizeMB: 43,
    modelPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/img2img/standard/model.onnx.gz",
    preprocessorPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/img2img/standard/preprocessor_config.json",
    examples: superresExamples,
    tags: ["img2img", "superres"],
    referenceURL: "https://huggingface.co/caidas/swin2SR-classical-sr-x2-64",
  },
  {
    id: "superres-standard-quant",
    title: "Super-resolution x2 regular quantized",
    description: "",
    type: ImageModelType.Img2Img,
    sizeMB: 10,
    modelPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/img2img/standard/model-quant.onnx.gz",
    preprocessorPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/img2img/standard/preprocessor_config.json",
    examples: superresExamples,
    tags: ["img2img", "superres"],
    referenceURL: "https://huggingface.co/caidas/swin2SR-classical-sr-x2-64",
  },
  {
    id: "superres-small",
    title: "Super-resolution x2 small",
    description: "",
    type: ImageModelType.Img2Img,
    sizeMB: 4,
    modelPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/img2img/small/model.onnx.gz",
    preprocessorPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/img2img/small/preprocessor_config.json",
    examples: superresExamples,
    tags: ["img2img", "superres"],
    referenceURL: "https://huggingface.co/caidas/swin2SR-lightweight-x2-64",
  },
  {
    id: "superres-small-quant",
    title: "Super-resolution x2 small quantized",
    description: "",
    type: ImageModelType.Img2Img,
    sizeMB: 1.5,
    modelPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/img2img/small/model-quant.onnx.gz",
    preprocessorPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/img2img/small/preprocessor_config.json",
    examples: superresExamples,
    tags: ["img2img", "superres"],
    referenceURL: "https://huggingface.co/caidas/swin2SR-lightweight-x2-64",
  },
  {
    id: "superres-standard-x4",
    title: "Super-resolution x4 regular",
    description: "",
    type: ImageModelType.Img2Img,
    sizeMB: 43,
    modelPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/img2img/standard-x4/model.onnx.gz",
    preprocessorPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/img2img/standard-x4/preprocessor_config.json",
    examples: superresExamples,
    tags: ["img2img", "superres"],
    referenceURL: "https://huggingface.co/caidas/swin2SR-classical-sr-x4-64",
  },
  {
    id: "superres-standard-x4-quant",
    title: "Super-resolution x4 regular quantized",
    description: "",
    type: ImageModelType.Img2Img,
    sizeMB: 10,
    modelPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/img2img/standard-x4/model-quant.onnx.gz",
    preprocessorPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/img2img/standard-x4/preprocessor_config.json",
    examples: superresExamples,
    tags: ["img2img", "superres"],
    referenceURL: "https://huggingface.co/caidas/swin2SR-classical-sr-x4-64",
  },
  {
    id: "superres-compressed-x4",
    title: "Super-resolution x4 for compressed images",
    description: "",
    type: ImageModelType.Img2Img,
    sizeMB: 45,
    modelPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/img2img/compressed/model.onnx.gz",
    preprocessorPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/img2img/compressed/preprocessor_config.json",
    examples: superresExamples,
    tags: ["img2img", "superres"],
    referenceURL: "https://huggingface.co/caidas/swin2SR-compressed-sr-x4-48",
  },
  {
    id: "superres-compressed-x4-quant",
    title: "Super-resolution x4 for compressed images quantized",
    description: "",
    type: ImageModelType.Img2Img,
    sizeMB: 10,
    modelPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/img2img/compressed/model-quant.onnx.gz",
    preprocessorPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/img2img/compressed/preprocessor_config.json",
    examples: superresExamples,
    tags: ["img2img", "superres"],
    referenceURL: "https://huggingface.co/caidas/swin2SR-compressed-sr-x4-48",
  },
  {
    id: "efficientformer-l1-classification",
    title: "EfficientFormer small",
    description: "",
    type: ImageModelType.Classification,
    sizeMB: 43,
    modelPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/classification/EfficientFormer/l1.onnx",
    configPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/classification/EfficientFormer/config.json",
    preprocessorPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/classification/EfficientFormer/preprocessor_config.json",
    examples: classificationExamples,
    tags: ["classification", "efficientformer"],
    referenceURL: "https://huggingface.co/snap-research/efficientformer-l1-300",
  },
  {
    id: "efficientformer-l1-classification-quant",
    title: "EfficientFormer small quantized",
    description: "",
    type: ImageModelType.Classification,
    sizeMB: 11,
    modelPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/classification/EfficientFormer/l1-quant.onnx",
    configPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/classification/EfficientFormer/config.json",
    preprocessorPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/classification/EfficientFormer/preprocessor_config.json",
    examples: classificationExamples,
    tags: ["classification", "efficientformer"],
    referenceURL: "https://huggingface.co/snap-research/efficientformer-l1-300",
  },
  {
    id: "efficientformer-l1-feature",
    title: "EfficientFormer small",
    description: "",
    type: ImageModelType.FeatureExtraction,
    sizeMB: 43,
    modelPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/feature-extraction/EfficientFormer/l1.onnx",
    configPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/feature-extraction/EfficientFormer/config.json",
    preprocessorPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/feature-extraction/EfficientFormer/preprocessor_config.json",
    examples: classificationExamples,
    tags: ["feature-extraction", "efficientformer"],
    referenceURL: "https://huggingface.co/snap-research/efficientformer-l1-300",
  },
  {
    id: "efficientformer-l1-feature-quant",
    title: "EfficientFormer small quantized",
    description: "",
    type: ImageModelType.FeatureExtraction,
    sizeMB: 11,
    modelPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/feature-extraction/EfficientFormer/l1-quant.onnx",
    configPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/feature-extraction/EfficientFormer/config.json",
    preprocessorPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/feature-extraction/EfficientFormer/preprocessor_config.json",
    examples: classificationExamples,
    tags: ["feature-extraction", "efficientformer"],
    referenceURL: "https://huggingface.co/snap-research/efficientformer-l1-300",
  },
  {
    id: "efficientformer-l3-feature",
    title: "EfficientFormer medium",
    description: "",
    type: ImageModelType.FeatureExtraction,
    sizeMB: 116,
    modelPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/feature-extraction/EfficientFormer/l3.onnx",
    configPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/feature-extraction/EfficientFormer/config.json",
    preprocessorPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/feature-extraction/EfficientFormer/preprocessor_config.json",
    examples: classificationExamples,
    tags: ["feature-extraction", "efficientformer"],
    referenceURL: "https://huggingface.co/snap-research/efficientformer-l3-300",
  },
  {
    id: "efficientformer-l3-feature-quant",
    title: "EfficientFormer medium quantized",
    description: "",
    type: ImageModelType.FeatureExtraction,
    sizeMB: 30,
    modelPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/feature-extraction/EfficientFormer/l3-quant.onnx",
    configPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/feature-extraction/EfficientFormer/config.json",
    preprocessorPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/feature-extraction/EfficientFormer/preprocessor_config.json",
    examples: classificationExamples,
    tags: ["feature-extraction", "efficientformer"],
    referenceURL: "https://huggingface.co/snap-research/efficientformer-l3-300",
  },
  {
    id: "efficientformer-l7-feature",
    title: "EfficientFormer large",
    description: "",
    type: ImageModelType.FeatureExtraction,
    sizeMB: 308,
    modelPath: "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/feature-extraction/EfficientFormer/l7.onnx",
    configPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/feature-extraction/EfficientFormer/config.json",
    preprocessorPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/feature-extraction/EfficientFormer/preprocessor_config.json",
    examples: classificationExamples,
    tags: ["feature-extraction", "efficientformer"],
    referenceURL: "https://huggingface.co/snap-research/efficientformer-l7-300",
  },
  {
    id: "efficientformer-l7-feature-quant",
    title: "EfficientFormer large quantized",
    description: "",
    type: ImageModelType.FeatureExtraction,
    sizeMB: 78,
    modelPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/feature-extraction/EfficientFormer/l7-quant.onnx",
    configPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/feature-extraction/EfficientFormer/config.json",
    preprocessorPath:
      "https://edge-ai-models.s3.us-east-2.amazonaws.com/image/feature-extraction/EfficientFormer/preprocessor_config.json",
    examples: classificationExamples,
    tags: ["feature-extraction", "efficientformer"],
    referenceURL: "https://huggingface.co/snap-research/efficientformer-l7-300",
  },
];
