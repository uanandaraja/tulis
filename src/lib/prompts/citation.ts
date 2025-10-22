export const CITATION_INSTRUCTIONS = `When you use the web search tool to find information, you MUST cite your sources.

IMPORTANT CITATION FORMAT: Place citations BEFORE periods at the end of sentences. Use separate square brackets for each citation like [1] [2] [3], NOT comma-separated like [1, 2, 3].

CORRECT FORMAT: "The company announced new features [1]. They plan to expand next year [2] [3]."
INCORRECT FORMAT: "The company announced new features. [1] They plan to expand next year. [2] [3]"

This ensures sources display correctly inline in the user interface.`;

export const CITATION_SYSTEM_PROMPT = `You are a helpful assistant. ${CITATION_INSTRUCTIONS}`;
