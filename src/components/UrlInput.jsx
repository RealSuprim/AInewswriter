import { useState } from 'react'
import ModelInfo from './ModelInfo'

function UrlInput({ onSubmit }) {
  const [urls, setUrls] = useState('')
  const [apiKey, setApiKey] = useState('AIzaSyBBnfcVRVDTOQjlMfdmYnNsgcMdXTrmbKI')
  const [articleTitle, setArticleTitle] = useState('')
  const [articleStyle, setArticleStyle] = useState('news')
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash')
  const [englishVariant, setEnglishVariant] = useState('british')
  const [enableSearch, setEnableSearch] = useState(false)
  const [searchKeywords, setSearchKeywords] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Parse URLs from textarea
    const urlList = urls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url && (url.startsWith('http://') || url.startsWith('https://')))

    if (urlList.length === 0) {
      alert('Please enter at least one valid URL')
      return
    }

    if (!apiKey.trim()) {
      alert('Please enter your Gemini API key')
      return
    }

    onSubmit({
      urls: urlList,
      apiKey: apiKey.trim(),
      articleTitle: articleTitle.trim(),
      articleStyle,
      selectedModel,
      englishVariant,
      enableSearch,
      searchKeywords: searchKeywords.trim()
    })
  }

  const handleUrlsChange = (e) => {
    setUrls(e.target.value)
  }

  const getUrlCount = () => {
    return urls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url && (url.startsWith('http://') || url.startsWith('https://'))).length
  }

  return (
    <div className="url-input-container">
      <form onSubmit={handleSubmit} className="url-form">
        <div className="form-section">
          <h2>📝 Article Configuration</h2>
          
          <div className="form-group">
            <label htmlFor="apiKey">
              🔑 Gemini API Key
              <span className="required">*</span>
            </label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Gemini API key"
              className="form-input"
              required
            />
            <small className="form-help">
              Your API key is used securely and not stored
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="articleTitle">
              📰 Article Title/Topic (Optional)
            </label>
            <input
              type="text"
              id="articleTitle"
              value={articleTitle}
              onChange={(e) => setArticleTitle(e.target.value)}
              placeholder="e.g., 'Latest Developments in AI Technology'"
              className="form-input"
            />
            <small className="form-help">
              Leave blank to let AI generate a title based on content
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="selectedModel">
              🤖 AI Model
            </label>
            <select
              id="selectedModel"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="form-select"
            >
              <optgroup label="🚀 Latest Models (2.5 Generation)">
                <option value="gemini-2.5-flash">⚡ Gemini 2.5 Flash (Recommended)</option>
                <option value="gemini-2.5-pro">🧠 Gemini 2.5 Pro (Most Capable)</option>
                <option value="gemini-2.5-flash-lite-preview-06-17">💨 Gemini 2.5 Flash Lite (Fastest)</option>
              </optgroup>
              <optgroup label="⚡ Fast Models (2.0 Generation)">
                <option value="gemini-2.0-flash">🔥 Gemini 2.0 Flash</option>
                <option value="gemini-2.0-flash-lite">💫 Gemini 2.0 Flash Lite</option>
              </optgroup>
              <optgroup label="🔧 Reliable Models (1.5 Generation)">
                <option value="gemini-1.5-flash">⚡ Gemini 1.5 Flash</option>
                <option value="gemini-1.5-pro">🎯 Gemini 1.5 Pro</option>
                <option value="gemini-1.5-flash-8b">🏃 Gemini 1.5 Flash 8B (Lightweight)</option>
              </optgroup>
            </select>
            <small className="form-help">
              Choose the AI model for article generation. 2.5 Flash offers the best balance of speed and quality.
            </small>
          </div>

          <ModelInfo />

          <div className="form-group">
            <label htmlFor="englishVariant">
              🌍 English Variant
            </label>
            <select
              id="englishVariant"
              value={englishVariant}
              onChange={(e) => setEnglishVariant(e.target.value)}
              className="form-select"
            >
              <option value="british">🇬🇧 British English</option>
              <option value="american">🇺🇸 American English</option>
            </select>
            <small className="form-help">
              British: "Leicester were 16th" | American: "Leicester was 16th"
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="articleStyle">
              ✍️ Writing Style
            </label>
            <select
              id="articleStyle"
              value={articleStyle}
              onChange={(e) => setArticleStyle(e.target.value)}
              className="form-select"
            >
              <option value="news">📰 Professional News</option>
              <option value="blog">💬 Blog Style</option>
              <option value="formal">🎓 Formal/Academic</option>
              <option value="casual">😊 Casual/Conversational</option>
            </select>
          </div>

          <div className="form-group">
            <div className="search-toggle-container">
              <label className="search-toggle-label">
                <input
                  type="checkbox"
                  checked={enableSearch}
                  onChange={(e) => setEnableSearch(e.target.checked)}
                  className="search-toggle-checkbox"
                />
                <span className="search-toggle-slider"></span>
                🔍 Enable Google Search Enhancement
              </label>
            </div>
            <small className="form-help">
              When enabled, AI will search Google for additional related information to enhance your article
            </small>
          </div>

          {enableSearch && (
            <div className="form-group search-keywords-group">
              <label htmlFor="searchKeywords">
                🔎 Search Keywords (Optional)
              </label>
              <input
                type="text"
                id="searchKeywords"
                value={searchKeywords}
                onChange={(e) => setSearchKeywords(e.target.value)}
                placeholder="e.g., football transfers, Premier League, latest news"
                className="form-input"
              />
              <small className="form-help">
                Leave blank to auto-generate keywords from your URLs. Or specify custom keywords for more targeted search.
              </small>
            </div>
          )}
        </div>

        <div className="form-section">
          <h2>🔗 Source URLs</h2>
          
          <div className="form-group">
            <label htmlFor="urls">
              Enter URLs (one per line)
              <span className="required">*</span>
              {getUrlCount() > 0 && (
                <span className="url-count">
                  {getUrlCount()} valid URL{getUrlCount() !== 1 ? 's' : ''} detected
                </span>
              )}
            </label>
            <textarea
              id="urls"
              value={urls}
              onChange={handleUrlsChange}
              placeholder={`https://example.com/article1
https://example.com/article2
https://example.com/article3

Paste your news article URLs here...`}
              className="form-textarea"
              rows="8"
              required
            />
            <small className="form-help">
              Enter multiple URLs to aggregate information from various sources
            </small>
          </div>
        </div>

        <div className="readability-info">
          <h4>📖 Easy-to-Read Articles</h4>
          <p>Our AI writes articles at a Grade 8 reading level using simple, clear language that everyone can understand.</p>
        </div>

        <button type="submit" className="generate-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" stroke="currentColor" strokeWidth="2" fill="none"/>
            <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
          </svg>
          Generate Article
        </button>
      </form>
    </div>
  )
}

export default UrlInput
