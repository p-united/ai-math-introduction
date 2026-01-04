/**
 * @module @i/foo/internal/sparsemax
 */

/**
 * Sparsemax関数 - スパースな確率分布を生成する活性化関数
 *
 * Softmaxの代替として、一部の出力が正確に0になるスパースな確率分布を生成します。
 * 確率単体（simplex）へのユークリッド射影として定義されます。
 *
 * @param z 入力ベクトル（ロジット）
 * @returns 確率単体上のスパースな確率分布（合計が1、各要素が0以上）
 *
 * @example
 * ```ts
 * sparsemax([2, 1, 0.1])  // → [0.9, 0.1, 0]
 * sparsemax([1, 1, 1])    // → [0.333, 0.333, 0.333]
 * sparsemax([5, 0, 0])    // → [1, 0, 0]
 * ```
 */
export function sparsemax(z: number[]): number[] {
  const n = z.length;

  if (n === 0) {
    return [];
  }

  if (n === 1) {
    return [1];
  }

  // 1. 降順にソート（インデックスを保持）
  const sorted = z
    .map((val, idx) => ({ val, idx }))
    .sort((a, b) => b.val - a.val);

  // 2. 累積和を計算しながらサポートサイズkを見つける
  let cumSum = 0;
  let k = 0;

  for (let j = 0; j < n; j++) {
    cumSum += sorted[j].val;
    // 1 + (j+1) * z_{(j+1)} > cumSum かどうかチェック
    if (1 + (j + 1) * sorted[j].val > cumSum) {
      k = j + 1;
    }
  }

  // 3. 閾値τを計算
  const cumSumK = sorted.slice(0, k).reduce((sum, item) => sum + item.val, 0);
  const tau = (cumSumK - 1) / k;

  // 4. 出力を計算（元の順序で）
  return z.map((zi) => Math.max(0, zi - tau));
}

/**
 * Softmax関数 - 確率分布を生成する活性化関数（比較用）
 *
 * 入力ベクトルを確率分布に変換します。全ての出力が正になります。
 *
 * @param z 入力ベクトル（ロジット）
 * @returns 確率分布（合計が1、各要素が正）
 *
 * @example
 * ```ts
 * softmax([2, 1, 0.1])  // → [0.659, 0.242, 0.099]
 * softmax([1, 1, 1])    // → [0.333, 0.333, 0.333]
 * ```
 */
export function softmax(z: number[]): number[] {
  const n = z.length;

  if (n === 0) {
    return [];
  }

  if (n === 1) {
    return [1];
  }

  // 数値安定性のため最大値を引く
  const maxZ = Math.max(...z);
  const expZ = z.map((zi) => Math.exp(zi - maxZ));
  const sumExpZ = expZ.reduce((a, b) => a + b, 0);

  return expZ.map((e) => e / sumExpZ);
}
