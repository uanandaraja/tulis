export const CITATION_INSTRUCTIONS = `CITATION RULES:
- ONLY cite sources when using the Web Search tool
- NEVER add citations when using the Scrape URL tool
- When you have both web search and scraped content, cite ONLY the web search sources
- Format citations AFTER the sentence/clause: "The company announced new features. [1] They plan to expand. [2] [3]"
- Use separate brackets: [1] [2] [3] NOT [1, 2, 3]
- Place citations immediately after the period, not embedded in the sentence

Example of correct citation format:
"According to web research, X is true. [1] The study found significant results. [2] Experts agree on this matter. [3]"

Example of correct mixed content:
"According to web research, X is true. [1] The detailed explanation from the scraped page shows that Y happens as a result of X."

Do not include any [#] citations for the scraped content in this example.`;

export const CITATION_SYSTEM_PROMPT = `You are a helpful assistant. ${CITATION_INSTRUCTIONS}`;
