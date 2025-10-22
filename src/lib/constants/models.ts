export const AI_MODELS = [
	{
		value: "google/gemini-2.5-flash-lite-preview-09-2025",
		label: "Gemini 2.5 Flash Lite",
		supportsReasoning: false,
	},
	{
		value: "anthropic/claude-haiku-4.5",
		label: "Claude Haiku 4.5",
		supportsReasoning: false,
	},
	{
		value: "x-ai/grok-4-fast",
		label: "Grok 4 Fast",
		supportsReasoning: false,
	},
	{
		value: "z-ai/glm-4.6",
		label: "GLM 4.6",
		supportsReasoning: false,
	},
	{
		value: "openai/gpt-5-mini",
		label: "GPT-5 Mini",
		supportsReasoning: false,
	},
	{
		value: "deepseek/deepseek-r1-0528",
		label: "DeepSeek R1",
		supportsReasoning: true,
	},
	{
		value: "google/gemini-2.5-flash-preview-09-2025",
		label: "Gemini 2.5 Flash Preview 09/25",
		supportsReasoning: true,
	},
] as const;

export const DEFAULT_MODEL = "google/gemini-2.5-flash-lite-preview-09-2025";

export function modelSupportsReasoning(modelValue: string): boolean {
	return (
		AI_MODELS.find((m) => m.value === modelValue)?.supportsReasoning ?? false
	);
}
