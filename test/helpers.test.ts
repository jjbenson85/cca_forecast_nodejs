import { describe, expect, it } from "bun:test";
import { averageNumArray, isError, sum, sumNumArray } from "../helpers.js";

describe("sum", function () {
  it("should sum the numbers", () => {
    expect(sum(1, 2)).toEqual(3);
  });
});

describe("sumNumArray", () => {
  it("should sum the numbers in an array", () => {
    expect(sumNumArray([1, 2, 3])).toEqual(6);
  });
});

describe("averageNumArray", () => {
  it("should average the numbers in an array", () => {
    expect(averageNumArray([1, 2, 3])).toEqual(2);
  });

  it("should return an error if the array is empty", () => {
    expect(averageNumArray([])).toEqual(Error("number array is empty"));
  });
});

describe("isError", () => {
  it("should return a value if is not an error", () => {
    expect(isError(1)).toEqual(false);
  });
  it("should return an error if is an error", () => {
    expect(isError(Error("error"))).toEqual(true);
  });
});
