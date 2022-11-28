import PreprocessorConfig from "../../src/image/preprocessorConfig";

test("parse MobileViT preprocessor config", () => {
  const data = {
    crop_size: 256,
    do_center_crop: true,
    do_flip_channels: true,
    do_resize: true,
    feature_extractor_type: "MobileViTFeatureExtractor",
    resample: 2,
    size: 288,
  };
  let expected = {
    normalize: {
      enabled: false,
    },
    resize: true,
    size: 288,
    centerCrop: true,
    cropSize: 256,
    flipChannels: true,
  };
  const config = PreprocessorConfig.parseConfig(data);
  expect(config.normalize).toEqual(expected.normalize);
  expect(config.resize).toEqual(expected.resize);
  expect(config.size).toEqual(expected.size);
  expect(config.centerCrop).toEqual(expected.centerCrop);
  expect(config.cropSize).toEqual(expected.cropSize);
  expect(config.flipChannels).toEqual(expected.flipChannels);
});

test("parse SegFormer preprocessor config", () => {
  const data = {
    do_normalize: true,
    do_resize: true,
    feature_extractor_type: "SegformerFeatureExtractor",
    image_mean: [0.485, 0.456, 0.406],
    image_std: [0.229, 0.224, 0.225],
    reduce_labels: true,
    resample: 2,
    size: 512,
  };
  let expected = {
    normalize: {
      enabled: true,
      mean: [0.485, 0.456, 0.406],
      std: [0.229, 0.224, 0.225],
    },
    resize: true,
    size: 512,
    centerCrop: false,
    cropSize: 0,
    flipChannels: false,
  };
  const config = PreprocessorConfig.parseConfig(data);
  expect(config.normalize).toEqual(expected.normalize);
  expect(config.resize).toEqual(expected.resize);
  expect(config.size).toEqual(expected.size);
  expect(config.centerCrop).toEqual(expected.centerCrop);
  expect(config.cropSize).toEqual(expected.cropSize);
  expect(config.flipChannels).toEqual(expected.flipChannels);
});

test("parse ResNet preprocessor config", () => {
  const data = {
    crop_pct: 0.875,
    do_normalize: true,
    do_resize: true,
    feature_extractor_type: "ConvNextFeatureExtractor",
    image_mean: [0.485, 0.456, 0.406],
    image_std: [0.229, 0.224, 0.225],
    resample: 3,
    size: 224,
  };
  let expected = {
    normalize: {
      enabled: true,
      mean: [0.485, 0.456, 0.406],
      std: [0.229, 0.224, 0.225],
    },
    resize: true,
    size: 224,
    centerCrop: false,
    cropSize: 0,
    flipChannels: false,
  };
  const config = PreprocessorConfig.parseConfig(data);
  expect(config.normalize).toEqual(expected.normalize);
  expect(config.resize).toEqual(expected.resize);
  expect(config.size).toEqual(expected.size);
  expect(config.centerCrop).toEqual(expected.centerCrop);
  expect(config.cropSize).toEqual(expected.cropSize);
  expect(config.flipChannels).toEqual(expected.flipChannels);
});
