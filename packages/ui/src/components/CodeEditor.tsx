import { useState } from 'react'
import Editor from '@monaco-editor/react'
import { Play, Download, Sparkles } from 'lucide-react'

export default function CodeEditor() {
  const [code, setCode] = useState('// Start coding...\n')
  const [language, setLanguage] = useState('typescript')
  const [output, setOutput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    const description = prompt('Describe what code you want to generate:')
    if (!description) return

    setIsGenerating(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const apiKey = localStorage.getItem('apiKey') || 'dev-key-12345'

      const response = await fetch(`${apiUrl}/api/llm/code/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          description,
          language
        })
      })

      const data = await response.json()
      setCode(data.code)
      setOutput('Code generated successfully!')
    } catch (error) {
      setOutput('Error generating code: ' + (error as Error).message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleComplete = async () => {
    setIsGenerating(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const apiKey = localStorage.getItem('apiKey') || 'dev-key-12345'

      const response = await fetch(`${apiUrl}/api/llm/code/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          code,
          language
        })
      })

      const data = await response.json()
      setCode(code + '\n' + data.completion)
      setOutput('Code completion added!')
    } catch (error) {
      setOutput('Error completing code: ' + (error as Error).message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `code.${language}`
    a.click()
  }

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Toolbar */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center gap-4">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="typescript">TypeScript</option>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="csharp">C#</option>
          <option value="go">Go</option>
          <option value="rust">Rust</option>
        </select>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          Generate
        </button>

        <button
          onClick={handleComplete}
          disabled={isGenerating}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Play className="w-4 h-4" />
          Complete
        </button>

        <button
          onClick={handleDownload}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={(value) => setCode(value || '')}
          theme="vs-dark"
          options={{
            fontSize: 14,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true
          }}
        />
      </div>

      {/* Output */}
      {output && (
        <div className="bg-gray-800 border-t border-gray-700 p-4">
          <div className="text-sm text-gray-300">{output}</div>
        </div>
      )}
    </div>
  )
}
