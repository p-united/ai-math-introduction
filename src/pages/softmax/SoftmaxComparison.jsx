import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

export default function SoftmaxComparison() {
  const [scoreA, setScoreA] = useState(3);
  const [scoreB, setScoreB] = useState(1);
  const [scoreC, setScoreC] = useState(1);

  // 単純比率（線形正規化）- 負の値は0として扱う
  const linearNormalize = (values) => {
    const positiveValues = values.map(v => Math.max(0, v));
    const sum = positiveValues.reduce((a, b) => a + b, 0);
    if (sum === 0) return values.map(() => 1 / values.length);
    return positiveValues.map(v => v / sum);
  };

  // ソフトマックス関数
  const softmax = (values) => {
    const maxVal = Math.max(...values);
    const exps = values.map(v => Math.exp(v - maxVal)); // 数値安定性のため
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map(v => v / sum);
  };

  // スコアAを変化させたときの比較データ
  const comparisonData = useMemo(() => {
    const data = [];
    for (let a = 0; a <= 10; a += 0.5) {
      const values = [a, 2, 2]; // Aを変化、B,Cは固定(2)
      const linear = linearNormalize(values);
      const sm = softmax(values);
      data.push({
        scoreA: a,
        linear: linear[0],
        softmax: sm[0],
      });
    }
    return data;
  }, []);

  // 現在のスコアでの比較
  const currentScores = [scoreA, scoreB, scoreC];
  const currentLinear = linearNormalize(currentScores);
  const currentSoftmax = softmax(currentScores);

  const barData = [
    { name: 'クラスA', score: scoreA, linear: currentLinear[0], softmax: currentSoftmax[0] },
    { name: 'クラスB', score: scoreB, linear: currentLinear[1], softmax: currentSoftmax[1] },
    { name: 'クラスC', score: scoreC, linear: currentLinear[2], softmax: currentSoftmax[2] },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* パンくずリスト */}
      <nav className="mb-6">
        <Link to="/" className="text-blue-600 hover:underline">ホーム</Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-600">ソフトマックス関数</span>
      </nav>

      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        📊 ソフトマックス関数 vs 単純比率
      </h1>

      {/* イントロ */}
      <section className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">ソフトマックス関数とは？</h2>
        <p className="text-gray-600 mb-4">
          ソフトマックス関数は、<strong>複数の数値を「確率分布」に変換する関数</strong>です。
          入力された数値の大小関係を保ちながら、すべての出力値が0〜1の範囲に収まり、合計が必ず1になるように変換します。
        </p>
        <div className="bg-gray-100 p-4 rounded-lg font-mono text-center">
          softmax(x<sub>i</sub>) = e<sup>x<sub>i</sub></sup> / Σe<sup>x<sub>j</sub></sup>
        </div>
      </section>

      {/* グラフ1: スコア変化による出力の違い */}
      <section className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          📈 スコアAの変化に対する出力確率（B,C=2で固定）
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          スコアAが増加すると、ソフトマックスは<span className="text-blue-600 font-bold">急激に1に近づく</span>のに対し、
          単純比率は<span className="text-green-600 font-bold">緩やかに増加</span>します。
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
              name="ソフトマックス"
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="linear" 
              stroke="#10b981" 
              strokeWidth={3}
              strokeDasharray="5 5"
              name="単純比率"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800">
            <strong>💡 ポイント：</strong> スコアA=6のとき、単純比率は60%程度ですが、
            ソフトマックスは<strong>98%以上</strong>になります。これが「勝者総取り」効果です。
          </p>
        </div>
      </section>

      {/* インタラクティブデモ */}
      <section className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          🎛️ インタラクティブ比較（スライダーで調整）
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              クラスA: {scoreA.toFixed(1)}
            </label>
            <input
              type="range"
              min="-2"
              max="10"
              step="0.5"
              value={scoreA}
              onChange={(e) => setScoreA(parseFloat(e.target.value))}
              className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              クラスB: {scoreB.toFixed(1)}
            </label>
            <input
              type="range"
              min="-2"
              max="10"
              step="0.5"
              value={scoreB}
              onChange={(e) => setScoreB(parseFloat(e.target.value))}
              className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              クラスC: {scoreC.toFixed(1)}
            </label>
            <input
              type="range"
              min="-2"
              max="10"
              step="0.5"
              value={scoreC}
              onChange={(e) => setScoreC(parseFloat(e.target.value))}
              className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 単純比率 */}
          <div>
            <h3 className="text-lg font-medium mb-3 text-green-700">単純比率（線形）</h3>
            <p className="text-xs text-gray-500 mb-2">計算式: x_i / Σx_j</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 1]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                <YAxis type="category" dataKey="name" width={70} />
                <Tooltip formatter={(value) => `${(value * 100).toFixed(1)}%`} />
                <Bar dataKey="linear" name="単純比率">
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} opacity={0.6} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="text-center mt-2 space-y-1">
              {barData.map((item, i) => (
                <span key={i} className="inline-block mx-2 text-sm" style={{ color: COLORS[i] }}>
                  {item.name}: <strong>{(item.linear * 100).toFixed(1)}%</strong>
                </span>
              ))}
            </div>
          </div>

          {/* ソフトマックス */}
          <div>
            <h3 className="text-lg font-medium mb-3 text-blue-700">ソフトマックス（指数）</h3>
            <p className="text-xs text-gray-500 mb-2">計算式: e^x_i / Σe^x_j</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 1]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                <YAxis type="category" dataKey="name" width={70} />
                <Tooltip formatter={(value) => `${(value * 100).toFixed(1)}%`} />
                <Bar dataKey="softmax" name="ソフトマックス">
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="text-center mt-2 space-y-1">
              {barData.map((item, i) => (
                <span key={i} className="inline-block mx-2 text-sm" style={{ color: COLORS[i] }}>
                  {item.name}: <strong>{(item.softmax * 100).toFixed(1)}%</strong>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* なぜネイピア数eを使うのか */}
      <section className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">🤔 なぜネイピア数 e を使うのか？</h2>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <h3 className="font-bold text-blue-800 mb-2">1. 微分がきれいになる</h3>
            <p className="text-blue-700 text-sm">
              e^x は微分しても e^x のまま。ニューラルネットワークの学習では勾配計算を繰り返すため、この性質が効率化に貢献。
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
            <h3 className="font-bold text-green-800 mb-2">2. 値の差を「強調」できる</h3>
            <p className="text-green-700 text-sm">
              指数関数は大きな値をより大きく、小さな値をより小さくする。最も高いスコアが「勝者」として際立つ。
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
            <h3 className="font-bold text-purple-800 mb-2">3. 常に正の値になる</h3>
            <p className="text-purple-700 text-sm">
              e^x はどんな負の値でも必ず正の値を返す。確率は負になれないため、この性質が必要。
            </p>
          </div>
        </div>
      </section>

      {/* 違いのまとめ */}
      <section className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">📊 主な違いのまとめ</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left">特徴</th>
                <th className="p-3 text-left text-green-700">単純比率</th>
                <th className="p-3 text-left text-blue-700">ソフトマックス</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-3 font-medium">差の強調</td>
                <td className="p-3">比例関係を維持</td>
                <td className="p-3">大きな値をより強調</td>
              </tr>
              <tr className="border-b">
                <td className="p-3 font-medium">負の値の扱い</td>
                <td className="p-3">そのまま使えない</td>
                <td className="p-3">自然に処理できる</td>
              </tr>
              <tr className="border-b">
                <td className="p-3 font-medium">微分の容易さ</td>
                <td className="p-3">普通</td>
                <td className="p-3">非常に簡潔</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">AI学習への適性</td>
                <td className="p-3">低い</td>
                <td className="p-3">高い（勾配が安定）</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
