export const softmax = (arr: number[]) => {
  return arr.map((value, _) => {
    return (
      Math.exp(value) /
      arr
        .map((y) => {
          return Math.exp(y);
        })
        .reduce((a, b) => {
          return a + b;
        })
    );
  });
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
