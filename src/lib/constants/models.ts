export const AI_MODELS = [
	{
		value: "google/gemini-2.5-flash-lite-preview-09-2025",
		label: "Gemini 2.5 Flash Lite",
		supportsReasoning: false,
		logo: "/logos/gemini.svg",
	},
	{
		value: "anthropic/claude-haiku-4.5",
		label: "Claude Haiku 4.5",
		supportsReasoning: false,
		logo: "/logos/claude.svg",
	},
	{
		value: "minimax/minimax-m2:free",
		label: "MiniMax M2",
		supportsReasoning: true,
		logo: "/logos/minimax.svg",
	},
	{
		value: "google/gemini-2.5-flash-preview-09-2025",
		label: "Gemini 2.5 Flash Preview 09/25",
		supportsReasoning: true,
		logo: "/logos/gemini.svg",
	},
	{
		value: "moonshotai/kimi-k2-0905:exacto",
		label: "Kimi K2",
		supportsReasoning: true,
		logo: "/logos/kimi.svg",
	},
	{
		value: "deepseek/deepseek-v3.1-terminus:exacto",
		label: "DeepSeek v3.1 Terminus",
		supportsReasoning: true,
		logo: "/logos/deepseek.svg",
	},
] as const;

export const DEFAULT_MODEL = "minimax/minimax-m2:free";
export const CHAT_TITLE_GENERATION_MODEL =
	"google/gemini-2.5-flash-lite-preview-09-2025";

export function modelSupportsReasoning(modelValue: string): boolean {
	return (
		AI_MODELS.find((m) => m.value === modelValue)?.supportsReasoning ?? false
	);
}
