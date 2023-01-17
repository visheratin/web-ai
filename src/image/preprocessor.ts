import Jimp from "jimp";
import PreprocessorConfig from "./preprocessorConfig";
import * as ort from "onnxruntime-web";

class Preprocessor {
  config: PreprocessorConfig;

  constructor(config: PreprocessorConfig) {
    this.config = config;
  }

  process = (image: Jimp): ort.Tensor => {
    if (this.config.resize) {
      if (this.config.squareImage) {
        if (image.bitmap.width > image.bitmap.height) {
          image = image.resize(-1, this.config.size, "bilinearInterpolation");
        } else {
          image = image.resize(this.config.size, -1, "bilinearInterpolation");
        }
      } else {
        image = image.resize(this.config.size, this.config.size, "bilinearInterpolation");
      }
    }
    if (this.config.centerCrop) {
      const startX = (image.bitmap.width - this.config.cropSize) / 2;
      const startY = (image.bitmap.height - this.config.cropSize) / 2;
      image = image.crop(startX, startY, this.config.cropSize, this.config.cropSize);
    }
    if (this.config.pad) {
      image = this.padImage(image, this.config.padSize);
    }
    const tensor = this.imageDataToTensor(image, [1, 3, image.bitmap.width, image.bitmap.height]);
    return tensor;
  };

  /**
   * imageDataToTensor converts Jimp image to ORT tensor
   * @param image instance of Jimp image
   * @param dims target dimensions of the tensor
   * @returns ORT tensor
   */
  private imageDataToTensor = (image: Jimp, dims: number[]): ort.Tensor => {
    var imageBufferData = image.bitmap.data;
    const [redArray, greenArray, blueArray] = new Array(new Array<number>(), new Array<number>(), new Array<number>());
    for (let i = 0; i < imageBufferData.length; i += 4) {
      let value = this.getValue(imageBufferData[i], 0);
      redArray.push(value);
      value = this.getValue(imageBufferData[i + 1], 1);
      greenArray.push(value);
      value = this.getValue(imageBufferData[i + 2], 2);
      blueArray.push(value);
    }
    let transposedData = new Array();
    if (this.config.flipChannels) {
      transposedData = blueArray.concat(greenArray).concat(redArray);
    } else {
      transposedData = redArray.concat(greenArray).concat(blueArray);
    }
    const float32Data = new Float32Array(transposedData);
    const inputTensor = new ort.Tensor("float32", float32Data, dims);
    return inputTensor;
  };

  private padImage = (image: Jimp, padSize: number): Jimp => {
    const paddedWidth = Math.ceil(image.bitmap.width / padSize) * padSize;
    const paddedHeight = Math.ceil(image.bitmap.height / padSize) * padSize;
    const paddedImage = new Jimp(paddedWidth, paddedHeight, "black");
    const startX = (paddedWidth - image.bitmap.width) / 2;
    const startY = (paddedHeight - image.bitmap.height) / 2;
    paddedImage.composite(image, startX, startY);
    return paddedImage;
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
