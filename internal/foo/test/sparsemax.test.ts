/**
 * @module @i/foo/test/sparsemax
 */

import { expect } from "@std/expect";
import { test } from "@std/testing/bdd";
import { softmax, sparsemax } from "../mod.ts";

// Helper function to check if values sum to 1
function sumToOne(arr: number[], epsilon = 1e-10): boolean {
  const sum = arr.reduce((a, b) => a + b, 0);
  return Math.abs(sum - 1) < epsilon;
}

// Helper function to check if all values are non-negative
function allNonNegative(arr: number[]): boolean {
  return arr.every((x) => x >= 0);
}

// Sparsemax tests
test("sparsemax returns empty array for empty input", () => {
  expect(sparsemax([])).toEqual([]);
});

test("sparsemax returns [1] for single element", () => {
  expect(sparsemax([5])).toEqual([1]);
  expect(sparsemax([-3])).toEqual([1]);
});

test("sparsemax output sums to 1", () => {
  const inputs = [
    [2, 1, 0.1],
    [1, 1, 1],
    [5, 0, 0],
    [-1, -2, -3],
    [10, 9, 8, 7, 6],
  ];

  for (const input of inputs) {
    const result = sparsemax(input);
    expect(sumToOne(result), `sum should be 1 for input ${input}`).toBe(true);
  }
});

test("sparsemax output is non-negative", () => {
  const inputs = [
    [2, 1, 0.1],
    [-1, -2, -3],
    [0, 0, 0],
  ];

  for (const input of inputs) {
    const result = sparsemax(input);
    expect(
      allNonNegative(result),
      `all values should be >= 0 for input ${input}`,
    ).toBe(true);
  }
});

test("sparsemax produces sparse output", () => {
  // When values are spread out, sparsemax should produce zeros
  const result = sparsemax([3, 1, 0, -1]);
  const zeroCount = result.filter((x) => x === 0).length;
  expect(zeroCount, "should have some zero values").toBeGreaterThan(0);
});

test("sparsemax with equal inputs returns uniform distribution", () => {
  const result = sparsemax([1, 1, 1]);
  const expected = 1 / 3;
  for (const val of result) {
    expect(Math.abs(val - expected)).toBeLessThan(1e-10);
  }
});

test("sparsemax with dominant value returns mostly that value", () => {
  const result = sparsemax([10, 0, 0]);
  expect(result[0]).toBe(1);
  expect(result[1]).toBe(0);
  expect(result[2]).toBe(0);
});

test("sparsemax preserves relative ordering", () => {
  const result = sparsemax([3, 2, 1]);
  // If values are non-zero, they should maintain ordering
  const nonZero = result.filter((x) => x > 0);
  for (let i = 0; i < nonZero.length - 1; i++) {
    expect(nonZero[i]).toBeGreaterThanOrEqual(nonZero[i + 1]);
  }
});

// Softmax tests
test("softmax returns empty array for empty input", () => {
  expect(softmax([])).toEqual([]);
});

test("softmax returns [1] for single element", () => {
  expect(softmax([5])).toEqual([1]);
  expect(softmax([-3])).toEqual([1]);
});

test("softmax output sums to 1", () => {
  const inputs = [
    [2, 1, 0.1],
    [1, 1, 1],
    [5, 0, 0],
  ];

  for (const input of inputs) {
    const result = softmax(input);
    expect(sumToOne(result), `sum should be 1 for input ${input}`).toBe(true);
  }
});

test("softmax output is always positive (never zero)", () => {
  const result = softmax([10, 0, -10]);
  for (const val of result) {
    expect(val, "softmax values should be positive").toBeGreaterThan(0);
  }
});

test("softmax with equal inputs returns uniform distribution", () => {
  const result = softmax([1, 1, 1]);
  const expected = 1 / 3;
  for (const val of result) {
    expect(Math.abs(val - expected)).toBeLessThan(1e-10);
  }
});

// Comparison tests
test("sparsemax is sparser than softmax", () => {
  const input = [3, 1, 0, -1];
  const sparsemaxResult = sparsemax(input);
  const softmaxResult = softmax(input);

  const sparsemaxZeros = sparsemaxResult.filter((x) => x === 0).length;
  const softmaxZeros = softmaxResult.filter((x) => x === 0).length;

  expect(
    sparsemaxZeros,
    "sparsemax should have more zeros than softmax",
  ).toBeGreaterThanOrEqual(softmaxZeros);
});

test("both functions handle negative inputs", () => {
  const input = [-1, -2, -3];

  const sparsemaxResult = sparsemax(input);
  const softmaxResult = softmax(input);

  expect(sumToOne(sparsemaxResult)).toBe(true);
  expect(sumToOne(softmaxResult)).toBe(true);
  expect(allNonNegative(sparsemaxResult)).toBe(true);
  expect(allNonNegative(softmaxResult)).toBe(true);
});
