import { fetchAndConvertToMarkdown } from './scraper.js';

(async () => {
  const url = 'https://www.salesforce.com/in/agentforce/';
  try {
    const markdownContent = await fetchAndConvertToMarkdown(url);
    console.log('LLM-Friendly Markdown Content:\n', markdownContent);
  } catch (error) {
    console.error('Failed to fetch and convert:', error);
  }
})();
