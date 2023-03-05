import { Tensor } from "../src/tensor";
import { Tensor as OrtTensor } from "onnxruntime-web";

test("2D array", () => {
  const tensor = new Tensor(new OrtTensor(new Float32Array([1, 2, 3, 4, 5, 6, 7, 8, 9]), [3, 3]));
  expect(tensor.at([2, 1])).toBe(8);
  expect(tensor.at([0, 0])).toBe(1);
});

test("3D array", () => {
  const tensor = new Tensor(
    new OrtTensor(new Float32Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]), [2, 2, 4]),
  );
  expect(tensor.at([1, 1, 2])).toBe(15);
});

test("1D argmax iterator", () => {
  const input = new Tensor(new OrtTensor(new Float32Array([1, 2, 3, 4, 5, 6, 7, 8, 9]), [9]));
  const output = new Tensor(new OrtTensor(new Float32Array([8]), [1]));
  let argmax = new Tensor(new OrtTensor(new Float32Array([0]), [1]));
  let maxValues = new Tensor(new OrtTensor(new Float32Array([-Infinity]), [1]));
  input.argmaxIter(0, 0, [0], argmax, maxValues, 0);
  expect(argmax.ortTensor).toEqual(output.ortTensor);
});

test("2D argmax iterator", () => {
  const input = new Tensor(new OrtTensor(new Float32Array([1, 2, 3, 4, 5, 6, 7, 8, 9]), [3, 3]));
  const output = new Tensor(new OrtTensor(new Float32Array([2, 2, 2]), [3]));
  let argmax = new Tensor(new OrtTensor(new Float32Array([0, 0, 0]), [3]));
  let maxValues = new Tensor(new OrtTensor(new Float32Array([-Infinity, -Infinity, -Infinity]), [3]));
  input.argmaxIter(0, 1, [0, 0], argmax, maxValues, 0);
  expect(argmax.ortTensor).toEqual(output.ortTensor);
});

test("3D argmax iterator", () => {
  const input = new Tensor(
    new OrtTensor(new Float32Array([1, 9, 10, 11, 15, 16, 2, 3, 12, 13, 14, 4, 5, 6, 7, 8]), [2, 2, 4]),
  );
  const output = new Tensor(new OrtTensor(new Float32Array([3, 1, 2, 3]), [2, 2]));
  let argmax = new Tensor(new OrtTensor(new Float32Array([0, 0, 0, 0]), [2, 2]));
  let maxValues = new Tensor(new OrtTensor(new Float32Array([-Infinity, -Infinity, -Infinity, -Infinity]), [2, 2]));
  input.argmaxIter(0, 2, [0, 0, 0], argmax, maxValues, 0);
  expect(argmax.ortTensor).toEqual(output.ortTensor);
});

test("1D argmax", () => {
  const input = new Tensor(new OrtTensor(new Float32Array([1, 2, 3, 4, 5, 6, 7, 8, 9]), [9]));
  const output = new Tensor(new OrtTensor(new Float32Array([8]), [1]));
  let argmax = input.argmax(0);
  expect(argmax.ortTensor).toEqual(output.ortTensor);
});

test("2D argmax iterator", () => {
  const input = new Tensor(new OrtTensor(new Float32Array([1, 2, 3, 4, 5, 6, 7, 8, 9]), [3, 3]));
  const output = new Tensor(new OrtTensor(new Float32Array([2, 2, 2]), [3]));
  let argmax = input.argmax(1);
  expect(argmax.ortTensor).toEqual(output.ortTensor);
});

test("3D argmax iterator", () => {
  const input = new Tensor(
    new OrtTensor(new Float32Array([1, 9, 10, 11, 15, 16, 2, 3, 12, 13, 14, 4, 5, 6, 7, 8]), [2, 2, 4]),
  );
  let output = new Tensor(new OrtTensor(new Float32Array([3, 1, 2, 3]), [2, 2]));
  let argmax = input.argmax(2);
  expect(argmax.ortTensor).toEqual(output.ortTensor);
  output = new Tensor(new OrtTensor(new Float32Array([1, 1, 0, 0, 0, 0, 0, 1]), [2, 4]));
  argmax = input.argmax(1);
  expect(argmax.ortTensor).toEqual(output.ortTensor);
});

export {};
