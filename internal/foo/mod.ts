/**
 * @module @i/foo
 * A module for calculating distances between points
 */

/**
 * Point type in x, y coordinate system
 */
export type Point = {
  x: number;
  y: number;
};

/**
 * Calculates the Euclidean distance between two points
 */
export { distance } from "./internal/distance.ts";

/**
 * Calculates the Manhattan distance between two points
 */
export { manhattanDistance } from "./internal/manhattanDistance.ts";

/**
 * Calculates the Chebyshev distance between two points
 */
export { chebyshevDistance } from "./internal/chebyshevDistance.ts";

/**
 * Sparsemax activation function - produces sparse probability distributions
 */
export { sparsemax } from "./internal/sparsemax.ts";

/**
 * Softmax activation function - produces probability distributions
 */
export { softmax } from "./internal/sparsemax.ts";
