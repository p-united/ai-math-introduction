import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import SoftmaxComparison from './pages/softmax/SoftmaxComparison'
import SparsemaxExplanation from './pages/sparsemax/SparsemaxExplanation'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link to="/" className="text-2xl font-bold hover:opacity-90 transition">
            🧮 AI数学超入門
          </Link>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/softmax" element={<SoftmaxComparison />} />
          <Route path="/sparsemax" element={<SparsemaxExplanation />} />
        </Routes>
      </main>

      {/* フッター */}
      <footer className="bg-gray-800 text-gray-400 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>© 2024 AI数学超入門 - Potential United Co., Ltd.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
