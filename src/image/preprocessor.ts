import Jimp from "jimp";
import PreprocessorConfig from "./preprocessorConfig";
import * as ort from "onnxruntime-web";

export interface PreprocessorResult {
  tensor: ort.Tensor;
  newWidth: number;
  newHeight: number;
}

class Preprocessor {
  config: PreprocessorConfig;

  constructor(config: PreprocessorConfig) {
    this.config = config;
  }

  process = (image: Jimp): PreprocessorResult => {
    if (this.config.resize) {
      if (!this.config.squareImage) {
        if (image.bitmap.width > image.bitmap.height && this.config.resizeLonger) {
          image = image.resize(this.config.size, -1, "bicubicInterpolation");
        } else {
          image = image.resize(-1, this.config.size, "bicubicInterpolation");
        }
      } else {
        image = image.resize(this.config.size, this.config.size, "bicubicInterpolation");
      }
    }
    const newWidth = image.bitmap.width;
    const newHeight = image.bitmap.height;
    if (this.config.centerCrop) {
      const startX = (image.bitmap.width - this.config.cropSize) / 2;
      const startY = (image.bitmap.height - this.config.cropSize) / 2;
      image = image.crop(startX, startY, this.config.cropSize, this.config.cropSize);
    }
    const tensor = this.imageDataToTensor(image);
    return {
      tensor: tensor,
      newWidth: newWidth,
      newHeight: newHeight,
    };
  };

  /**
   * imageDataToTensor converts Jimp image to ORT tensor
   * @param image instance of Jimp image
   * @param dims target dimensions of the tensor
   * @returns ORT tensor
   */
  private imageDataToTensor = (image: Jimp): ort.Tensor => {
    const [redArray, greenArray, blueArray] = [new Array<number>(), new Array<number>(), new Array<number>()];
    const width = this.config.pad ? this.config.padSize : image.bitmap.width;
    const height = this.config.pad ? this.config.padSize : image.bitmap.height;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (x >= image.bitmap.width || y >= image.bitmap.height) {
          redArray.push(0.0);
          greenArray.push(0.0);
          blueArray.push(0.0);
          continue;
        }
        const color = image.getPixelColor(x, y);
        const rgba = Jimp.intToRGBA(color);
        let value = this.getValue(rgba.r, 0);
        redArray.push(value);
        value = this.getValue(rgba.g, 1);
        greenArray.push(value);
        value = this.getValue(rgba.b, 2);
        blueArray.push(value);
      }
    }
    let transposedData: number[] = [];
    if (this.config.flipChannels) {
      transposedData = blueArray.concat(greenArray).concat(redArray);
    } else {
      transposedData = redArray.concat(greenArray).concat(blueArray);
    }
    const float32Data = new Float32Array(transposedData);
    const dims = [1, 3, height, width];
    const inputTensor = new ort.Tensor("float32", float32Data, dims);
    return inputTensor;
  };

  private getValue = (value: number, colorIdx: number): number => {
    if (this.config.normalize.enabled && this.config.normalize.mean && this.config.normalize.std) {
      value = (value / 255.0 - this.config.normalize.mean[colorIdx]) / this.config.normalize.std[colorIdx];
    } else {
      if (this.config.rescale) {
        value = value * this.config.rescaleFactor;
      } else {
        value = value / 255.0;
      }
    }
    return value;
  };
}

export default Preprocessor;
