import axios from 'axios';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';

export const cleanIt = (markdown) => {
  return markdown
    // Remove multiple consecutive empty lines
    .replace(/\n{3,}/g, '\n\n')
    // Remove trailing whitespace
    .replace(/[ \t]+\n/g, '\n')
    // Remove leading and trailing whitespace
    .trim();
};

export const fetchAndConvertToMarkdown = async (url) => {
  try {
    // Step 1: Fetch the HTML content from the webpage
    const { data } = await axios.get(url);

    // Step 2: Load the HTML into Cheerio
    const $ = cheerio.load(data);

    // Step 3: Remove unwanted tags
    $('script, style, svg').remove(); // Remove all script, style, and SVG elements

    // Step 4: Remove elements that are visually irrelevant or noisy
    $('img, iframe, video, object').remove(); // Remove image, iframe, video, and object elements
    $('[aria-hidden="true"]').remove(); // Remove elements with aria-hidden="true"
    $('[role="presentation"]').remove(); // Remove purely decorative elements

    // Step 5: Extract and Clean Content from <body>
    let content = $('body').html(); // Get the HTML content inside the body

    // Step 6: Convert HTML to Markdown using Turndown
    const turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
    });

    // Add custom rule to remove empty paragraphs
    turndownService.addRule('removeEmptyLines', {
      filter: (node) => node.nodeName === 'P' && node.textContent.trim() === '',
      replacement: () => '\n',
    });

    // Add custom rule for tables
    turndownService.addRule('tables', {
      filter: ['table'],
      replacement: (content, node) => {
        const rows = node.rows;
        const headers = Array.from(rows[0].cells).map((cell) => cell.textContent.trim());
        const separator = headers.map(() => '---');
        const body = Array.from(rows)
          .slice(1)
          .map((row) =>
            Array.from(row.cells).map((cell) => cell.textContent.trim())
          );

        const markdownTable = [
          headers.join(' | '),
          separator.join(' | '),
          ...body.map((row) => row.join(' | ')),
        ].join('\n');

        return '\n\n' + markdownTable + '\n\n';
      },
    });

    // Add custom rule for handling empty links
    turndownService.addRule('handleEmptyLinks', {
      filter: (node) => node.nodeName === 'A' && !node.textContent.trim(),
      replacement: (content, node) => {
        const href = node.getAttribute('href') || '';
        // Option 2: Replace with plain URL
        return href;
      },
    });

    let markdownContent = turndownService.turndown(content);

    // Step 7: Clean up the Markdown content
    const cleanedMarkdown = cleanIt(markdownContent);

    return cleanedMarkdown;
  } catch (error) {
    console.error('Error fetching or converting content:', error.message);
    throw error;
  }
};
