import { useState, useEffect } from 'react'
import { Save, Key, Globe, Cpu } from 'lucide-react'

export default function SettingsPanel() {
  const [apiUrl, setApiUrl] = useState('http://localhost:3001')
  const [apiKey, setApiKey] = useState('dev-key-12345')
  const [provider, setProvider] = useState('openai')
  const [model, setModel] = useState('gpt-4')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // Load settings from localStorage
    const savedApiUrl = localStorage.getItem('apiUrl')
    const savedApiKey = localStorage.getItem('apiKey')
    const savedProvider = localStorage.getItem('provider')
    const savedModel = localStorage.getItem('model')

    if (savedApiUrl) setApiUrl(savedApiUrl)
    if (savedApiKey) setApiKey(savedApiKey)
    if (savedProvider) setProvider(savedProvider)
    if (savedModel) setModel(savedModel)
  }, [])

  const handleSave = () => {
    localStorage.setItem('apiUrl', apiUrl)
    localStorage.setItem('apiKey', apiKey)
    localStorage.setItem('provider', provider)
    localStorage.setItem('model', model)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-gray-800 rounded-lg p-8 space-y-6">
        <h2 className="text-2xl font-bold text-white mb-6">Application Settings</h2>

        {/* API Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Globe className="w-5 h-5" />
            API Configuration
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              API Gateway URL
            </label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="http://localhost:3001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <Key className="w-4 h-4" />
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your API key"
            />
            <p className="text-sm text-gray-400 mt-1">
              Get your API key from the authentication endpoint
            </p>
          </div>
        </div>

        {/* LLM Configuration */}
        <div className="space-y-4 border-t border-gray-700 pt-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5" />
            LLM Configuration
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Default Provider
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic (Claude)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Default Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {provider === 'openai' ? (
                <>
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-4-turbo-preview">GPT-4 Turbo</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="gpt-4o">GPT-4o</option>
                </>
              ) : (
                <>
                  <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                  <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
                  <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-6 border-t border-gray-700">
          <button
            onClick={handleSave}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Save className="w-5 h-5" />
            {saved ? 'Settings Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  )
}
