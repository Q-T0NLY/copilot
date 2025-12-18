import { useState, useRef, useEffect, useCallback } from 'react'
import Editor, { OnMount, Monaco } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { Play, Download, Sparkles, Lightbulb, Zap } from 'lucide-react'

interface InlineSuggestion {
  text: string;
  range: {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
  };
}

export default function CursorAICodeEditor() {
  const [code, setCode] = useState('// Start coding with AI assistance...\n')
  const [language, setLanguage] = useState('typescript')
  const [output, setOutput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0)
  const [showInlineSuggestion, setShowInlineSuggestion] = useState(false)
  const [inlineSuggestion, setInlineSuggestion] = useState<InlineSuggestion | null>(null)

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<Monaco | null>(null)
  const suggestionTimeout = useRef<NodeJS.Timeout | null>(null)
  const decorationsRef = useRef<string[]>([])

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco

    // Register inline completion provider
    monaco.languages.registerInlineCompletionsProvider(language, {
      provideInlineCompletions: async (model, position) => {
        if (!showInlineSuggestion || !inlineSuggestion) {
          return { items: [] }
        }

        return {
          items: [{
            insertText: inlineSuggestion.text,
            range: new monaco.Range(
              position.lineNumber,
              position.column,
              position.lineNumber,
              position.column
            )
          }]
        }
      },
      freeInlineCompletions: () => {}
    })

    // Listen to cursor position changes for context-aware suggestions
    editor.onDidChangeCursorPosition(async (e) => {
      if (suggestionTimeout.current) {
        clearTimeout(suggestionTimeout.current)
      }

      suggestionTimeout.current = setTimeout(async () => {
        await fetchInlineSuggestion(editor, e.position)
      }, 500)
    })

    // Listen for Tab key to accept suggestions
    editor.addCommand(monaco.KeyCode.Tab, () => {
      if (inlineSuggestion) {
        acceptInlineSuggestion()
      }
    })

    // Listen for Escape to dismiss suggestions
    editor.addCommand(monaco.KeyCode.Escape, () => {
      dismissInlineSuggestion()
    })
  }

  const fetchInlineSuggestion = async (
    editor: editor.IStandaloneCodeEditor,
    position: editor.Position
  ) => {
    const model = editor.getModel()
    if (!model) return

    const currentLine = model.getLineContent(position.lineNumber)
    const textBeforeCursor = currentLine.substring(0, position.column - 1)

    // Only suggest if there's some code context
    if (textBeforeCursor.trim().length < 2) {
      setShowInlineSuggestion(false)
      return
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const apiKey = localStorage.getItem('apiKey') || 'dev-key-12345'

      const response = await fetch(`${apiUrl}/api/llm/code/inline-suggest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          code: model.getValue(),
          language,
          cursorPosition: {
            line: position.lineNumber,
            column: position.column
          },
          context: textBeforeCursor
        })
      })

      const data = await response.json()
      
      if (data.suggestion && data.suggestion.trim()) {
        setInlineSuggestion({
          text: data.suggestion,
          range: {
            startLineNumber: position.lineNumber,
            startColumn: position.column,
            endLineNumber: position.lineNumber,
            endColumn: position.column
          }
        })
        setShowInlineSuggestion(true)
        showInlineDecorations(editor, position, data.suggestion)
      }
    } catch (error) {
      console.error('Error fetching inline suggestion:', error)
    }
  }

  const showInlineDecorations = (
    editor: editor.IStandaloneCodeEditor,
    position: editor.Position,
    suggestion: string
  ) => {
    if (!monacoRef.current) return

    const decorations = editor.deltaDecorations(decorationsRef.current, [
      {
        range: new monacoRef.current.Range(
          position.lineNumber,
          position.column,
          position.lineNumber,
          position.column
        ),
        options: {
          afterContentClassName: 'inline-suggestion',
          after: {
            content: suggestion,
            inlineClassName: 'inline-suggestion-text'
          }
        }
      }
    ])

    decorationsRef.current = decorations
  }

  const acceptInlineSuggestion = () => {
    if (!editorRef.current || !inlineSuggestion) return

    const position = editorRef.current.getPosition()
    if (!position) return

    editorRef.current.executeEdits('inline-suggestion', [{
      range: new monacoRef.current!.Range(
        position.lineNumber,
        position.column,
        position.lineNumber,
        position.column
      ),
      text: inlineSuggestion.text
    }])

    dismissInlineSuggestion()
  }

  const dismissInlineSuggestion = () => {
    setShowInlineSuggestion(false)
    setInlineSuggestion(null)
    if (editorRef.current) {
      editorRef.current.deltaDecorations(decorationsRef.current, [])
      decorationsRef.current = []
    }
  }

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

  const handleExplainCode = async () => {
    if (!editorRef.current) return

    const selection = editorRef.current.getSelection()
    const model = editorRef.current.getModel()
    if (!model || !selection) return

    const selectedCode = model.getValueInRange(selection)
    if (!selectedCode) {
      setOutput('Please select some code to explain')
      return
    }

    setIsGenerating(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const apiKey = localStorage.getItem('apiKey') || 'dev-key-12345'

      const response = await fetch(`${apiUrl}/api/llm/code/explain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          code: selectedCode,
          language
        })
      })

      const data = await response.json()
      setOutput(data.explanation)
    } catch (error) {
      setOutput('Error explaining code: ' + (error as Error).message)
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
          title="Generate code from description"
        >
          <Sparkles className="w-4 h-4" />
          Generate
        </button>

        <button
          onClick={handleComplete}
          disabled={isGenerating}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          title="Complete code with AI"
        >
          <Play className="w-4 h-4" />
          Complete
        </button>

        <button
          onClick={handleExplainCode}
          disabled={isGenerating}
          className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          title="Explain selected code"
        >
          <Lightbulb className="w-4 h-4" />
          Explain
        </button>

        <button
          onClick={handleDownload}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          title="Download code"
        >
          <Download className="w-4 h-4" />
          Download
        </button>

        <div className="ml-auto flex items-center gap-2 text-sm text-gray-400">
          <Zap className="w-4 h-4" />
          <span>AI Inline Suggestions Active</span>
          {showInlineSuggestion && (
            <span className="text-blue-400 animate-pulse">●</span>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden relative">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={(value) => setCode(value || '')}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            fontSize: 14,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            tabCompletion: 'on',
            formatOnPaste: true,
            formatOnType: true,
            inlineSuggest: { enabled: true },
            cursorBlinking: 'smooth',
            smoothScrolling: true,
            lineNumbers: 'on',
            glyphMargin: true,
            folding: true,
            renderLineHighlight: 'all',
            bracketPairColorization: { enabled: true }
          }}
        />
        
        {showInlineSuggestion && inlineSuggestion && (
          <div className="absolute bottom-4 right-4 bg-gray-800 border border-blue-500 rounded-lg p-3 shadow-lg text-sm text-gray-300">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="font-semibold text-blue-400">AI Suggestion</span>
            </div>
            <div className="text-xs text-gray-400 mb-2">
              Press <kbd className="px-2 py-1 bg-gray-700 rounded">Tab</kbd> to accept or{' '}
              <kbd className="px-2 py-1 bg-gray-700 rounded">Esc</kbd> to dismiss
            </div>
          </div>
        )}
      </div>

      {/* Output */}
      {output && (
        <div className="bg-gray-800 border-t border-gray-700 p-4 max-h-40 overflow-y-auto">
          <div className="text-sm text-gray-300 whitespace-pre-wrap">{output}</div>
        </div>
      )}

      <style jsx global>{`
        .inline-suggestion-text {
          color: #64748b;
          font-style: italic;
          opacity: 0.6;
        }
      `}</style>
    </div>
  )
}
