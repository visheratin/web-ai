import { ImageMetadata } from "./metadata.js";
import { ModelType } from "./modelType.js";

export const ListImageModels = (
  tags?: string[],
  type?: ModelType
): ImageMetadata[] => {
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
  "https://web-ai-models.org/images/classification/image-1.jpg",
  "https://web-ai-models.org/images/classification/image-2.jpg",
  "https://web-ai-models.org/images/classification/image-3.jpg",
  "https://web-ai-models.org/images/classification/image-4.jpg",
  "https://web-ai-models.org/images/classification/image-5.jpg",
  "https://web-ai-models.org/images/classification/image-6.jpg",
];

const segmentationExamples: string[] = [
  "https://web-ai-models.org/images/segmentation/image-1.jpg",
  "https://web-ai-models.org/images/segmentation/image-2.jpg",
  "https://web-ai-models.org/images/segmentation/image-3.jpg",
  "https://web-ai-models.org/images/segmentation/image-4.jpg",
  "https://web-ai-models.org/images/segmentation/image-5.jpg",
  "https://web-ai-models.org/images/segmentation/image-6.jpg",
];

const superresExamples: string[] = [
  "https://web-ai-models.org/images/superres/butterfly.png",
  "https://web-ai-models.org/images/superres/shanghai.jpg",
  "https://web-ai-models.org/images/superres/tree.jpg",
];

export const models: ImageMetadata[] = [
  {
    id: "mobilevit-small",
    title: "MobileViT small",
    description: "",
    memEstimateMB: 100,
    type: ModelType.Classification,
    sizeMB: 19,
    modelPaths: new Map([
      [
        "model",
        "https://web-ai-models.org/image/classification/mobilevit-small/model.onnx.gz",
      ],
    ]),
    configPath:
      "https://web-ai-models.org/image/classification/mobilevit-small/config.json",
    preprocessorPath:
      "https://web-ai-models.org/image/classification/mobilevit-small/preprocessor_config.json",
    examples: classificationExamples,
    tags: ["classification", "mobilevit"],
    referenceURL: "https://huggingface.co/apple/mobilevit-small",
  },
  {
    id: "mobilevit-small-quant",
    title: "MobileViT small quantized",
    description: "",
    memEstimateMB: 100,
    type: ModelType.Classification,
    sizeMB: 4,
    modelPaths: new Map<string, string>([
      [
        "model",
        "https://web-ai-models.org/image/classification/mobilevit-small/model-quant.onnx.gz",
      ],
    ]),
    configPath:
      "https://web-ai-models.org/image/classification/mobilevit-small/config.json",
    preprocessorPath:
      "https://web-ai-models.org/image/classification/mobilevit-small/preprocessor_config.json",
    examples: classificationExamples,
    tags: ["classification", "mobilevit"],
    referenceURL: "https://huggingface.co/apple/mobilevit-small",
  },
  {
    id: "mobilevit-xsmall",
    title: "MobileViT extra small",
    description: "",
    memEstimateMB: 50,
    type: ModelType.Classification,
    sizeMB: 8,
    modelPaths: new Map<string, string>([
      [
        "model",
        "https://web-ai-models.org/image/classification/mobilevit-x-small/model.onnx.gz",
      ],
    ]),
    configPath:
      "https://web-ai-models.org/image/classification/mobilevit-x-small/config.json",
    preprocessorPath:
      "https://web-ai-models.org/image/classification/mobilevit-x-small/preprocessor_config.json",
    examples: classificationExamples,
    tags: ["classification", "mobilevit"],
    referenceURL: "https://huggingface.co/apple/mobilevit-x-small",
  },
  {
    id: "mobilevit-xsmall-quant",
    title: "MobileViT extra small quantized",
    description: "",
    memEstimateMB: 50,
    type: ModelType.Classification,
    sizeMB: 2,
    modelPaths: new Map<string, string>([
      [
        "model",
        "https://web-ai-models.org/image/classification/mobilevit-x-small/model-quant.onnx.gz",
      ],
    ]),
    configPath:
      "https://web-ai-models.org/image/classification/mobilevit-x-small/config.json",
    preprocessorPath:
      "https://web-ai-models.org/image/classification/mobilevit-x-small/preprocessor_config.json",
    examples: classificationExamples,
    tags: ["classification", "mobilevit"],
    referenceURL: "https://huggingface.co/apple/mobilevit-x-small",
  },
  {
    id: "mobilevit-xxsmall",
    title: "MobileViT extra extra small",
    description: "",
    memEstimateMB: 40,
    type: ModelType.Classification,
    sizeMB: 5,
    modelPaths: new Map<string, string>([
      [
        "model",
        "https://web-ai-models.org/image/classification/mobilevit-xx-small/model.onnx.gz",
      ],
    ]),
    configPath:
      "https://web-ai-models.org/image/classification/mobilevit-xx-small/config.json",
    preprocessorPath:
      "https://web-ai-models.org/image/classification/mobilevit-xx-small/preprocessor_config.json",
    examples: classificationExamples,
    tags: ["classification", "mobilevit"],
    referenceURL: "https://huggingface.co/apple/mobilevit-xx-small",
  },
  {
    id: "mobilevit-xxsmall-quant",
    title: "MobileViT extra extra small quantized",
    description: "",
    memEstimateMB: 40,
    type: ModelType.Classification,
    sizeMB: 1,
    modelPaths: new Map<string, string>([
      [
        "model",
        "https://web-ai-models.org/image/classification/mobilevit-xx-small/model-quant.onnx.gz",
      ],
    ]),
    configPath:
      "https://web-ai-models.org/image/classification/mobilevit-xx-small/config.json",
    preprocessorPath:
      "https://web-ai-models.org/image/classification/mobilevit-xx-small/preprocessor_config.json",
    examples: classificationExamples,
    tags: ["classification", "mobilevit"],
    referenceURL: "https://huggingface.co/apple/mobilevit-xx-small",
  },
  {
    id: "segformer-b2-classification",
    title: "SegFormer large",
    description: "",
    memEstimateMB: 330,
    type: ModelType.Classification,
    sizeMB: 90,
    modelPaths: new Map<string, string>([
      [
        "model",
        "https://web-ai-models.org/image/classification/segformer-b2/model.onnx.gz",
      ],
    ]),
    configPath:
      "https://web-ai-models.org/image/classification/segformer-b2/config.json",
    preprocessorPath:
      "https://web-ai-models.org/image/classification/segformer-b2/preprocessor_config.json",
    examples: classificationExamples,
    tags: ["classification", "segformer"],
    referenceURL:
      "https://huggingface.co/nvidia/segformer-b2-finetuned-ade-512-512",
  },
  {
    id: "segformer-b2-classification-quant",
    title: "SegFormer large quantized",
    description: "",
    memEstimateMB: 100,
    type: ModelType.Classification,
    sizeMB: 18,
    modelPaths: new Map<string, string>([
      [
        "model",
        "https://web-ai-models.org/image/classification/segformer-b2/model-quant.onnx.gz",
      ],
    ]),
    configPath:
      "https://web-ai-models.org/image/classification/segformer-b2/config.json",
    preprocessorPath:
      "https://web-ai-models.org/image/classification/segformer-b2/preprocessor_config.json",
    examples: classificationExamples,
    tags: ["classification", "segformer"],
    referenceURL:
      "https://huggingface.co/nvidia/segformer-b2-finetuned-ade-512-512",
  },
  {
    id: "segformer-b1-classification",
    title: "SegFormer medium",
    description: "",
    memEstimateMB: 170,
    type: ModelType.Classification,
    sizeMB: 50,
    modelPaths: new Map<string, string>([
      [
        "model",
        "https://web-ai-models.org/image/classification/segformer-b1/model.onnx.gz",
      ],
    ]),
    configPath:
      "https://web-ai-models.org/image/classification/segformer-b1/config.json",
    preprocessorPath:
      "https://web-ai-models.org/image/classification/segformer-b1/preprocessor_config.json",
    examples: classificationExamples,
    tags: ["classification", "segformer"],
    referenceURL:
      "https://huggingface.co/nvidia/segformer-b1-finetuned-ade-512-512",
  },
  {
    id: "segformer-b1-classification-quant",
    title: "SegFormer meduim quantized",
    description: "",
    memEstimateMB: 50,
    type: ModelType.Classification,
    sizeMB: 10,
    modelPaths: new Map<string, string>([
      [
        "model",
        "https://web-ai-models.org/image/classification/segformer-b1/model-quant.onnx.gz",
      ],
    ]),
    configPath:
      "https://web-ai-models.org/image/classification/segformer-b1/config.json",
    preprocessorPath:
      "https://web-ai-models.org/image/classification/segformer-b1/preprocessor_config.json",
    examples: classificationExamples,
    tags: ["classification", "segformer"],
    referenceURL:
      "https://huggingface.co/nvidia/segformer-b1-finetuned-ade-512-512",
  },
  {
    id: "segformer-b0-classification",
    title: "SegFormer small",
    description: "",
    memEstimateMB: 80,
    type: ModelType.Classification,
    sizeMB: 13,
    modelPaths: new Map<string, string>([
      [
        "model",
        "https://web-ai-models.org/image/classification/segformer-b0/model.onnx.gz",
      ],
    ]),
    configPath:
      "https://web-ai-models.org/image/classification/segformer-b0/config.json",
    preprocessorPath:
      "https://web-ai-models.org/image/classification/segformer-b0/preprocessor_config.json",
    examples: classificationExamples,
    tags: ["classification", "segformer"],
    referenceURL:
      "https://huggingface.co/nvidia/segformer-b0-finetuned-ade-512-512",
  },
  {
    id: "segformer-b0-classification-quant",
    title: "SegFormer small quantized",
    description: "",
    memEstimateMB: 40,
    type: ModelType.Classification,
    sizeMB: 3,
    modelPaths: new Map<string, string>([
      [
        "model",
        "https://web-ai-models.org/image/classification/segformer-b0/model-quant.onnx.gz",
      ],
    ]),
    configPath:
      "https://web-ai-models.org/image/classification/segformer-b0/config.json",
    preprocessorPath:
      "https://web-ai-models.org/image/classification/segformer-b0/preprocessor_config.json",
    examples: classificationExamples,
    tags: ["classification", "segformer"],
    referenceURL:
      "https://huggingface.co/nvidia/segformer-b0-finetuned-ade-512-512",
  },
  {
    id: "yolos-tiny",
    title: "YOLOS tiny",
    description: "",
    memEstimateMB: 120,
    type: ModelType.ObjectDetection,
    sizeMB: 24,
    modelPaths: new Map<string, string>([
      [
        "model",
        "https://web-ai-models.org/image/object-detection/yolos/model.onnx.gz",
      ],
    ]),
    configPath:
      "https://web-ai-models.org/image/object-detection/yolos/config.json",
    preprocessorPath:
      "https://web-ai-models.org/image/object-detection/yolos/preprocessor_config.json",
    examples: classificationExamples,
    tags: ["object-detection", "yolo"],
    referenceURL: "https://huggingface.co/hustvl/yolos-tiny",
  },
  {
    id: "yolos-tiny-quant",
    title: "YOLOS tiny quantized",
    description: "",
    memEstimateMB: 80,
    type: ModelType.ObjectDetection,
    sizeMB: 8,
    modelPaths: new Map<string, string>([
      [
        "model",
        "https://web-ai-models.org/image/object-detection/yolos/model-quant.onnx.gz",
      ],
    ]),
    configPath:
      "https://web-ai-models.org/image/object-detection/yolos/config.json",
    preprocessorPath:
      "https://web-ai-models.org/image/object-detection/yolos/preprocessor_config.json",
    examples: classificationExamples,
    tags: ["object-detection", "yolo"],
    referenceURL: "https://huggingface.co/hustvl/yolos-tiny",
  },
  {
    id: "segformer-b0-segmentation-quant",
    title: "SegFormer small quantized",
    description: "",
    memEstimateMB: 50,
    type: ModelType.Segmentation,
    sizeMB: 3,
    modelPaths: new Map<string, string>([
      [
        "model",
        "https://web-ai-models.org/image/segmentation/segformer-b0/model-quant.onnx.gz",
      ],
    ]),
    configPath:
      "https://web-ai-models.org/image/segmentation/segformer-b0/config.json",
    preprocessorPath:
      "https://web-ai-models.org/image/segmentation/segformer-b0/preprocessor_config.json",
    examples: segmentationExamples,
    tags: ["segmentation", "segformer"],
    referenceURL:
      "https://huggingface.co/nvidia/segformer-b0-finetuned-ade-512-512",
  },
  {
    id: "segformer-b1-segmentation-quant",
    title: "SegFormer meduim quantized",
    description: "",
    memEstimateMB: 70,
    type: ModelType.Segmentation,
    sizeMB: 9,
    modelPaths: new Map<string, string>([
      [
        "model",
        "https://web-ai-models.org/image/segmentation/segformer-b1/model-quant.onnx.gz",
      ],
    ]),
    configPath:
      "https://web-ai-models.org/image/segmentation/segformer-b1/config.json",
    preprocessorPath:
      "https://web-ai-models.org/image/segmentation/segformer-b1/preprocessor_config.json",
    examples: segmentationExamples,
    tags: ["segmentation", "segformer"],
    referenceURL:
      "https://huggingface.co/nvidia/segformer-b1-finetuned-ade-512-512",
  },
  {
    id: "segformer-b4-segmentation-quant",
    title: "SegFormer large quantized",
    description: "",
    memEstimateMB: 100,
    type: ModelType.Segmentation,
    sizeMB: 42,
    modelPaths: new Map<string, string>([
      [
        "model",
        "https://web-ai-models.org/image/segmentation/segformer-b4/model-quant.onnx.gz",
      ],
    ]),
    configPath:
      "https://web-ai-models.org/image/segmentation/segformer-b4/config.json",
    preprocessorPath:
      "https://web-ai-models.org/image/segmentation/segformer-b4/preprocessor_config.json",
    examples: segmentationExamples,
    tags: ["segmentation", "segformer"],
    referenceURL:
      "https://huggingface.co/nvidia/segformer-b4-finetuned-ade-512-512",
  },
  {
    id: "superres-small",
    title: "Super-resolution x2 small",
    description: "",
    memEstimateMB: 1900,
    type: ModelType.Img2Img,
    sizeMB: 4,
    modelPaths: new Map<string, string>([
      ["model", "https://web-ai-models.org/image/img2img/small/model.onnx.gz"],
    ]),
    preprocessorPath:
      "https://web-ai-models.org/image/img2img/small/preprocessor_config.json",
    examples: superresExamples,
    tags: ["img2img", "superres"],
    referenceURL: "https://huggingface.co/caidas/swin2SR-lightweight-x2-64",
  },
  {
    id: "superres-small-quant",
    title: "Super-resolution x2 small quantized",
    description: "",
    memEstimateMB: 1900,
    type: ModelType.Img2Img,
    sizeMB: 1.5,
    modelPaths: new Map<string, string>([
      [
        "model",
        "https://web-ai-models.org/image/img2img/small/model-quant.onnx.gz",
      ],
    ]),
    preprocessorPath:
      "https://web-ai-models.org/image/img2img/small/preprocessor_config.json",
    examples: superresExamples,
    tags: ["img2img", "superres"],
    referenceURL: "https://huggingface.co/caidas/swin2SR-lightweight-x2-64",
  },
  {
    id: "superres-compressed-x4",
    title: "Super-resolution x4 for compressed images",
    description: "",
    memEstimateMB: 3400,
    type: ModelType.Img2Img,
    sizeMB: 45,
    modelPaths: new Map<string, string>([
      [
        "model",
        "https://web-ai-models.org/image/img2img/compressed/model.onnx.gz",
      ],
    ]),
    preprocessorPath:
      "https://web-ai-models.org/image/img2img/compressed/preprocessor_config.json",
    examples: superresExamples,
    tags: ["img2img", "superres"],
    referenceURL: "https://huggingface.co/caidas/swin2SR-compressed-sr-x4-48",
  },
  {
    id: "superres-compressed-x4-quant",
    title: "Super-resolution x4 for compressed images quantized",
    description: "",
    memEstimateMB: 2300,
    type: ModelType.Img2Img,
    sizeMB: 10,
    modelPaths: new Map<string, string>([
      [
        "model",
        "https://web-ai-models.org/image/img2img/compressed/model-quant.onnx.gz",
      ],
    ]),
    preprocessorPath:
      "https://web-ai-models.org/image/img2img/compressed/preprocessor_config.json",
    examples: superresExamples,
    tags: ["img2img", "superres"],
    referenceURL: "https://huggingface.co/caidas/swin2SR-compressed-sr-x4-48",
  },
  {
    id: "efficientformer-l1-classification",
    title: "EfficientFormer small",
    description: "",
    memEstimateMB: 200,
    type: ModelType.Classification,
    sizeMB: 43,
    modelPaths: new Map<string, string>([
      [
        "model",
        "https://web-ai-models.org/image/classification/EfficientFormer/l1.onnx",
      ],
    ]),
    configPath:
      "https://web-ai-models.org/image/classification/EfficientFormer/config.json",
    preprocessorPath:
      "https://web-ai-models.org/image/classification/EfficientFormer/preprocessor_config.json",
    examples: classificationExamples,
    tags: ["classification", "efficientformer"],
    referenceURL: "https://huggingface.co/snap-research/efficientformer-l1-300",
  },
  {
    id: "efficientformer-l1-classification-quant",
    title: "EfficientFormer small quantized",
    description: "",
    memEstimateMB: 100,
    type: ModelType.Classification,
    sizeMB: 11,
    modelPaths: new Map<string, string>([
      [
        "model",
        "https://web-ai-models.org/image/classification/EfficientFormer/l1-quant.onnx",
      ],
    ]),
    configPath:
      "https://web-ai-models.org/image/classification/EfficientFormer/config.json",
    preprocessorPath:
      "https://web-ai-models.org/image/classification/EfficientFormer/preprocessor_config.json",
    examples: classificationExamples,
    tags: ["classification", "efficientformer"],
    referenceURL: "https://huggingface.co/snap-research/efficientformer-l1-300",
  },
  {
    id: "efficientformer-l1-feature",
    title: "EfficientFormer small",
    description: "",
    memEstimateMB: 180,
    type: ModelType.FeatureExtraction,
    sizeMB: 43,
    modelPaths: new Map<string, string>([
      [
        "model",
        "https://web-ai-models.org/image/feature-extraction/EfficientFormer/l1.onnx",
      ],
    ]),
    configPath:
      "https://web-ai-models.org/image/feature-extraction/EfficientFormer/config.json",
    preprocessorPath:
      "https://web-ai-models.org/image/feature-extraction/EfficientFormer/preprocessor_config.json",
    examples: classificationExamples,
    tags: ["feature-extraction", "efficientformer"],
    referenceURL: "https://huggingface.co/snap-research/efficientformer-l1-300",
  },
  {
    id: "efficientformer-l1-feature-quant",
    title: "EfficientFormer small quantized",
    description: "",
    memEstimateMB: 60,
    type: ModelType.FeatureExtraction,
    sizeMB: 11,
    modelPaths: new Map<string, string>([
      [
        "model",
        "https://web-ai-models.org/image/feature-extraction/EfficientFormer/l1-quant.onnx",
      ],
    ]),
    configPath:
      "https://web-ai-models.org/image/feature-extraction/EfficientFormer/config.json",
    preprocessorPath:
      "https://web-ai-models.org/image/feature-extraction/EfficientFormer/preprocessor_config.json",
    examples: classificationExamples,
    tags: ["feature-extraction", "efficientformer"],
    referenceURL: "https://huggingface.co/snap-research/efficientformer-l1-300",
  },
  {
    id: "efficientformer-l3-feature",
    title: "EfficientFormer medium",
    description: "",
    memEstimateMB: 380,
    type: ModelType.FeatureExtraction,
    sizeMB: 116,
    modelPaths: new Map<string, string>([
      [
        "model",
        "https://web-ai-models.org/image/feature-extraction/EfficientFormer/l3.onnx",
      ],
    ]),
    configPath:
      "https://web-ai-models.org/image/feature-extraction/EfficientFormer/config.json",
    preprocessorPath:
      "https://web-ai-models.org/image/feature-extraction/EfficientFormer/preprocessor_config.json",
    examples: classificationExamples,
    tags: ["feature-extraction", "efficientformer"],
    referenceURL: "https://huggingface.co/snap-research/efficientformer-l3-300",
  },
  {
    id: "efficientformer-l3-feature-quant",
    title: "EfficientFormer medium quantized",
    description: "",
    memEstimateMB: 120,
    type: ModelType.FeatureExtraction,
    sizeMB: 30,
    modelPaths: new Map<string, string>([
      [
        "model",
        "https://web-ai-models.org/image/feature-extraction/EfficientFormer/l3-quant.onnx",
      ],
    ]),
    configPath:
      "https://web-ai-models.org/image/feature-extraction/EfficientFormer/config.json",
    preprocessorPath:
      "https://web-ai-models.org/image/feature-extraction/EfficientFormer/preprocessor_config.json",
    examples: classificationExamples,
    tags: ["feature-extraction", "efficientformer"],
    referenceURL: "https://huggingface.co/snap-research/efficientformer-l3-300",
  },
  {
    id: "efficientformer-l7-feature",
    title: "EfficientFormer large",
    description: "",
    memEstimateMB: 620,
    type: ModelType.FeatureExtraction,
    sizeMB: 308,
    modelPaths: new Map<string, string>([
      [
        "model",
        "https://web-ai-models.org/image/feature-extraction/EfficientFormer/l7.onnx",
      ],
    ]),
    configPath:
      "https://web-ai-models.org/image/feature-extraction/EfficientFormer/config.json",
    preprocessorPath:
      "https://web-ai-models.org/image/feature-extraction/EfficientFormer/preprocessor_config.json",
    examples: classificationExamples,
    tags: ["feature-extraction", "efficientformer"],
    referenceURL: "https://huggingface.co/snap-research/efficientformer-l7-300",
  },
  {
    id: "efficientformer-l7-feature-quant",
    title: "EfficientFormer large quantized",
    description: "",
    memEstimateMB: 260,
    type: ModelType.FeatureExtraction,
    sizeMB: 78,
    modelPaths: new Map<string, string>([
      [
        "model",
        "https://web-ai-models.org/image/feature-extraction/EfficientFormer/l7-quant.onnx",
      ],
    ]),
    configPath:
      "https://web-ai-models.org/image/feature-extraction/EfficientFormer/config.json",
    preprocessorPath:
      "https://web-ai-models.org/image/feature-extraction/EfficientFormer/preprocessor_config.json",
    examples: classificationExamples,
    tags: ["feature-extraction", "efficientformer"],
    referenceURL: "https://huggingface.co/snap-research/efficientformer-l7-300",
  },
  {
    id: "segment-anything-quant",
    title: "Segment Anything quantized",
    description: "",
    memEstimateMB: 2600,
    type: ModelType.SegmentAnything,
    sizeMB: 108,
    configPath:
      "https://web-ai-models.org/image/feature-extraction/EfficientFormer/config.json",
    modelPaths: new Map<string, string>([
      [
        "encoder",
        "https://huggingface.co/visheratin/segment-anything-vit-b/resolve/main/encoder-quant.onnx",
      ],
      [
        "decoder",
        "https://huggingface.co/visheratin/segment-anything-vit-b/resolve/main/decoder-quant.onnx",
      ],
    ]),
    preprocessorPath:
      "https://huggingface.co/visheratin/segment-anything-vit-b/resolve/main/preprocessor_config.json",
    tags: ["segment-anything"],
    referenceURL: "https://huggingface.co/visheratin/segment-anything-vit-b",
  },
  {
    id: "segment-anything",
    title: "Segment Anything",
    description: "",
    memEstimateMB: 2600,
    type: ModelType.SegmentAnything,
    sizeMB: 377,
    configPath:
      "https://web-ai-models.org/image/feature-extraction/EfficientFormer/config.json",
    modelPaths: new Map<string, string>([
      [
        "encoder",
        "https://huggingface.co/visheratin/segment-anything-vit-b/resolve/main/encoder.onnx",
      ],
      [
        "decoder",
        "https://huggingface.co/visheratin/segment-anything-vit-b/resolve/main/decoder.onnx",
      ],
    ]),
    preprocessorPath:
      "https://huggingface.co/visheratin/segment-anything-vit-b/resolve/main/preprocessor_config.json",
    tags: ["segment-anything"],
    referenceURL: "https://huggingface.co/visheratin/segment-anything-vit-b",
  },
];
