import { S3Client } from "bun";

export const storage = new S3Client({
	accessKeyId: process.env.S3_ACCESS_KEY_ID,
	secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
	endpoint: process.env.S3_ENDPOINT,
	bucket: process.env.S3_BUCKET,
});

export function getChatStorageKey(userId: string, chatId: string): string {
	return `chats/${userId}/${chatId}.json`;
}

export function getDocumentStorageKey(
	userId: string,
	documentId: string,
): string {
	return `documents/${userId}/${documentId}.json`;
}
