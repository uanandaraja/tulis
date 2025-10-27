export interface StoredDocumentContent {
	documentId: string;
	versionId: string;
	versionNumber: number;
	title: string;
	content: string;
	wordCount: number;
	updatedAt: string;
}

export interface StoredVersionContent {
	versionId: string;
	documentId: string;
	versionNumber: number;
	content: string;
	changeDescription?: string;
	diff?: string;
	wordCount: number;
	createdBy: "user" | "assistant";
	createdAt: string;
}

export interface DocumentMetadata {
	id: string;
	chatId: string | null;
	userId: string;
	title: string;
	currentVersionId: string | null;
	storageKey: string;
	contentPreview: string | null;
	wordCount: number | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface DocumentVersionMetadata {
	id: string;
	documentId: string;
	versionNumber: number;
	storageKey: string;
	contentPreview: string | null;
	changeDescription: string | null;
	diff: string | null;
	wordCount: number;
	createdBy: string;
	createdAt: Date;
}

export interface DocumentWithContent extends DocumentMetadata {
	content: string;
}

export interface DocumentVersionWithContent extends DocumentVersionMetadata {
	content: string;
}
