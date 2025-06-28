import { useState } from 'react'
import UrlInput from './components/UrlInput'
import ArticleDisplay from './components/ArticleDisplay'
import LoadingSpinner from './components/LoadingSpinner'
import './App.css'

function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [generatedArticle, setGeneratedArticle] = useState(null)
  const [error, setError] = useState(null)

  const handleGenerateArticle = async (formData) => {
    setIsLoading(true)
    setError(null)
    setGeneratedArticle(null)

    try {
      const response = await fetch('/api/generate-article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate article')
      }

      setGeneratedArticle(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setGeneratedArticle(null)
    setError(null)
  }

  return (
    <div className="app">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand">
            <div className="brand-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" fill="currentColor"/>
                <circle cx="6" cy="7" r="1" fill="currentColor"/>
                <circle cx="6" cy="12" r="1" fill="currentColor"/>
                <circle cx="6" cy="17" r="1" fill="currentColor"/>
              </svg>
            </div>
            <span className="brand-text">NewsAI Pro</span>
          </div>
          <div className="nav-actions">
            {generatedArticle && (
              <button onClick={handleReset} className="nav-button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2v6l4-4-4-4zm6.364 3.636L16.95 7.05A7 7 0 1 1 7.05 16.95l-1.414 1.414A9 9 0 1 0 12 3v-1z" fill="currentColor"/>
                </svg>
                New Article
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      {!generatedArticle && !isLoading && (
        <section className="hero-section">
          <div className="hero-container">
            <div className="hero-content">
              <h1 className="hero-title">
                Transform Multiple Sources into
                <span className="gradient-text"> Professional Articles</span>
              </h1>
              <p className="hero-subtitle">
                Powered by Google's Gemini AI, our platform aggregates information from multiple news sources
                to create comprehensive, human-readable articles at a Grade 8 reading level.
              </p>
              <div className="hero-features">
                <div className="feature-item">
                  <div className="feature-icon">🤖</div>
                  <span>AI-Powered</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">🌐</div>
                  <span>Multi-Source</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">📖</div>
                  <span>Easy Reading</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">🔍</div>
                  <span>Search Enhanced</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <main className="app-main">
        {!generatedArticle && !isLoading && (
          <UrlInput onSubmit={handleGenerateArticle} />
        )}

        {isLoading && <LoadingSpinner />}

        {error && (
          <div className="error-container">
            <div className="error-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h3 className="error-title">Something went wrong</h3>
            <p className="error-message">{error}</p>
            <button onClick={handleReset} className="error-retry-button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2v6l4-4-4-4zm6.364 3.636L16.95 7.05A7 7 0 1 1 7.05 16.95l-1.414 1.414A9 9 0 1 0 12 3v-1z" fill="currentColor"/>
              </svg>
              Try Again
            </button>
          </div>
        )}

        {generatedArticle && (
          <ArticleDisplay
            article={generatedArticle}
            onReset={handleReset}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-container">
          <div className="footer-content">
            <p>&copy; 2024 NewsAI Pro. Powered by Google Gemini AI.</p>
            <div className="footer-links">
              <span className="footer-link">Privacy Policy</span>
              <span className="footer-link">Terms of Service</span>
              <span className="footer-link">Support</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
