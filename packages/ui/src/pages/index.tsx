import Head from 'next/head'
import { useState } from 'react'
import ChatPanel from '@/components/ChatPanel'
import CodeEditor from '@/components/CodeEditor'
import VisualReasoning from '@/components/VisualReasoning'
import SettingsPanel from '@/components/SettingsPanel'
import { Code, MessageSquare, Brain, Settings } from 'lucide-react'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'chat' | 'code' | 'visual' | 'settings'>('chat')

  return (
    <>
      <Head>
        <title>AI Development Platform</title>
        <meta name="description" content="World-class AI-powered development platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        <div className="flex h-screen">
          {/* Sidebar */}
          <div className="w-20 bg-gray-800 border-r border-gray-700 flex flex-col items-center py-8 space-y-8">
            <div className="text-2xl font-bold text-blue-400">AI</div>
            
            <nav className="flex-1 space-y-4">
              <button
                onClick={() => setActiveTab('chat')}
                className={`p-4 rounded-lg transition-colors ${
                  activeTab === 'chat' ? 'bg-blue-600' : 'hover:bg-gray-700'
                }`}
                title="Chat"
              >
                <MessageSquare className="w-6 h-6 text-white" />
              </button>
              
              <button
                onClick={() => setActiveTab('code')}
                className={`p-4 rounded-lg transition-colors ${
                  activeTab === 'code' ? 'bg-blue-600' : 'hover:bg-gray-700'
                }`}
                title="Code Editor"
              >
                <Code className="w-6 h-6 text-white" />
              </button>
              
              <button
                onClick={() => setActiveTab('visual')}
                className={`p-4 rounded-lg transition-colors ${
                  activeTab === 'visual' ? 'bg-blue-600' : 'hover:bg-gray-700'
                }`}
                title="Visual Reasoning"
              >
                <Brain className="w-6 h-6 text-white" />
              </button>
              
              <button
                onClick={() => setActiveTab('settings')}
                className={`p-4 rounded-lg transition-colors ${
                  activeTab === 'settings' ? 'bg-blue-600' : 'hover:bg-gray-700'
                }`}
                title="Settings"
              >
                <Settings className="w-6 h-6 text-white" />
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700 px-8 py-4">
              <h1 className="text-2xl font-bold text-white">
                {activeTab === 'chat' && '💬 AI Chat Assistant'}
                {activeTab === 'code' && '💻 Code Editor'}
                {activeTab === 'visual' && '🧠 Visual Reasoning'}
                {activeTab === 'settings' && '⚙️ Settings'}
              </h1>
            </header>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden">
              {activeTab === 'chat' && <ChatPanel />}
              {activeTab === 'code' && <CodeEditor />}
              {activeTab === 'visual' && <VisualReasoning />}
              {activeTab === 'settings' && <SettingsPanel />}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
