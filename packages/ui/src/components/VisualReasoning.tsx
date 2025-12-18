import { useState } from 'react'
import { Upload, Eye, Zap } from 'lucide-react'

export default function VisualReasoning() {
  const [image, setImage] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<string>('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAnalyze = async () => {
    if (!image) return

    setIsAnalyzing(true)
    setAnalysis('Analyzing image...')

    // Simulate analysis - in production, this would call a vision API
    setTimeout(() => {
      setAnalysis(`
## Visual Analysis

**Detected Elements:**
- Layout structure
- Color scheme
- Text elements
- Interactive components

**Suggestions:**
- Improve contrast for better accessibility
- Consider responsive design patterns
- Optimize image placement

**Code Generation Ready:**
Based on this visual analysis, I can generate UI code that matches this design.
      `)
      setIsAnalyzing(false)
    }, 2000)
  }

  return (
    <div className="flex h-full bg-gray-900">
      {/* Image Upload Area */}
      <div className="w-1/2 border-r border-gray-700 p-6">
        <div className="h-full flex flex-col">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Eye className="w-6 h-6" />
            Visual Input
          </h2>

          {!image ? (
            <label className="flex-1 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
              <Upload className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-gray-400 mb-2">Upload an image or screenshot</p>
              <p className="text-gray-500 text-sm">PNG, JPG, or GIF</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          ) : (
            <div className="flex-1 flex flex-col gap-4">
              <img
                src={image}
                alt="Uploaded"
                className="flex-1 object-contain rounded-lg bg-gray-800"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Zap className="w-5 h-5" />
                  {isAnalyzing ? 'Analyzing...' : 'Analyze & Generate Code'}
                </button>
                <button
                  onClick={() => setImage(null)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Analysis Results */}
      <div className="w-1/2 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Analysis Results</h2>
        <div className="bg-gray-800 rounded-lg p-6 h-full overflow-y-auto">
          {analysis ? (
            <div className="prose prose-invert max-w-none">
              <pre className="whitespace-pre-wrap text-gray-300">{analysis}</pre>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400">Upload and analyze an image to see results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
