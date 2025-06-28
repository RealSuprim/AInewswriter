const axios = require('axios');
const cheerio = require('cheerio');

// Function to perform custom Google Search and return top URLs
async function performCustomGoogleSearch(searchTerms, apiKey, searchEngineId, maxResults = 10) {
  try {
    if (!apiKey || !searchEngineId) {
      console.log('⚠️ Google Search API credentials not provided, skipping custom search');
      return [];
    }

    console.log(`🔍 Performing custom Google search for: "${searchTerms}"`);

    const searchUrl = 'https://www.googleapis.com/customsearch/v1';
    const params = {
      key: apiKey,
      cx: searchEngineId,
      q: searchTerms,
      num: Math.min(maxResults, 10), // Google API limits to 10 results per request
      sort: 'date', // Try to get recent results
      dateRestrict: 'm1' // Results from last month
    };

    const response = await axios.get(searchUrl, { params });

    if (response.data.items && response.data.items.length > 0) {
      const urls = response.data.items.map(item => ({
        url: item.link,
        title: item.title,
        snippet: item.snippet,
        displayLink: item.displayLink
      }));

      console.log(`✅ Found ${urls.length} search results`);
      return urls;
    } else {
      console.log('⚠️ No search results found');
      return [];
    }

  } catch (error) {
    console.error('❌ Error performing custom Google search:', error.message);
    return [];
  }
}

// Function to clean and extract text content
function cleanText(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, ' ')
    .trim();
}

// Function to extract article content from HTML
function extractArticleContent($) {
  let content = '';
  let title = '';
  let publishDate = '';
  let author = '';

  // Try to extract title with better selectors
  title = $('h1').first().text() ||
          $('title').text() ||
          $('[class*="title"]').first().text() ||
          $('[class*="headline"]').first().text() ||
          $('[data-testid*="headline"]').text() ||
          $('.headline').first().text();

  // Try to extract publish date
  publishDate = $('time').attr('datetime') ||
                $('[class*="date"]').first().text() ||
                $('[class*="published"]').first().text() ||
                $('[data-testid*="date"]').text();

  // Try to extract author
  author = $('[class*="author"]').first().text() ||
           $('[rel="author"]').text() ||
           $('[data-testid*="author"]').text() ||
           $('.byline').text();

  // Enhanced content selectors with priority order
  const contentSelectors = [
    'article',
    '[class*="article-body"]',
    '[class*="story-body"]',
    '[class*="post-content"]',
    '[class*="entry-content"]',
    '[class*="article-content"]',
    '[class*="content-body"]',
    '[data-testid*="article-body"]',
    '[class*="article"]',
    '[class*="content"]',
    '[class*="story"]',
    '[class*="post"]',
    'main',
    '[role="main"]'
  ];

  // Try each selector to find content
  for (const selector of contentSelectors) {
    const element = $(selector);
    if (element.length > 0) {
      // Remove unwanted elements before extracting text
      element.find('nav, footer, header, .nav, .footer, .header, .sidebar, .menu, .advertisement, .ad, .social-share, .related-articles, .comments').remove();
      content = element.text();
      if (content.length > 300) { // Only use if substantial content
        break;
      }
    }
  }

  // Enhanced fallback: extract paragraph text with better filtering
  if (!content || content.length < 300) {
    // Remove unwanted elements first
    $('nav, footer, header, .nav, .footer, .header, .sidebar, .menu, .advertisement, .ad, .social-share, .related-articles, .comments, script, style').remove();

    // Get all paragraphs and filter out short ones
    const paragraphs = $('p').map((i, el) => {
      const text = $(el).text().trim();
      return text.length > 50 ? text : null; // Only include substantial paragraphs
    }).get().filter(Boolean);

    content = paragraphs.join(' ');
  }

  // Final fallback: get body text but filter out navigation/footer
  if (!content || content.length < 200) {
    $('nav, footer, header, .nav, .footer, .header, .sidebar, .menu, .advertisement, .ad, script, style').remove();
    content = $('body').text();
  }

  return {
    title: cleanText(title),
    content: cleanText(content),
    publishDate: cleanText(publishDate),
    author: cleanText(author)
  };
}

// Function to scrape a single URL with enhanced error handling
async function scrapeUrl(url) {
  try {
    console.log(`Scraping: ${url}`);

    const response = await axios.get(url, {
      timeout: 15000, // Increased timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      maxRedirects: 5, // Follow redirects
      validateStatus: function (status) {
        return status >= 200 && status < 400; // Accept 2xx and 3xx status codes
      }
    });

    const $ = cheerio.load(response.data);
    const extracted = extractArticleContent($);

    if (!extracted.content || extracted.content.length < 100) {
      throw new Error('Insufficient content extracted');
    }

    console.log(`✅ Successfully scraped: ${url} (${extracted.content.length} chars)`);

    return {
      url,
      title: extracted.title,
      content: extracted.content,
      publishDate: extracted.publishDate,
      author: extracted.author,
      wordCount: extracted.content.split(' ').length,
      scrapedAt: new Date().toISOString(),
      status: 'success'
    };

  } catch (error) {
    const errorInfo = {
      url,
      error: error.message,
      status: error.response?.status || 'unknown',
      statusText: error.response?.statusText || 'unknown',
      scrapedAt: new Date().toISOString()
    };

    if (error.response?.status === 404) {
      console.error(`❌ 404 Not Found: ${url}`);
      errorInfo.errorType = '404_not_found';
    } else if (error.response?.status === 403) {
      console.error(`🚫 403 Forbidden: ${url}`);
      errorInfo.errorType = '403_forbidden';
    } else if (error.code === 'ENOTFOUND') {
      console.error(`🌐 DNS Error: ${url}`);
      errorInfo.errorType = 'dns_error';
    } else if (error.code === 'ETIMEDOUT') {
      console.error(`⏰ Timeout: ${url}`);
      errorInfo.errorType = 'timeout';
    } else {
      console.error(`❌ Error scraping ${url}:`, error.message);
      errorInfo.errorType = 'general_error';
    }

    return { ...errorInfo, status: 'failed' };
  }
}

// Function to scrape multiple URLs with detailed reporting
async function scrapeUrls(urls) {
  const results = [];
  const failedUrls = [];
  const urlStats = {
    total: urls.length,
    successful: 0,
    failed: 0,
    errors: {}
  };

  console.log(`🚀 Starting to scrape ${urls.length} URLs...`);

  // Process URLs in parallel but limit concurrency
  const batchSize = 3;
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const batchPromises = batch.map(url => scrapeUrl(url));
    const batchResults = await Promise.all(batchPromises);

    // Separate successful and failed results
    batchResults.forEach(result => {
      if (result && result.status === 'success') {
        results.push(result);
        urlStats.successful++;
      } else if (result && result.status === 'failed') {
        failedUrls.push(result);
        urlStats.failed++;

        // Track error types
        const errorType = result.errorType || 'unknown';
        urlStats.errors[errorType] = (urlStats.errors[errorType] || 0) + 1;
      }
    });

    // Small delay between batches to be respectful
    if (i + batchSize < urls.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Log detailed statistics
  console.log(`📊 Scraping Results:`);
  console.log(`   ✅ Successful: ${urlStats.successful}/${urlStats.total}`);
  console.log(`   ❌ Failed: ${urlStats.failed}/${urlStats.total}`);

  if (urlStats.failed > 0) {
    console.log(`   📋 Error Breakdown:`);
    Object.entries(urlStats.errors).forEach(([errorType, count]) => {
      console.log(`      ${errorType}: ${count}`);
    });

    console.log(`   🔍 Failed URLs:`);
    failedUrls.forEach(failed => {
      console.log(`      ${failed.url} - ${failed.error} (${failed.status})`);
    });
  }

  return {
    successful: results,
    failed: failedUrls,
    stats: urlStats
  };
}

// Function to scrape search results with intelligent fallbacks
async function scrapeSearchResults(searchTerms, options = {}) {
  const {
    googleApiKey = null,
    searchEngineId = null,
    maxResults = 10,
    fallbackToGrounding = true
  } = options;

  console.log(`🔍 Starting intelligent search for: "${searchTerms}"`);

  // Step 1: Try custom Google Search API first
  let searchResults = [];
  if (googleApiKey && searchEngineId) {
    searchResults = await performCustomGoogleSearch(searchTerms, googleApiKey, searchEngineId, maxResults);
  }

  // Step 2: If no results or API not available, could add other search methods here
  if (searchResults.length === 0) {
    console.log('⚠️ No results from custom search, you may want to rely on Google Search Grounding');
  }

  // Step 3: Attempt to scrape the found URLs
  if (searchResults.length > 0) {
    const urlsToScrape = searchResults.map(result => result.url);
    console.log(`📥 Attempting to scrape ${urlsToScrape.length} search result URLs...`);

    const scrapingResults = await scrapeUrls(urlsToScrape);

    // Filter out failed URLs and try alternative sources if needed
    if (scrapingResults.successful.length === 0 && scrapingResults.failed.length > 0) {
      console.log('⚠️ All search result URLs failed to scrape. Consider using different search terms or sources.');
    }

    return {
      searchResults: searchResults,
      scrapedContent: scrapingResults.successful,
      failedUrls: scrapingResults.failed,
      stats: scrapingResults.stats
    };
  }

  return {
    searchResults: [],
    scrapedContent: [],
    failedUrls: [],
    stats: { total: 0, successful: 0, failed: 0, errors: {} }
  };
}

module.exports = {
  scrapeUrls,
  scrapeUrl,
  performCustomGoogleSearch,
  scrapeSearchResults
};
