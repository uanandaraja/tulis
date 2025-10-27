import type { UIMessage } from "ai";
import {
	ChatContainerContent,
	ChatContainerRoot,
} from "@/components/ui/chat-container";
import { Loader } from "@/components/ui/loader";
import { ScrollButton } from "@/components/ui/scroll-button";
import type { PlanStepsToolOutput } from "@/lib/types/ai";
import { MessageRenderer } from "./message-renderer";

interface PlanStepData {
	messageId: string;
	toolCallId: string;
	output: PlanStepsToolOutput;
}

interface ChatMessagesProps {
	messages: UIMessage[];
	isLoading: boolean;
	selectedModel: string;
	isStreaming: boolean;
	enableReasoning: boolean;
	allPlanSteps: PlanStepData[];
	onShowDocument?: (versionId?: string) => void;
}

export function ChatMessages({
	messages,
	isLoading,
	selectedModel,
	isStreaming,
	enableReasoning,
	allPlanSteps,
	onShowDocument,
}: ChatMessagesProps) {
	return (
		<ChatContainerRoot
			className="flex-1 relative overflow-x-hidden"
			style={{ minHeight: 0 }}
		>
			<ChatContainerContent className="p-4 space-y-4 max-w-full">
				{messages.length === 0 ? (
					<div className="text-center text-muted-foreground py-12">
						Start a conversation by typing a message below
					</div>
				) : (
					<>
						{messages.map((message) => (
							<MessageRenderer
								key={message.id}
								message={message}
								selectedModel={selectedModel}
								isStreaming={isStreaming}
								enableReasoning={enableReasoning}
								allPlanSteps={allPlanSteps}
								onShowDocument={onShowDocument}
							/>
						))}
						{isLoading && (
							<div className="flex justify-start">
								<Loader variant="pulse-dot" size="sm" />
							</div>
						)}
					</>
				)}
			</ChatContainerContent>
			<div className="absolute right-4 bottom-4">
				<ScrollButton />
			</div>
		</ChatContainerRoot>
	);
}
