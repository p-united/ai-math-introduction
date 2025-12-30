import { Link } from 'react-router-dom'

const categories = [
  {
    id: 'softmax',
    title: 'ソフトマックス関数',
    description: 'ニューラルネットワークの出力を確率分布に変換する基本的な関数。分類問題やAttention機構で広く使用されています。',
    icon: '📊',
    topics: [
      'ソフトマックス関数の基本',
      '単純比率との違い',
      'なぜネイピア数eを使うのか',
      'AIでの活用例',
    ],
    link: '/softmax',
    color: 'from-blue-500 to-cyan-500',
  },
  // 将来のカテゴリ用プレースホルダー
  {
    id: 'backpropagation',
    title: '誤差逆伝播法',
    description: 'ニューラルネットワークの学習を可能にする核心的なアルゴリズム。',
    icon: '🔄',
    topics: ['連鎖律', '勾配計算', '重みの更新'],
    link: null, // まだ未実装
    color: 'from-green-500 to-emerald-500',
    comingSoon: true,
  },
  {
    id: 'attention',
    title: 'Attention機構',
    description: 'Transformerの核心技術。文脈に応じて重要な情報に「注目」する仕組み。',
    icon: '👁️',
    topics: ['Query, Key, Value', 'Self-Attention', 'Multi-Head Attention'],
    link: null,
    color: 'from-purple-500 to-pink-500',
    comingSoon: true,
  },
]

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* ヒーローセクション */}
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          AIを支える数学を、直感的に理解する
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          難しい数式を、インタラクティブな図解とコードで学ぶ。
          AIエンジニアのための数学入門サイトです。
        </p>
      </section>

      {/* カテゴリ一覧 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">📚 カテゴリ一覧</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className={`bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105 ${
                category.comingSoon ? 'opacity-60' : ''
              }`}
            >
              {/* カードヘッダー */}
              <div className={`bg-gradient-to-r ${category.color} p-4 text-white`}>
                <span className="text-3xl">{category.icon}</span>
                <h3 className="text-xl font-bold mt-2">{category.title}</h3>
                {category.comingSoon && (
                  <span className="inline-block mt-2 px-2 py-1 bg-white/20 rounded text-sm">
                    Coming Soon
                  </span>
                )}
              </div>

              {/* カード本文 */}
              <div className="p-4">
                <p className="text-gray-600 mb-4">{category.description}</p>
                
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">トピック:</h4>
                  <ul className="space-y-1">
                    {category.topics.map((topic, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-center">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>

                {category.link ? (
                  <Link
                    to={category.link}
                    className="block w-full text-center py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    学習する →
                  </Link>
                ) : (
                  <button
                    disabled
                    className="block w-full text-center py-2 px-4 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                  >
                    準備中
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* サイト説明 */}
      <section className="mt-12 bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">🎯 このサイトについて</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center p-4">
            <div className="text-4xl mb-2">📈</div>
            <h3 className="font-bold text-gray-800 mb-2">インタラクティブ</h3>
            <p className="text-gray-600 text-sm">
              スライダーやグラフを操作して、数式の挙動を直感的に理解
            </p>
          </div>
          <div className="text-center p-4">
            <div className="text-4xl mb-2">💡</div>
            <h3 className="font-bold text-gray-800 mb-2">実践的</h3>
            <p className="text-gray-600 text-sm">
              AIの現場でどう使われているかを具体例で解説
            </p>
          </div>
          <div className="text-center p-4">
            <div className="text-4xl mb-2">🚀</div>
            <h3 className="font-bold text-gray-800 mb-2">エンジニア向け</h3>
            <p className="text-gray-600 text-sm">
              コードと数式を対応させて、実装に直結する知識を提供
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
