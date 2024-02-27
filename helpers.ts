export const isError = <T,>(err: T | Error): err is Error =>
  err instanceof Error;

export const sum = (a: number, b: number) => a + b;

export const sumNumArray = (nums: number[]) => {
  return nums.reduce(sum);
};

export type MaybeError<T> = T | Error;
export const averageNumArray = (nums: number[]): MaybeError<number> => {
  if (nums.length === 0) return Error("number array is empty");

  return sumNumArray(nums) / nums.length;
};
