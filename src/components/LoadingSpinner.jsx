import { useState, useEffect } from 'react'

function LoadingSpinner() {
  const [currentStep, setCurrentStep] = useState(0)
  
  const steps = [
    '🔍 Analyzing URLs...',
    '📄 Scraping content...',
    '🧠 Processing with Gemini AI...',
    '✍️ Generating article...',
    '✨ Finalizing...'
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [steps.length])

  return (
    <div className="loading-container">
      <div className="loading-header">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
        <h2 className="loading-title">Creating Your Article</h2>
        <p className="loading-subtitle">Our AI is processing your sources and generating a comprehensive article</p>
      </div>

      <div className="loading-steps">
        <div className="steps-list">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`step ${index === currentStep ? 'active' : index < currentStep ? 'completed' : ''}`}
            >
              <div className="step-indicator">
                {index < currentStep ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : index === currentStep ? (
                  <div className="step-spinner"></div>
                ) : (
                  <div className="step-number">{index + 1}</div>
                )}
              </div>
              <span className="step-text">{step}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="loading-message">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          ></div>
        </div>
        <p>Processing time: 30-60 seconds depending on source complexity</p>
      </div>
    </div>
  )
}

export default LoadingSpinner
