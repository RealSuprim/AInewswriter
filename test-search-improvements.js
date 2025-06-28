// Test script to demonstrate the search improvements
const axios = require('axios');

async function testSearchImprovements() {
  console.log('🧪 Testing Search Function Improvements');
  console.log('=====================================\n');

  // Test URLs - mix of working and problematic URLs
  const testUrls = [
    'https://www.bbc.com/sport/football/articles/c4g3x4g3x4g', // Likely 404
    'https://www.theguardian.com/football/2024/jan/01/test-article', // Likely 404
    'https://httpstat.us/404', // Intentional 404
    'https://httpstat.us/403', // Intentional 403
    'https://httpstat.us/500', // Intentional 500
    'https://www.bbc.com/sport', // Should work
    'https://www.theguardian.com/sport' // Should work
  ];

  try {
    console.log('📡 Testing enhanced scraping with error handling...');
    
    const response = await axios.post('http://localhost:3001/api/generate-article', {
      urls: testUrls,
      apiKey: 'test-key', // You'll need a real API key
      articleTitle: 'Test Article for Search Improvements',
      articleStyle: 'news',
      selectedModel: 'gemini-2.5-flash',
      englishVariant: 'british',
      enableSearch: false, // Test without search first
      searchKeywords: ''
    });

    console.log('✅ Response received:');
    console.log('📊 Scraping Statistics:', response.data.scrapingStats);
    console.log('✅ Successful sources:', response.data.sources.length);
    console.log('❌ Failed sources:', response.data.failedSources?.length || 0);
    
    if (response.data.failedSources && response.data.failedSources.length > 0) {
      console.log('\n🔍 Failed URL Analysis:');
      response.data.failedSources.forEach((failed, index) => {
        console.log(`${index + 1}. ${failed.url}`);
        console.log(`   Error: ${failed.error}`);
        console.log(`   Type: ${failed.errorType}`);
        console.log(`   Status: ${failed.status}\n`);
      });
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

async function testCustomSearch() {
  console.log('\n🔍 Testing Custom Google Search API');
  console.log('===================================\n');

  try {
    const response = await axios.post('http://localhost:3001/api/test-search', {
      searchTerms: 'Premier League football news 2024',
      // You would need to provide these for the custom search to work:
      // googleApiKey: 'your-google-api-key',
      // searchEngineId: 'your-search-engine-id',
      maxResults: 5
    });

    console.log('✅ Search test response:');
    console.log('📊 Summary:', response.data.summary);
    
  } catch (error) {
    console.error('❌ Search test failed:', error.response?.data || error.message);
  }
}

// Run tests
if (require.main === module) {
  console.log('🚀 Starting search improvement tests...\n');
  
  testSearchImprovements()
    .then(() => testCustomSearch())
    .then(() => {
      console.log('\n✅ All tests completed!');
      console.log('\n💡 Key Improvements Made:');
      console.log('1. Enhanced error handling with specific error types (404, 403, timeout, etc.)');
      console.log('2. Detailed scraping statistics and reporting');
      console.log('3. Failed URL tracking and display in the UI');
      console.log('4. Custom Google Search API integration option');
      console.log('5. Better user feedback about what went wrong');
      console.log('\n🔧 To fully utilize custom search:');
      console.log('1. Get a Google Custom Search API key');
      console.log('2. Create a Custom Search Engine ID');
      console.log('3. Add these to your environment variables');
    })
    .catch(console.error);
}

module.exports = { testSearchImprovements, testCustomSearch };
