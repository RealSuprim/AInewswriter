import { useState } from 'react'

function ModelInfo() {
  const [isExpanded, setIsExpanded] = useState(false)

  const modelInfo = {
    '2.5 Generation': [
      {
        name: 'Gemini 2.5 Flash',
        id: 'gemini-2.5-flash',
        description: 'Best balance of speed and quality. Recommended for most use cases.',
        features: ['⚡ Fast processing', '🧠 High quality', '💰 Cost effective', '🎯 Thinking capability', '🔍 Google Search'],
        bestFor: 'General article generation, high-volume tasks'
      },
      {
        name: 'Gemini 2.5 Pro',
        id: 'gemini-2.5-pro',
        description: 'Most capable model with advanced reasoning and thinking.',
        features: ['🧠 Maximum intelligence', '🔬 Complex reasoning', '📊 Data analysis', '💭 Advanced thinking', '🔍 Google Search'],
        bestFor: 'Complex analysis, research articles, technical content'
      },
      {
        name: 'Gemini 2.5 Flash Lite',
        id: 'gemini-2.5-flash-lite-preview-06-17',
        description: 'Optimized for speed and cost-effectiveness.',
        features: ['💨 Fastest processing', '💰 Most economical', '⚡ Low latency', '📈 High throughput'],
        bestFor: 'Quick summaries, simple articles, real-time applications'
      }
    ],
    '2.0 Generation': [
      {
        name: 'Gemini 2.0 Flash',
        id: 'gemini-2.0-flash',
        description: 'Next-generation features with enhanced capabilities.',
        features: ['🚀 New generation', '🛠️ Tool usage', '⚡ Superior speed', '🎯 1M token context', '🔍 Google Search'],
        bestFor: 'Feature-rich applications, tool integration'
      },
      {
        name: 'Gemini 2.0 Flash Lite',
        id: 'gemini-2.0-flash-lite',
        description: 'Lightweight version optimized for efficiency.',
        features: ['💫 Efficient processing', '💰 Cost optimized', '⚡ Low latency', '🔧 Reliable'],
        bestFor: 'Budget-conscious applications, simple tasks'
      }
    ],
    '1.5 Generation': [
      {
        name: 'Gemini 1.5 Flash',
        id: 'gemini-1.5-flash',
        description: 'Reliable and versatile model for various tasks.',
        features: ['🔧 Proven reliability', '⚡ Good speed', '🎯 Versatile', '📊 Multimodal'],
        bestFor: 'Stable production applications, general use'
      },
      {
        name: 'Gemini 1.5 Pro',
        id: 'gemini-1.5-pro',
        description: 'Advanced reasoning for complex tasks.',
        features: ['🧠 Complex reasoning', '📚 Large context', '🎯 High accuracy', '🔬 Research grade'],
        bestFor: 'Research, complex analysis, detailed articles'
      },
      {
        name: 'Gemini 1.5 Flash 8B',
        id: 'gemini-1.5-flash-8b',
        description: 'Lightweight model for high-volume, simple tasks.',
        features: ['🏃 Ultra fast', '💰 Very economical', '📈 High volume', '⚡ Low resource'],
        bestFor: 'Simple summaries, high-volume processing'
      }
    ]
  }

  return (
    <div className="model-info-container">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="model-info-toggle"
      >
        {isExpanded ? '📚 Hide Model Guide' : '📚 Show Model Guide'}
      </button>
      
      {isExpanded && (
        <div className="model-info-content">
          <h3>🤖 Gemini Model Guide</h3>
          <p>Choose the right AI model for your article generation needs:</p>
          
          {Object.entries(modelInfo).map(([generation, models]) => (
            <div key={generation} className="model-generation">
              <h4>{generation}</h4>
              <div className="models-grid">
                {models.map((model) => (
                  <div key={model.id} className="model-card">
                    <div className="model-header">
                      <h5>{model.name}</h5>
                      <code>{model.id}</code>
                    </div>
                    <p className="model-description">{model.description}</p>
                    <div className="model-features">
                      {model.features.map((feature, index) => (
                        <span key={index} className="feature-tag">{feature}</span>
                      ))}
                    </div>
                    <div className="model-best-for">
                      <strong>Best for:</strong> {model.bestFor}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <div className="model-recommendations">
            <h4>💡 Recommendations</h4>
            <ul>
              <li><strong>🚀 First time users:</strong> Start with Gemini 2.5 Flash</li>
              <li><strong>🧠 Complex articles:</strong> Use Gemini 2.5 Pro</li>
              <li><strong>💨 Speed priority:</strong> Choose Flash Lite variants</li>
              <li><strong>💰 Budget conscious:</strong> Use 1.5 Flash 8B for simple tasks</li>
              <li><strong>🌍 Language variants:</strong> Choose British or American English for proper grammar</li>
              <li><strong>🔍 Google Search:</strong> Enable search enhancement for real-time information</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default ModelInfo
