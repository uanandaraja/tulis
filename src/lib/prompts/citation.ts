export const CITATION_INSTRUCTIONS = `CITATION RULES:
- ONLY cite sources when using the Web Search tool
- NEVER add citations when using the Scrape URL tool
- When you have both web search and scraped content, cite ONLY the web search sources
- Format citations BEFORE periods: "Information [1]. More info [2]." NOT "Information. [1] More info. [2]"
- Use separate brackets: [1] [2] [3] NOT [1, 2, 3]

Example of correct mixed content:
"According to web research, X is true [1]. The detailed explanation from the scraped page shows that Y happens as a result of X."

Do not include any [#] citations for the scraped content in this example.`;

export const CITATION_SYSTEM_PROMPT = `You are a helpful assistant. ${CITATION_INSTRUCTIONS}`;
