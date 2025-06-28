const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { scrapeUrls, scrapeSearchResults } = require('./scraper');
const { generateArticle } = require('./gemini');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'News Article Generator API is running' });
});

// Main article generation endpoint
app.post('/api/generate-article', async (req, res) => {
  try {
    const { urls, apiKey, articleTitle, articleStyle, selectedModel, englishVariant, enableSearch, searchKeywords } = req.body;

    // Validate input
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ 
        error: 'Please provide an array of URLs' 
      });
    }

    if (!apiKey) {
      return res.status(400).json({ 
        error: 'Please provide a Gemini API key' 
      });
    }

    console.log(`Processing ${urls.length} URLs...`);

    // Step 1: Scrape content from all URLs
    const scrapingResults = await scrapeUrls(urls);

    // Handle the new scraping results format
    const scrapedContent = scrapingResults.successful || scrapingResults;
    const failedUrls = scrapingResults.failed || [];
    const scrapingStats = scrapingResults.stats || {};

    if (scrapedContent.length === 0) {
      let errorMessage = 'No content could be extracted from the provided URLs';

      if (failedUrls.length > 0) {
        const errorSummary = Object.entries(scrapingStats.errors || {})
          .map(([type, count]) => `${type}: ${count}`)
          .join(', ');
        errorMessage += `. Failed URLs (${failedUrls.length}): ${errorSummary}`;
      }

      return res.status(400).json({
        error: errorMessage,
        failedUrls: failedUrls.map(f => ({ url: f.url, error: f.error, status: f.status })),
        stats: scrapingStats
      });
    }

    console.log(`Successfully scraped ${scrapedContent.length} articles`);
    if (failedUrls.length > 0) {
      console.log(`⚠️ ${failedUrls.length} URLs failed to scrape`);
    }

    // Step 2: Generate article using Gemini AI
    const generatedArticle = await generateArticle(
      scrapedContent,
      apiKey,
      articleTitle,
      articleStyle,
      selectedModel,
      englishVariant,
      enableSearch,
      searchKeywords
    );

    // Step 3: Return the generated article with detailed source information
    res.json({
      success: true,
      article: generatedArticle,
      sourcesProcessed: scrapedContent.length,
      sources: scrapedContent.map(content => ({
        url: content.url,
        title: content.title,
        wordCount: content.content.split(' ').length
      })),
      // Include information about failed URLs for transparency
      failedSources: failedUrls.length > 0 ? failedUrls.map(failed => ({
        url: failed.url,
        error: failed.error,
        errorType: failed.errorType,
        status: failed.status
      })) : [],
      scrapingStats: {
        totalUrls: urls.length,
        successful: scrapedContent.length,
        failed: failedUrls.length,
        successRate: `${Math.round((scrapedContent.length / urls.length) * 100)}%`
      }
    });

  } catch (error) {
    console.error('Error generating article:', error);
    res.status(500).json({ 
      error: 'Failed to generate article', 
      details: error.message 
    });
  }
});

// Test endpoint for custom Google Search functionality
app.post('/api/test-search', async (req, res) => {
  try {
    const { searchTerms, googleApiKey, searchEngineId, maxResults = 5 } = req.body;

    if (!searchTerms) {
      return res.status(400).json({
        error: 'Please provide search terms'
      });
    }

    console.log(`Testing search functionality for: "${searchTerms}"`);

    const searchResults = await scrapeSearchResults(searchTerms, {
      googleApiKey,
      searchEngineId,
      maxResults
    });

    res.json({
      success: true,
      searchTerms,
      results: searchResults,
      summary: {
        searchResultsFound: searchResults.searchResults.length,
        successfulScrapes: searchResults.scrapedContent.length,
        failedScrapes: searchResults.failedUrls.length,
        successRate: searchResults.stats.total > 0
          ? `${Math.round((searchResults.stats.successful / searchResults.stats.total) * 100)}%`
          : '0%'
      }
    });

  } catch (error) {
    console.error('Error testing search:', error);
    res.status(500).json({
      error: 'Failed to test search functionality',
      details: error.message
    });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
