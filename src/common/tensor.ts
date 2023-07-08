import * as ort from "onnxruntime-common";

export class Tensor {
  ortTensor: ort.Tensor;

  constructor(ortTensor: ort.Tensor) {
    this.ortTensor = ortTensor;
  }

  at = (indices: number[]) => {
    if (indices.length != this.ortTensor.dims.length) {
      throw new Error(`indices length must match tensor dimensions`);
    }
    for (let i = 0; i < indices.length; i++) {
      if (indices[i] >= this.ortTensor.dims[i]) {
        throw new Error(
          `index for dimension ${i} (${indices[i]}) is larger than the dimension size (${this.ortTensor.dims[i]})`
        );
      }
    }
    let index = 0;
    for (let i = 0; i < indices.length; i++) {
      let skipSize = 1;
      for (let j = i + 1; j < this.ortTensor.dims.length; j++) {
        skipSize *= this.ortTensor.dims[j];
      }
      const skip = indices[i] * skipSize;
      index += skip;
    }
    return this.ortTensor.data[index];
  };

  setAt = (indices: number[], value: number) => {
    if (indices.length != this.ortTensor.dims.length) {
      throw new Error(`indices length must match tensor dimensions`);
    }
    for (let i = 0; i < indices.length; i++) {
      if (indices[i] >= this.ortTensor.dims[i]) {
        throw new Error(
          `index for dimension ${i} (${indices[i]}) is larger than the dimension size (${this.ortTensor.dims[i]})`
        );
      }
    }
    let index = 0;
    for (let i = 0; i < indices.length; i++) {
      let skipSize = 1;
      for (let j = i + 1; j < this.ortTensor.dims.length; j++) {
        skipSize *= this.ortTensor.dims[j];
      }
      const skip = indices[i] * skipSize;
      index += skip;
    }
    this.ortTensor.data[index] = value;
  };

  argmax = (dim: number): Tensor => {
    if (dim >= this.ortTensor.dims.length) {
      throw new Error(
        "dim must be smaller than the number of dimensions in tensor"
      );
    }
    let outDims: number[] = [];
    let size = 1;
    for (let i = 0; i < this.ortTensor.dims.length; i++) {
      if (i != dim) {
        outDims.push(this.ortTensor.dims[i]);
        size *= this.ortTensor.dims[i];
      }
    }
    if (outDims.length == 0) {
      outDims = [1];
    }
    const argmax = new Tensor(
      new ort.Tensor(new Float32Array(size).fill(0), outDims)
    );
    const maxValues = new Tensor(
      new ort.Tensor(new Float32Array(size).fill(-Infinity), outDims)
    );
    const indices = new Array(this.ortTensor.dims.length).fill(0);
    this.argmaxIter(0, dim, indices, argmax, maxValues, 0);
    return argmax;
  };

  argmaxIter = (
    dim: number,
    targetDim: number,
    indices: number[],
    argmax: Tensor,
    maxValues: Tensor,
    depth: number
  ) => {
    if (dim == targetDim) {
      this.argmaxIter(dim + 1, targetDim, indices, argmax, maxValues, depth);
    }
    for (let i = 0; i < this.ortTensor.dims[dim]; i++) {
      indices[dim] = i;
      if (depth == this.ortTensor.dims.length - 1) {
        let outIndices: number[] = [];
        for (let k = 0; k < indices.length; k++) {
          if (k != targetDim) {
            outIndices.push(indices[k]);
          }
        }
        if (outIndices.length == 0) {
          outIndices = [0];
        }
        for (let j = 0; j < this.ortTensor.dims[targetDim]; j++) {
          indices[targetDim] = j;
          const value = this.at(indices) as number;
          const maxValue = maxValues.at(outIndices) as number;
          if (value > maxValue) {
            argmax.setAt(outIndices, j);
            maxValues.setAt(outIndices, value);
          }
        }
      } else {
        this.argmaxIter(
          dim + 1,
          targetDim,
          indices,
          argmax,
          maxValues,
          depth + 1
        );
      }
    }
  };
}
