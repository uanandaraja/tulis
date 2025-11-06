import {
	DeleteObjectCommand,
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { config } from "./config";

const s3Client = config.storage
	? new S3Client({
			credentials: {
				accessKeyId: config.storage.accessKeyId,
				secretAccessKey: config.storage.secretAccessKey,
			},
			endpoint: config.storage.endpoint,
			region: config.storage.region,
		})
	: null;

const bucket = config.storage?.bucket || null;

export const storage = {
	async write(
		key: string,
		content: string,
		options?: { type?: string },
	): Promise<void> {
		if (!s3Client || !bucket) {
			throw new Error(
				"Storage is not configured. Please set S3 environment variables.",
			);
		}
		await s3Client.send(
			new PutObjectCommand({
				Bucket: bucket,
				Key: key,
				Body: content,
				ContentType: options?.type || "application/json",
			}),
		);
	},

	file(key: string) {
		return {
			async text(): Promise<string> {
				if (!s3Client || !bucket) {
					throw new Error(
						"Storage is not configured. Please set S3 environment variables.",
					);
				}
				const response = await s3Client.send(
					new GetObjectCommand({
						Bucket: bucket,
						Key: key,
					}),
				);
				return await response.Body!.transformToString();
			},

			async delete(): Promise<void> {
				if (!s3Client || !bucket) {
					throw new Error(
						"Storage is not configured. Please set S3 environment variables.",
					);
				}
				await s3Client.send(
					new DeleteObjectCommand({
						Bucket: bucket,
						Key: key,
					}),
				);
			},
		};
	},
};

export function getChatStorageKey(userId: string, chatId: string): string {
	return `chats/${userId}/${chatId}.json`;
}

export function getDocumentStorageKey(
	userId: string,
	documentId: string,
): string {
	return `documents/${userId}/${documentId}/current.json`;
}

export function getDocumentVersionStorageKey(
	userId: string,
	documentId: string,
	versionNumber: number,
): string {
	return `documents/${userId}/${documentId}/versions/v${versionNumber}.json`;
}
