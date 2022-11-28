export const softmax = (arr: number[]) => {
  return arr.map((value, index) => {
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
