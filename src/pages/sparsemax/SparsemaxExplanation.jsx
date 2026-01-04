import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

export default function SparsemaxExplanation() {
  const [scoreA, setScoreA] = useState(3);
  const [scoreB, setScoreB] = useState(1);
  const [scoreC, setScoreC] = useState(0.5);
  const [scoreD, setScoreD] = useState(-0.5);

  // Softmax関数
  const softmax = (values) => {
    const maxVal = Math.max(...values);
    const exps = values.map(v => Math.exp(v - maxVal));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map(v => v / sum);
  };

  // Sparsemax関数
  const sparsemax = (z) => {
    const n = z.length;

    // 降順にソート（インデックスを保持）
    const sorted = z
      .map((val, idx) => ({ val, idx }))
      .sort((a, b) => b.val - a.val);

    // 累積和を計算しながらサポートサイズkを見つける
    let cumSum = 0;
    let k = 0;

    for (let j = 0; j < n; j++) {
      cumSum += sorted[j].val;
      if (1 + (j + 1) * sorted[j].val > cumSum) {
        k = j + 1;
      }
    }

    // 閾値τを計算
    const cumSumK = sorted.slice(0, k).reduce((sum, item) => sum + item.val, 0);
    const tau = (cumSumK - 1) / k;

    // 出力を計算（元の順序で）
    return z.map(zi => Math.max(0, zi - tau));
  };

  // スコアAを変化させたときの比較データ
  const comparisonData = useMemo(() => {
    const data = [];
    for (let a = 0; a <= 5; a += 0.25) {
      const values = [a, 1, 0.5, -0.5];
      const sm = softmax(values);
      const sp = sparsemax(values);
      data.push({
        scoreA: a,
        softmax: sm[0],
        sparsemax: sp[0],
      });
    }
    return data;
  }, []);

  // スパース性の比較データ
  const sparsityData = useMemo(() => {
    const data = [];
    for (let a = 0; a <= 5; a += 0.25) {
      const values = [a, 1, 0.5, -0.5];
      const sm = softmax(values);
      const sp = sparsemax(values);
      const softmaxZeros = sm.filter(v => v < 0.001).length;
      const sparsemaxZeros = sp.filter(v => v === 0).length;
      data.push({
        scoreA: a,
        softmaxNonZero: 4 - softmaxZeros,
        sparsemaxNonZero: 4 - sparsemaxZeros,
      });
    }
    return data;
  }, []);

  // 現在のスコアでの比較
  const currentScores = [scoreA, scoreB, scoreC, scoreD];
  const currentSoftmax = softmax(currentScores);
  const currentSparsemax = sparsemax(currentScores);

  const barData = [
    { name: 'A', score: scoreA, softmax: currentSoftmax[0], sparsemax: currentSparsemax[0] },
    { name: 'B', score: scoreB, softmax: currentSoftmax[1], sparsemax: currentSparsemax[1] },
    { name: 'C', score: scoreC, softmax: currentSoftmax[2], sparsemax: currentSparsemax[2] },
    { name: 'D', score: scoreD, softmax: currentSoftmax[3], sparsemax: currentSparsemax[3] },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  // ゼロの数をカウント
  const sparsemaxZeroCount = currentSparsemax.filter(v => v === 0).length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* パンくずリスト */}
      <nav className="mb-6">
        <Link to="/" className="text-blue-600 hover:underline">ホーム</Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-600">Sparsemax関数</span>
      </nav>

      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Sparsemax関数 - スパースな確率分布
      </h1>

      {/* イントロ */}
      <section className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Sparsemaxとは？</h2>
        <p className="text-gray-600 mb-4">
          Sparsemaxは、Softmaxの代替として2016年に提案された活性化関数です。
          Softmaxが<strong>常に全ての出力に正の値</strong>を割り当てるのに対し、
          Sparsemaxは<strong>一部の出力を正確に0</strong>にできます。
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-bold text-blue-800 mb-2">Softmax</h3>
            <code className="text-sm text-blue-700">
              [2, 1, 0.1] → [0.66, 0.24, 0.10]
            </code>
            <p className="text-xs text-blue-600 mt-1">全て正の値</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-bold text-purple-800 mb-2">Sparsemax</h3>
            <code className="text-sm text-purple-700">
              [2, 1, 0.1] → [0.90, 0.10, 0.00]
            </code>
            <p className="text-xs text-purple-600 mt-1">一部が0に</p>
          </div>
        </div>
      </section>

      {/* グラフ1: スコア変化による出力の違い */}
      <section className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          スコアAの変化に対する出力確率
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          B=1, C=0.5, D=-0.5 で固定。Aが増加すると両方とも1に近づきますが、
          <span className="text-purple-600 font-bold">Sparsemaxはより早く1に到達</span>します。
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="scoreA"
              label={{ value: 'スコアA', position: 'bottom', offset: 0 }}
            />
            <YAxis
              domain={[0, 1]}
              label={{ value: '出力確率', angle: -90, position: 'insideLeft' }}
              tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
            />
            <Tooltip
              formatter={(value) => `${(value * 100).toFixed(1)}%`}
              labelFormatter={(label) => `スコアA = ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="softmax"
              stroke="#3b82f6"
              strokeWidth={3}
              name="Softmax"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="sparsemax"
              stroke="#8b5cf6"
              strokeWidth={3}
              name="Sparsemax"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </section>

      {/* グラフ2: スパース性の変化 */}
      <section className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          非ゼロ要素数の変化（スパース性）
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Softmaxは常に4つ全てが正ですが、Sparsemaxはスコアが偏るほど<span className="text-purple-600 font-bold">非ゼロ要素が減少</span>します。
        </p>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={sparsityData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="scoreA"
              label={{ value: 'スコアA', position: 'bottom', offset: 0 }}
            />
            <YAxis
              domain={[0, 4]}
              ticks={[0, 1, 2, 3, 4]}
              label={{ value: '非ゼロ要素数', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip labelFormatter={(label) => `スコアA = ${label}`} />
            <Legend />
            <Line
              type="stepAfter"
              dataKey="softmaxNonZero"
              stroke="#3b82f6"
              strokeWidth={3}
              name="Softmax"
              dot={false}
            />
            <Line
              type="stepAfter"
              dataKey="sparsemaxNonZero"
              stroke="#8b5cf6"
              strokeWidth={3}
              name="Sparsemax"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-800">
            <strong>ポイント：</strong> Sparsemaxは「重要でない選択肢を切り捨てる」性質を持ちます。
            これにより、注意機構での解釈性が向上し、後段の計算も効率化できます。
          </p>
        </div>
      </section>

      {/* インタラクティブデモ */}
      <section className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          インタラクティブ比較
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              A: {scoreA.toFixed(1)}
            </label>
            <input
              type="range"
              min="-2"
              max="5"
              step="0.5"
              value={scoreA}
              onChange={(e) => setScoreA(parseFloat(e.target.value))}
              className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              B: {scoreB.toFixed(1)}
            </label>
            <input
              type="range"
              min="-2"
              max="5"
              step="0.5"
              value={scoreB}
              onChange={(e) => setScoreB(parseFloat(e.target.value))}
              className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              C: {scoreC.toFixed(1)}
            </label>
            <input
              type="range"
              min="-2"
              max="5"
              step="0.5"
              value={scoreC}
              onChange={(e) => setScoreC(parseFloat(e.target.value))}
              className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              D: {scoreD.toFixed(1)}
            </label>
            <input
              type="range"
              min="-2"
              max="5"
              step="0.5"
              value={scoreD}
              onChange={(e) => setScoreD(parseFloat(e.target.value))}
              className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* スパース性インジケータ */}
        <div className="mb-6 p-4 bg-gray-100 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Sparsemaxのゼロ要素数:</span>
            <span className="text-2xl font-bold text-purple-600">{sparsemaxZeroCount} / 4</span>
          </div>
          <div className="mt-2 flex gap-2">
            {currentSparsemax.map((val, i) => (
              <div
                key={i}
                className={`flex-1 h-2 rounded ${val === 0 ? 'bg-gray-300' : 'bg-purple-500'}`}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Softmax */}
          <div>
            <h3 className="text-lg font-medium mb-3 text-blue-700">Softmax</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 1]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                <YAxis type="category" dataKey="name" width={30} />
                <Tooltip formatter={(value) => `${(value * 100).toFixed(1)}%`} />
                <Bar dataKey="softmax" name="Softmax">
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} opacity={0.7} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="text-center mt-2 space-x-2">
              {barData.map((item, i) => (
                <span key={i} className="inline-block text-xs" style={{ color: COLORS[i] }}>
                  {item.name}: <strong>{(item.softmax * 100).toFixed(1)}%</strong>
                </span>
              ))}
            </div>
          </div>

          {/* Sparsemax */}
          <div>
            <h3 className="text-lg font-medium mb-3 text-purple-700">Sparsemax</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 1]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                <YAxis type="category" dataKey="name" width={30} />
                <Tooltip formatter={(value) => `${(value * 100).toFixed(1)}%`} />
                <Bar dataKey="sparsemax" name="Sparsemax">
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.sparsemax === 0 ? '#d1d5db' : COLORS[index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="text-center mt-2 space-x-2">
              {barData.map((item, i) => (
                <span
                  key={i}
                  className={`inline-block text-xs ${item.sparsemax === 0 ? 'text-gray-400' : ''}`}
                  style={{ color: item.sparsemax === 0 ? undefined : COLORS[i] }}
                >
                  {item.name}: <strong>{(item.sparsemax * 100).toFixed(1)}%</strong>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 使い分けガイド */}
      <section className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">いつ使うべきか？</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
            <h3 className="font-bold text-purple-800 mb-2">Sparsemaxが向いている場面</h3>
            <ul className="text-purple-700 text-sm space-y-2">
              <li>• <strong>明確な選択が必要</strong>: 1つまたは少数を選ぶタスク</li>
              <li>• <strong>解釈性が重要</strong>: 注意機構の可視化</li>
              <li>• <strong>後段で疎行列演算</strong>: 計算効率の向上</li>
            </ul>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <h3 className="font-bold text-blue-800 mb-2">Softmaxが向いている場面</h3>
            <ul className="text-blue-700 text-sm space-y-2">
              <li>• <strong>全要素への確率が必要</strong>: 言語モデルの次単語予測</li>
              <li>• <strong>滑らかな勾配が必要</strong>: 学習初期段階</li>
              <li>• <strong>計算効率優先</strong>: O(K) vs O(K log K)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 比較表 */}
      <section className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">SoftmaxとSparsemaxの比較</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left">特性</th>
                <th className="p-3 text-left text-blue-700">Softmax</th>
                <th className="p-3 text-left text-purple-700">Sparsemax</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-3 font-medium">出力の性質</td>
                <td className="p-3">常に全て正</td>
                <td className="p-3">スパース（0を含む）</td>
              </tr>
              <tr className="border-b">
                <td className="p-3 font-medium">数学的定義</td>
                <td className="p-3">指数関数の正規化</td>
                <td className="p-3">確率単体への射影</td>
              </tr>
              <tr className="border-b">
                <td className="p-3 font-medium">計算量</td>
                <td className="p-3">O(K)</td>
                <td className="p-3">O(K log K)</td>
              </tr>
              <tr className="border-b">
                <td className="p-3 font-medium">解釈性</td>
                <td className="p-3">低い（全てに確率）</td>
                <td className="p-3">高い（選択が明確）</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">勾配消失</td>
                <td className="p-3">発生しやすい</td>
                <td className="p-3">発生しにくい</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 関連リンク */}
      <section className="mt-8">
        <Link
          to="/softmax"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Softmax関数の解説を見る
        </Link>
      </section>
    </div>
  );
}
