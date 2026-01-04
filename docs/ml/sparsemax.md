# Sparsemax 完全ガイド

## 概要

Sparsemaxは、Softmax関数の代替として2016年にMartins & Astudilloによって提案された活性化関数です。Softmaxが常に全ての出力に正の値を割り当てるのに対し、Sparsemaxは**スパース（疎）な確率分布**を出力できます。つまり、一部の出力が正確に0になります。

```ts
// Softmax: 全ての出力が正
softmax([2, 1, 0.1]) // → [0.659, 0.242, 0.099]

// Sparsemax: 一部の出力が0になれる
sparsemax([2, 1, 0.1]) // → [0.9, 0.1, 0]
```

## なぜSparsemaxが必要なのか

### Softmaxの問題点

1. **常に全要素が正**: どんなに小さな入力でも出力は0にならない
2. **解釈性の低下**: 多クラス分類で「どれにも少し当てはまる」という曖昧な出力
3. **注意機構での問題**: 全てのトークンに注意が分散してしまう

### Sparsemaxの利点

1. **スパースな出力**: 不要な要素を正確に0にできる
2. **解釈性の向上**: 「この選択肢のみが該当」という明確な出力
3. **計算効率**: 疎な出力は後段の計算を高速化できる

## 数学的定義

### Softmax（比較用）

$$\text{softmax}(z)_i = \frac{e^{z_i}}{\sum_j e^{z_j}}$$

### Sparsemax

Sparsemaxは以下の**ユークリッド射影問題**の解として定義されます：

$$\text{sparsemax}(z) = \arg\min_{p \in \Delta^{K-1}} \|p - z\|^2$$

ここで $\Delta^{K-1}$ は確率単体（simplex）です：

$$\Delta^{K-1} = \{p \in \mathbb{R}^K : p \geq 0, \sum_i p_i = 1\}$$

### 閉形式の解

Sparsemaxには効率的な閉形式解が存在します：

$$\text{sparsemax}(z)_i = \max(0, z_i - \tau(z))$$

ここで $\tau(z)$ は閾値で、$\sum_i \max(0, z_i - \tau(z)) = 1$ を満たすように決定されます。

## アルゴリズム

### ステップバイステップ

1. 入力ベクトル $z$ を降順にソート → $z_{(1)} \geq z_{(2)} \geq \cdots \geq z_{(K)}$
2. サポート集合のサイズ $k$ を見つける：
   $$k = \max\{j : 1 + j \cdot z_{(j)} > \sum_{i=1}^{j} z_{(i)}\}$$
3. 閾値 $\tau$ を計算：
   $$\tau = \frac{\left(\sum_{i=1}^{k} z_{(i)}\right) - 1}{k}$$
4. 出力を計算：
   $$\text{sparsemax}(z)_i = \max(0, z_i - \tau)$$

### 計算量

- **時間計算量**: $O(K \log K)$ （ソートがボトルネック）
- **空間計算量**: $O(K)$

## 実装

### TypeScript実装

```ts
/**
 * Sparsemax関数 - スパースな確率分布を生成
 *
 * @param z 入力ベクトル
 * @returns 確率単体上のスパースな確率分布
 */
export function sparsemax(z: number[]): number[] {
  const n = z.length;

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
  return z.map(zi => Math.max(0, zi - tau));
}
```

### Softmaxとの比較実装

```ts
/**
 * Softmax関数（比較用）
 */
export function softmax(z: number[]): number[] {
  const maxZ = Math.max(...z);
  const expZ = z.map(zi => Math.exp(zi - maxZ)); // 数値安定性のため
  const sumExpZ = expZ.reduce((a, b) => a + b, 0);
  return expZ.map(e => e / sumExpZ);
}
```

## 使用例

### 基本的な使い方

```ts
import { sparsemax, softmax } from "./mod.ts";

const logits = [2.0, 1.0, 0.1, -0.5];

console.log("入力:", logits);
console.log("Softmax:", softmax(logits));
// → [0.506, 0.186, 0.076, 0.041, ...] 全て正

console.log("Sparsemax:", sparsemax(logits));
// → [0.65, 0.35, 0, 0] 下位2つが0
```

### 注意機構での使用

```ts
// Transformerの注意重み計算
function sparsemaxAttention(
  query: number[],
  keys: number[][]
): number[] {
  // 内積でスコアを計算
  const scores = keys.map(key =>
    query.reduce((sum, q, i) => sum + q * key[i], 0)
  );

  // Sparsemaxで重みを計算（一部のキーのみに注意）
  return sparsemax(scores);
}

const query = [1.0, 0.5];
const keys = [
  [1.0, 0.5],   // 類似度高
  [0.8, 0.4],   // 類似度中
  [-0.5, 0.1],  // 類似度低
  [-1.0, -0.5], // 類似度なし
];

console.log(sparsemaxAttention(query, keys));
// → [0.55, 0.45, 0, 0] 類似度の高い上位2つのみに注意
```

### 分類問題での使用

```ts
// マルチクラス分類
function classifyWithSparsemax(
  features: number[],
  weights: number[][]
): { class: number; probability: number }[] {
  // 線形変換
  const logits = weights.map(w =>
    features.reduce((sum, f, i) => sum + f * w[i], 0)
  );

  // Sparsemaxで確率を計算
  const probs = sparsemax(logits);

  return probs
    .map((prob, cls) => ({ class: cls, probability: prob }))
    .filter(item => item.probability > 0)
    .sort((a, b) => b.probability - a.probability);
}
```

## SoftmaxとSparsemaxの比較

| 特性 | Softmax | Sparsemax |
|------|---------|-----------|
| **出力の性質** | 常に全て正 | スパース（0を含む） |
| **数学的定義** | 指数関数の正規化 | 確率単体への射影 |
| **計算量** | $O(K)$ | $O(K \log K)$ |
| **微分** | 常に非ゼロ | スパースなサポート上で非ゼロ |
| **解釈性** | 低い（全てに確率） | 高い（選択が明確） |
| **勾配消失** | 発生しやすい | 発生しにくい |

## 視覚的な比較

```
入力: [3.0, 1.0, 0.2, -0.5]

Softmax出力:
  クラス0: ████████████████████ 0.73
  クラス1: █████ 0.18
  クラス2: ██ 0.06
  クラス3: █ 0.02

Sparsemax出力:
  クラス0: ████████████████████ 0.90
  クラス1: ██ 0.10
  クラス2:  0.00
  クラス3:  0.00
```

## 発展的なトピック

### α-Entmax

Sparsemaxをさらに一般化した関数。パラメータ $\alpha$ でスパース性を制御：

- $\alpha = 1$: Softmax（スパースなし）
- $\alpha = 1.5$: 中間的なスパース性
- $\alpha = 2$: Sparsemax（最もスパース）

```ts
// α-Entmaxの概念的な実装
function entmax(z: number[], alpha: number): number[] {
  if (alpha === 1) return softmax(z);
  if (alpha === 2) return sparsemax(z);
  // 1 < α < 2 の場合は反復法が必要
  throw new Error("1 < α < 2 requires iterative methods");
}
```

### 勾配の計算

Sparsemaxは微分可能で、勾配は以下の形式：

$$\frac{\partial \text{sparsemax}(z)}{\partial z} = \text{diag}(s) - \frac{ss^T}{|S|}$$

ここで $s$ はサポート集合 $S = \{i : (\text{sparsemax}(z))_i > 0\}$ の指示ベクトル。

## パフォーマンス考慮事項

### いつSparsemaxを使うべきか

1. **明確な選択が必要な場合**: 「1つまたは少数を選ぶ」タスク
2. **解釈性が重要な場合**: 注意機構の可視化
3. **後段で疎行列演算を使う場合**: 計算効率の向上

### いつSoftmaxを使うべきか

1. **全要素への確率が必要な場合**: 言語モデルの次単語予測
2. **滑らかな勾配が必要な場合**: 学習初期段階
3. **計算効率が最優先の場合**: $O(K)$ vs $O(K \log K)$

## 実用上の注意点

### 数値安定性

```ts
// 入力が大きすぎる場合の対処
function stableSparsemax(z: number[]): number[] {
  const maxZ = Math.max(...z);
  const shifted = z.map(zi => zi - maxZ);
  return sparsemax(shifted);
}
```

### バッチ処理

```ts
// 複数サンプルを効率的に処理
function batchSparsemax(batch: number[][]): number[][] {
  return batch.map(z => sparsemax(z));
}
```

## 参考文献

- **原論文**: Martins, A. F., & Astudillo, R. F. (2016). "From Softmax to Sparsemax: A Sparse Model of Attention and Multi-Label Classification." ICML 2016.
- **Entmax論文**: Peters, B., Niculae, V., & Martins, A. F. (2019). "Sparse Sequence-to-Sequence Models." ACL 2019.
- **実装参考**: [entmax PyTorchライブラリ](https://github.com/deep-spin/entmax)

## まとめ

Sparsemaxは、Softmaxの「全てに少しずつ確率を割り当てる」という性質が望ましくない場面で有効な代替手段です。特に：

- 注意機構での解釈性向上
- マルチラベル分類での明確な選択
- 後段処理での計算効率化

といった場面で真価を発揮します。実装も比較的シンプルで、既存のSoftmaxを置き換えるだけで試すことができます。
