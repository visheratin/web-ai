export const softmax = (arr: number[]) => {
  const max = Math.max(...arr);
  const exps = arr.map((val) => Math.exp(val - max));
  const sum = exps.reduce((acc, val) => acc + val, 0);
  return exps.map((val) => val / sum);
};

export const normalize = (input: number[]): number[] => {
  const result: number[] = [];
  let sum = 0;
  for (let i = 0; i < input.length; i++) {
    sum += input[i] * input[i];
  }
  sum = Math.sqrt(sum);
  for (let i = 0; i < input.length; i++) {
    result.push(input[i] / sum);
  }
  return result;
};
