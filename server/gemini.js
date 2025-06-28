const { GoogleGenerativeAI } = require('@google/generative-ai');

// Function to check if a model supports Google Search grounding
function isSearchSupportedModel(modelName) {
  const searchSupportedModels = [
    'gemini-2.5-pro',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite-preview-06-17',
    'gemini-2.5-flash-preview-native-audio-dialog',
    'gemini-2.5-flash-exp-native-audio-thinking-dialog',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b'
  ];

  return searchSupportedModels.some(supported => modelName.includes(supported.replace(/^models\//, '')));
}

// Function to create a comprehensive prompt for article generation
function createArticlePrompt(scrapedContent, articleTitle, articleStyle, englishVariant = 'british', enableSearch = false, searchKeywords = '') {
  const sources = scrapedContent.map((content, index) => {
    return `
SOURCE ${index + 1}:
URL: ${content.url}
Title: ${content.title}
Content: ${content.content.substring(0, 2500)}...
---`;
  }).join('\n');

  const styleInstructions = {
    'news': `Write in a professional news style following these specific guidelines:
- Use inverted pyramid structure (most important information first)
- Start with a strong lead paragraph that answers who, what, when, where, why
- Write in third person with authoritative, factual tone
- Include specific details, numbers, dates, and names
- Use direct quotes when available from sources
- Keep paragraphs short (2-3 sentences max)
- Use active voice and strong verbs
- End with forward-looking information or additional context
- READABILITY: Use simple, clear language that a grade 8 student can understand
- Avoid complex words - use simple alternatives (use "help" not "facilitate", "show" not "demonstrate")
- Keep sentences short (under 20 words when possible)
- Use common, everyday words
- Aim for Hemingway readability score under 9`,
    'blog': 'Write in a conversational blog style that engages readers with a personal touch. Use simple, clear language.',
    'formal': 'Write in a formal, academic style with proper citations and structured arguments.',
    'casual': 'Write in a casual, easy-to-read style that appeals to general audiences.'
  };

  const selectedStyle = styleInstructions[articleStyle] || styleInstructions['news'];

  // English variant specific instructions
  const englishVariantInstructions = {
    'british': `BRITISH ENGLISH GRAMMAR RULES:
- Collective nouns (teams, companies, bands) use PLURAL verbs: "Manchester United are playing", "Leicester were relegated", "The team are training"
- Use British spellings: colour, honour, realise, centre, defence, organised, travelled
- Use "have got" instead of "have": "United have got a new player"
- Use "at the weekend" not "on the weekend"
- Use "different to" or "different from" (not "different than")
- Use "in hospital" not "in the hospital"
- Use British date format: 27 June 2025
- Use "whilst" instead of "while" when appropriate`,

    'american': `AMERICAN ENGLISH GRAMMAR RULES:
- Collective nouns (teams, companies, bands) use SINGULAR verbs: "Manchester United is playing", "Leicester was relegated", "The team is training"
- Use American spellings: color, honor, realize, center, defense, organized, traveled
- Use "have" instead of "have got": "United has a new player"
- Use "on the weekend" not "at the weekend"
- Use "different than" or "different from" (not "different to")
- Use "in the hospital" not "in hospital"
- Use American date format: June 27, 2025
- Use "while" instead of "whilst"`
  };

  const selectedEnglishRules = englishVariantInstructions[englishVariant] || englishVariantInstructions['british'];

  // Search enhancement instructions
  const searchInstructions = enableSearch ? `
GOOGLE SEARCH ENHANCEMENT:
- Google Search grounding is ENABLED - you can search for additional current information
- Use search to find the latest news, updates, and related information about the topic
- Search for recent developments, breaking news, and current events related to the article topic
- Enhance the article with up-to-date information from search results
${searchKeywords ? `- Focus searches on these keywords: "${searchKeywords}"` : '- Generate relevant search queries based on the provided URLs and content'}
- Combine information from provided URLs with fresh search results for comprehensive coverage
- Always cite search results properly in your article` : `
CONTENT SOURCES:
- Use ONLY the information provided in the source URLs below
- Do NOT search for additional information - work with provided content only`;

  return `You are an experienced professional journalist writing for a major news publication. Your task is to create a compelling, human-sounding news article that reads like it was written by a seasoned reporter, not AI.

CRITICAL REQUIREMENTS:
1. ONLY use factual information from the provided sources - DO NOT fabricate any details, quotes, dates, or statistics
2. Write in a natural, human journalistic voice that sounds professional but engaging
3. Create an attention-grabbing headline that would make readers want to click and read
4. Use the inverted pyramid structure with the most newsworthy information first
5. Include specific details like dates, numbers, names, and locations from the sources
6. Write short, punchy paragraphs (2-3 sentences maximum)
7. Use active voice and strong, precise verbs
8. Include direct quotes from sources when available
9. Provide context and background information naturally woven throughout
10. End with forward-looking information or implications

READABILITY REQUIREMENTS (VERY IMPORTANT):
- Write for grade 8 reading level - use simple, clear language
- Keep sentences short (under 20 words when possible)
- Use common, everyday words instead of complex ones
- Replace difficult words with simple alternatives:
  * Use "help" instead of "facilitate" or "assist"
  * Use "show" instead of "demonstrate" or "illustrate"
  * Use "use" instead of "utilize"
  * Use "buy" instead of "purchase"
  * Use "start" instead of "commence" or "initiate"
  * Use "end" instead of "conclude" or "terminate"
  * Use "get" instead of "obtain" or "acquire"
  * Use "try" instead of "attempt"
- Avoid jargon and technical terms unless necessary
- If you must use complex terms, explain them simply
- Aim for Hemingway readability score under 9

WRITING STYLE GUIDELINES:
${selectedStyle}

ENGLISH VARIANT REQUIREMENTS:
${selectedEnglishRules}

SEARCH ENHANCEMENT:
${searchInstructions}

HEADLINE REQUIREMENTS:
- Make it specific and factual, not generic
- Include key details that grab attention
- Use active language and strong verbs
- Keep it under 80 characters if possible
- Make readers want to know more

ARTICLE STRUCTURE:
1. LEAD PARAGRAPH: Answer who, what, when, where, why in the first 1-2 sentences using simple words
2. SUPPORTING PARAGRAPHS: Expand on the lead with additional details and context in plain language
3. QUOTES & DETAILS: Include specific information and quotes from sources
4. BACKGROUND: Provide relevant context and history using everyday words
5. CONCLUSION: End with implications, next steps, or additional relevant information

SIMPLE LANGUAGE EXAMPLES:
- Instead of "Manchester United are contemplating the acquisition of..." write "Manchester United want to buy..."
- Instead of "The transaction is anticipated to be finalized..." write "The deal should be done..."
- Instead of "The player demonstrated exceptional performance..." write "The player played very well..."
- Instead of "Subsequently, the club announced..." write "Then, the club said..."
- Instead of "The negotiations are progressing..." write "The talks are going well..."
- Instead of "The transfer represents a significant investment..." write "The move costs a lot of money..."

${articleTitle ? `REQUESTED FOCUS/TOPIC: ${articleTitle}` : ''}

SOURCES TO ANALYZE:
${sources}

Write a compelling news article (600-900 words) that sounds completely human and professional. Format your response as:

HEADLINE: [Create an attention-grabbing, specific headline]

ARTICLE:
[Write your professional news article here]

SOURCES REFERENCED:
[List the URLs you referenced]`;
}

// Function to generate article using Gemini AI
async function generateArticle(scrapedContent, apiKey, articleTitle = '', articleStyle = 'news', selectedModel = 'gemini-2.5-flash', englishVariant = 'british', enableSearch = false, searchKeywords = '') {
  // Define fallback models in case the selected model fails
  const fallbackModels = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
  const modelsToTry = selectedModel ? [selectedModel, ...fallbackModels.filter(m => m !== selectedModel)] : fallbackModels;

  for (const modelName of modelsToTry) {
    try {
      console.log(`Initializing Gemini AI with model: ${modelName}...`);

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: modelName });

      const prompt = createArticlePrompt(scrapedContent, articleTitle, articleStyle, englishVariant, enableSearch, searchKeywords);

      console.log(`Generating article with ${modelName}...`);

      // Configure the request with optional Google Search grounding
      const requestConfig = {
        contents: [{ parts: [{ text: prompt }] }]
      };

      // Add Google Search tool if enabled and model supports it
      if (enableSearch && isSearchSupportedModel(modelName)) {
        requestConfig.tools = [{ google_search: {} }];
        console.log(`🔍 Google Search grounding enabled for ${modelName}`);
      } else if (enableSearch && !isSearchSupportedModel(modelName)) {
        console.log(`⚠️ Google Search not supported for ${modelName}, proceeding without search`);
      }

      const result = await model.generateContent(requestConfig);
      const response = await result.response;
      const generatedText = response.text();

      // Parse the response to extract headline and article
      const lines = generatedText.split('\n');
      let headline = '';
      let article = '';
      let sourcesReferenced = [];

      let currentSection = '';

      for (const line of lines) {
        if (line.startsWith('HEADLINE:')) {
          headline = line.replace('HEADLINE:', '').trim();
          currentSection = 'headline';
        } else if (line.startsWith('ARTICLE:')) {
          currentSection = 'article';
        } else if (line.startsWith('SOURCES REFERENCED:')) {
          currentSection = 'sources';
        } else if (currentSection === 'article' && line.trim()) {
          article += line + '\n';
        } else if (currentSection === 'sources' && line.trim()) {
          sourcesReferenced.push(line.trim());
        }
      }

      // Fallback if parsing fails
      if (!headline || !article) {
        const parts = generatedText.split('\n\n');
        headline = parts[0] || 'Generated News Article';
        article = parts.slice(1).join('\n\n') || generatedText;
      }

      console.log(`✅ Successfully generated article with ${modelName}`);

      // Extract search metadata if available
      const searchMetadata = response.candidates?.[0]?.groundingMetadata || null;
      const searchUsed = searchMetadata !== null;

      if (searchUsed) {
        console.log(`🔍 Search queries used: ${searchMetadata.webSearchQueries?.join(', ') || 'N/A'}`);
        console.log(`📊 Search results found: ${searchMetadata.groundingChunks?.length || 0} sources`);
      }

      return {
        headline: headline.trim(),
        content: article.trim(),
        sourcesReferenced,
        generatedAt: new Date().toISOString(),
        wordCount: article.split(' ').length,
        modelUsed: modelName,
        englishVariant: englishVariant,
        searchUsed: searchUsed,
        searchMetadata: searchMetadata
      };

    } catch (error) {
      console.error(`❌ Error with ${modelName}:`, error.message);

      // If this is the last model, throw the error
      if (modelName === modelsToTry[modelsToTry.length - 1]) {
        throw new Error(`All Gemini models failed. Last error: ${error.message}`);
      }

      // Otherwise, continue to the next model
      console.log(`Trying next model...`);
      continue;
    }
  }
}

module.exports = {
  generateArticle
};
