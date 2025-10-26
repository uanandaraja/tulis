import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { document, documentVersion } from "@/lib/db/schema";
import {
	getDocumentStorageKey,
	getDocumentVersionStorageKey,
	storage,
} from "@/lib/storage";
import type {
	DocumentWithContent,
	StoredDocumentContent,
	StoredVersionContent,
} from "@/lib/types/document";

function generateId(): string {
	return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function countWords(text: string): number {
	return text.trim().split(/\s+/).filter(Boolean).length;
}

function extractPreview(content: string, length: number): string {
	return content.slice(0, length).trim();
}

export async function createDocument(
	userId: string,
	title: string,
	content: string,
	chatId?: string,
	createdBy: "user" | "assistant" = "assistant",
	changeDescription?: string,
): Promise<DocumentWithContent> {
	const documentId = generateId();
	const versionId = generateId();
	const versionNumber = 1;
	const wordCount = countWords(content);
	const storageKey = getDocumentStorageKey(userId, documentId);
	const versionStorageKey = getDocumentVersionStorageKey(
		userId,
		documentId,
		versionNumber,
	);

	// Store content in S3
	const documentData: StoredDocumentContent = {
		documentId,
		versionId,
		versionNumber,
		title,
		content,
		wordCount,
		updatedAt: new Date().toISOString(),
	};

	await storage.write(storageKey, JSON.stringify(documentData));

	// Store version in S3
	const versionData: StoredVersionContent = {
		versionId,
		documentId,
		versionNumber,
		content,
		changeDescription,
		wordCount,
		createdBy,
		createdAt: new Date().toISOString(),
	};

	await storage.write(versionStorageKey, JSON.stringify(versionData));

	// Create document record in DB
	const [newDocument] = await db
		.insert(document)
		.values({
			id: documentId,
			chatId: chatId || null,
			userId,
			title,
			currentVersionId: versionId,
			storageKey,
			contentPreview: extractPreview(content, 500),
			wordCount,
			createdAt: new Date(),
			updatedAt: new Date(),
		})
		.returning();

	// Create version record in DB
	await db.insert(documentVersion).values({
		id: versionId,
		documentId,
		versionNumber,
		storageKey: versionStorageKey,
		contentPreview: extractPreview(content, 200),
		changeDescription,
		wordCount,
		createdBy,
		createdAt: new Date(),
	});

	return {
		...newDocument,
		content,
	};
}

export async function updateDocument(
	documentId: string,
	userId: string,
	content: string,
	createdBy: "user" | "assistant" = "user",
	changeDescription?: string,
): Promise<DocumentWithContent> {
	// Get existing document
	const existingDoc = await db.query.document.findFirst({
		where: and(eq(document.id, documentId), eq(document.userId, userId)),
	});

	if (!existingDoc) {
		throw new Error("Document not found");
	}

	// Get latest version number
	const latestVersion = await db.query.documentVersion.findFirst({
		where: eq(documentVersion.documentId, documentId),
		orderBy: [desc(documentVersion.versionNumber)],
	});

	const newVersionNumber = (latestVersion?.versionNumber || 0) + 1;
	const versionId = generateId();
	const wordCount = countWords(content);
	const storageKey = getDocumentStorageKey(userId, documentId);
	const versionStorageKey = getDocumentVersionStorageKey(
		userId,
		documentId,
		newVersionNumber,
	);

	// Store updated content in S3
	const documentData: StoredDocumentContent = {
		documentId,
		versionId,
		versionNumber: newVersionNumber,
		title: existingDoc.title,
		content,
		wordCount,
		updatedAt: new Date().toISOString(),
	};

	await storage.write(storageKey, JSON.stringify(documentData));

	// Store new version in S3
	const versionData: StoredVersionContent = {
		versionId,
		documentId,
		versionNumber: newVersionNumber,
		content,
		changeDescription,
		wordCount,
		createdBy,
		createdAt: new Date().toISOString(),
	};

	await storage.write(versionStorageKey, JSON.stringify(versionData));

	// Update document record
	const [updatedDoc] = await db
		.update(document)
		.set({
			currentVersionId: versionId,
			contentPreview: extractPreview(content, 500),
			wordCount,
			updatedAt: new Date(),
		})
		.where(eq(document.id, documentId))
		.returning();

	// Create new version record
	await db.insert(documentVersion).values({
		id: versionId,
		documentId,
		versionNumber: newVersionNumber,
		storageKey: versionStorageKey,
		contentPreview: extractPreview(content, 200),
		changeDescription,
		wordCount,
		createdBy,
		createdAt: new Date(),
	});

	return {
		...updatedDoc,
		content,
	};
}

export async function getDocument(
	documentId: string,
	userId: string,
): Promise<DocumentWithContent | null> {
	const doc = await db.query.document.findFirst({
		where: and(eq(document.id, documentId), eq(document.userId, userId)),
	});

	if (!doc) {
		return null;
	}

	try {
		const contentJson = await storage.file(doc.storageKey).text();
		const data: StoredDocumentContent = JSON.parse(contentJson);
		return {
			...doc,
			content: data.content,
		};
	} catch (error) {
		console.error("Failed to load document content:", error);
		return null;
	}
}

export async function listDocuments(userId: string, limit = 50) {
	return db.query.document.findMany({
		where: eq(document.userId, userId),
		orderBy: [desc(document.updatedAt)],
		limit,
	});
}

export async function listDocumentVersions(
	documentId: string,
	userId: string,
	limit = 20,
) {
	// Verify user owns the document
	const doc = await db.query.document.findFirst({
		where: and(eq(document.id, documentId), eq(document.userId, userId)),
	});

	if (!doc) {
		throw new Error("Document not found");
	}

	return db.query.documentVersion.findMany({
		where: eq(documentVersion.documentId, documentId),
		orderBy: [desc(documentVersion.versionNumber)],
		limit,
	});
}

export async function getDocumentVersion(
	versionId: string,
	userId: string,
): Promise<StoredVersionContent | null> {
	const version = await db.query.documentVersion.findFirst({
		where: eq(documentVersion.id, versionId),
	});

	if (!version) {
		return null;
	}

	// Verify user owns the document
	const doc = await db.query.document.findFirst({
		where: and(
			eq(document.id, version.documentId),
			eq(document.userId, userId),
		),
	});

	if (!doc) {
		return null;
	}

	try {
		const contentJson = await storage.file(version.storageKey).text();
		const data: StoredVersionContent = JSON.parse(contentJson);
		return data;
	} catch (error) {
		console.error("Failed to load version content:", error);
		return null;
	}
}

export async function restoreVersion(
	versionId: string,
	userId: string,
): Promise<DocumentWithContent> {
	// Get the version to restore
	const versionToRestore = await getDocumentVersion(versionId, userId);

	if (!versionToRestore) {
		throw new Error("Version not found");
	}

	// Create a new version with the restored content
	return updateDocument(
		versionToRestore.documentId,
		userId,
		versionToRestore.content,
		"user",
		`Restored from version ${versionToRestore.versionNumber}`,
	);
}

export async function deleteDocument(documentId: string, userId: string) {
	// Get document to find storage key
	const doc = await db.query.document.findFirst({
		where: and(eq(document.id, documentId), eq(document.userId, userId)),
	});

	if (!doc) {
		throw new Error("Document not found");
	}

	// Get all versions
	const versions = await db.query.documentVersion.findMany({
		where: eq(documentVersion.documentId, documentId),
	});

	// Delete from storage
	try {
		await storage.file(doc.storageKey).delete();
		for (const version of versions) {
			await storage.file(version.storageKey).delete();
		}
	} catch (error) {
		console.error("Failed to delete from storage:", error);
	}

	// Delete from database (cascade will delete versions)
	await db
		.delete(document)
		.where(and(eq(document.id, documentId), eq(document.userId, userId)));

	return { success: true };
}
