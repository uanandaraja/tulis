import { CITATION_INSTRUCTIONS } from "./citation";
import { WRITE_TO_EDITOR_INSTRUCTIONS } from "./editor";
import { TOOLS_INSTRUCTIONS } from "./tools";

export const SYSTEM_PROMPT = `You are a helpful assistant.

${TOOLS_INSTRUCTIONS}

${CITATION_INSTRUCTIONS}

${WRITE_TO_EDITOR_INSTRUCTIONS}

When answering questions, be clear, concise, and accurate.`;
