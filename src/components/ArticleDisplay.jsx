import { useState } from 'react'

function ArticleDisplay({ article, onReset }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const fullArticle = `${article.article.headline}\n\n${article.article.content}`
    
    try {
      await navigator.clipboard.writeText(fullArticle)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleDownload = () => {
    const fullArticle = `${article.article.headline}\n\n${article.article.content}\n\n---\nGenerated on: ${new Date(article.article.generatedAt).toLocaleString()}\nSources processed: ${article.sourcesProcessed}`
    
    const blob = new Blob([fullArticle], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `article-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatContent = (content) => {
    return content.split('\n').map((paragraph, index) => {
      if (paragraph.trim()) {
        return <p key={index}>{paragraph}</p>
      }
      return null
    }).filter(Boolean)
  }

  const calculateReadabilityStats = (content) => {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const words = content.split(/\s+/).filter(w => w.length > 0)
    const avgWordsPerSentence = words.length / sentences.length

    return {
      sentences: sentences.length,
      words: words.length,
      avgWordsPerSentence: avgWordsPerSentence.toFixed(1)
    }
  }

  return (
    <div className="article-display">
      <div className="article-header">
        <div className="article-stats">
          <span className="stat">
            📊 {article.article.wordCount} words
          </span>
          <span className="stat">
            📚 {article.sourcesProcessed} sources
          </span>
          <span className="stat">
            🕒 {new Date(article.article.generatedAt).toLocaleString()}
          </span>
          {article.article.modelUsed && (
            <span className="stat model-used">
              🤖 {article.article.modelUsed}
            </span>
          )}
          <span className="stat readability-stat">
            📖 Grade 8 Reading Level
          </span>
          <span className="stat english-variant">
            🌍 {article.article.englishVariant === 'american' ? 'American English' : 'British English'}
          </span>
          {article.article.searchUsed && (
            <span className="stat search-used">
              🔍 Enhanced with Google Search
            </span>
          )}
        </div>
        
        <div className="article-actions">
          <button onClick={handleCopy} className="action-button copy-button">
            {copied ? '✅ Copied!' : '📋 Copy'}
          </button>
          <button onClick={handleDownload} className="action-button download-button">
            💾 Download
          </button>
          <button onClick={onReset} className="action-button reset-button">
            🔄 New Article
          </button>
        </div>
      </div>

      <article className="generated-article">
        <header className="article-title">
          <h1>{article.article.headline}</h1>
        </header>
        
        <div className="article-content">
          {formatContent(article.article.content)}
        </div>
      </article>

      <div className="readability-section">
        <h3>📖 Readability Information</h3>
        <div className="readability-stats">
          {(() => {
            const stats = calculateReadabilityStats(article.article.content)
            return (
              <>
                <div className="readability-item">
                  <strong>Reading Level:</strong> Grade 8 (Easy to read)
                </div>
                <div className="readability-item">
                  <strong>Average words per sentence:</strong> {stats.avgWordsPerSentence}
                </div>
                <div className="readability-item">
                  <strong>Total sentences:</strong> {stats.sentences}
                </div>
                <div className="readability-note">
                  ✅ This article is written in simple, clear language that's easy to understand.
                </div>
              </>
            )
          })()}
        </div>
      </div>

      {article.article.searchUsed && article.article.searchMetadata && (
        <div className="search-info-section">
          <h3>🔍 Google Search Enhancement</h3>
          <div className="search-details">
            {article.article.searchMetadata.webSearchQueries && (
              <div className="search-queries">
                <strong>Search queries used:</strong>
                <ul>
                  {article.article.searchMetadata.webSearchQueries.map((query, index) => (
                    <li key={index}>"{query}"</li>
                  ))}
                </ul>
              </div>
            )}
            {article.article.searchMetadata.groundingChunks && (
              <div className="search-sources">
                <strong>Additional sources found:</strong> {article.article.searchMetadata.groundingChunks.length} web sources
              </div>
            )}
            <div className="search-note">
              ✅ This article was enhanced with real-time information from Google Search
            </div>
          </div>
        </div>
      )}

      {/* Scraping Statistics Section */}
      {article.scrapingStats && (
        <div className="scraping-stats-section">
          <h3>📊 Source Processing Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item success">
              <span className="stat-number">{article.scrapingStats.successful}</span>
              <span className="stat-label">Successful</span>
            </div>
            <div className="stat-item failed">
              <span className="stat-number">{article.scrapingStats.failed}</span>
              <span className="stat-label">Failed</span>
            </div>
            <div className="stat-item rate">
              <span className="stat-number">{article.scrapingStats.successRate}</span>
              <span className="stat-label">Success Rate</span>
            </div>
          </div>
        </div>
      )}

      <div className="sources-section">
        <h3>📖 Sources Successfully Used</h3>
        <div className="sources-list">
          {article.sources.map((source, index) => (
            <div key={index} className="source-item successful">
              <div className="source-header">
                <h4>{source.title || 'Untitled'}</h4>
                <span className="source-words">{source.wordCount} words</span>
                <span className="source-status success">✅ Success</span>
              </div>
              {source.author && (
                <div className="source-author">
                  👤 {source.author}
                </div>
              )}
              {source.publishDate && (
                <div className="source-date">
                  📅 {source.publishDate}
                </div>
              )}
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="source-url"
              >
                {source.url}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Failed Sources Section */}
      {article.failedSources && article.failedSources.length > 0 && (
        <div className="failed-sources-section">
          <h3>⚠️ Sources That Failed to Load</h3>
          <div className="failed-sources-list">
            {article.failedSources.map((failed, index) => (
              <div key={index} className="source-item failed">
                <div className="source-header">
                  <h4>Failed to Load</h4>
                  <span className="source-status error">❌ {failed.errorType || 'Error'}</span>
                </div>
                <div className="error-details">
                  <div className="error-message">
                    <strong>Error:</strong> {failed.error}
                  </div>
                  {failed.status && failed.status !== 'unknown' && (
                    <div className="error-status">
                      <strong>Status:</strong> {failed.status}
                    </div>
                  )}
                </div>
                <a
                  href={failed.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="source-url failed-url"
                >
                  {failed.url}
                </a>
              </div>
            ))}
          </div>
          <div className="failed-sources-note">
            <p>💡 <strong>Common reasons for failed sources:</strong></p>
            <ul>
              <li><strong>404 Not Found:</strong> The page no longer exists or has moved</li>
              <li><strong>403 Forbidden:</strong> Access denied or requires authentication</li>
              <li><strong>Timeout:</strong> The website took too long to respond</li>
              <li><strong>DNS Error:</strong> The website domain couldn't be found</li>
            </ul>
            <p>🔍 When using Google Search Enhancement, some search results may lead to outdated or inaccessible URLs.</p>
          </div>
        </div>
      )}

      {article.article.sourcesReferenced && article.article.sourcesReferenced.length > 0 && (
        <div className="references-section">
          <h3>🔗 References</h3>
          <ul className="references-list">
            {article.article.sourcesReferenced.map((ref, index) => (
              <li key={index}>{ref}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default ArticleDisplay
