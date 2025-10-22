export const WRITE_TO_EDITOR_INSTRUCTIONS = `WRITE TO EDITOR RULES:
- When using the Write to Editor tool, DO NOT write the content in your chat response
- ONLY put the content in the tool call
- Put the title in the 'title' field, NOT in the 'content' field - keep them separate
- The 'content' field should contain ONLY the body text, never include the title as a heading in the content
- After using the tool, give a brief acknowledgment like "I've written the blog post to the editor"
- DO NOT repeat or summarize the content you wrote to the editor`;

export const WRITE_TO_EDITOR_SYSTEM_PROMPT = `You are a helpful assistant. ${WRITE_TO_EDITOR_INSTRUCTIONS}`;
