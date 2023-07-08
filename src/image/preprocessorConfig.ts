export class PreprocessorConfig {
  normalize: NormalizeConfig;
  resize: boolean;
  resizeLonger: boolean;
  size: number;
  centerCrop: boolean;
  cropSize: number;
  flipChannels: boolean;
  squareImage: boolean;
  pad: boolean;
  padSize: number;
  rescale: boolean;
  rescaleFactor: number;

  constructor() {
    this.normalize = {
      enabled: false,
    };
    this.resize = false;
    this.resizeLonger = false;
    this.size = 0;
    this.centerCrop = false;
    this.cropSize = 0;
    this.flipChannels = false;
    this.squareImage = false;
    this.pad = false;
    this.padSize = 0;
    this.rescale = false;
    this.rescaleFactor = 1.0;
  }

  static fromFile = async (configPath: string): Promise<PreprocessorConfig> => {
    const configData = await fetch(configPath).then((resp) => resp.json());
    const config = this.parseConfig(configData);
    return config;
  };

  static parseConfig = (configData): PreprocessorConfig => {
    const res = new PreprocessorConfig();
    res.normalize = {
      enabled: false,
    };
    if ("do_normalize" in configData) {
      res.normalize.enabled = configData["do_normalize"];
    }
    if ("image_mean" in configData) {
      res.normalize.mean = configData["image_mean"];
    }
    if ("image_std" in configData) {
      res.normalize.std = configData["image_std"];
    }
    if ("do_resize" in configData) {
      res.resize = configData["do_resize"];
    }
    if ("size" in configData) {
      res.size = configData["size"];
    }
    if ("do_center_crop" in configData) {
      res.centerCrop = configData["do_center_crop"];
    }
    if ("crop_size" in configData) {
      res.cropSize = configData["crop_size"];
    }
    if ("do_flip_channels" in configData) {
      res.flipChannels = configData["do_flip_channels"];
    }
    if ("do_square" in configData) {
      res.squareImage = configData["do_square"];
    }
    if ("do_pad" in configData) {
      res.pad = configData["do_pad"];
    }
    if ("pad_size" in configData) {
      res.padSize = configData["pad_size"];
    }
    if ("do_rescale" in configData) {
      res.rescale = configData["do_rescale"];
    }
    if ("rescale_factor" in configData) {
      res.rescaleFactor = configData["rescale_factor"];
    }
    if ("resize_longer" in configData) {
      res.resizeLonger = configData["resize_longer"];
    }
    return res;
  };
}

export type NormalizeConfig = {
  enabled: boolean;
  mean?: number[];
  std?: number[];
};
