import {
	DeleteObjectCommand,
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { config } from "./config";

let _s3Client: S3Client | null = null;
let _bucket: string | null = null;

function getS3Client() {
	if (_s3Client !== null) {
		return _s3Client;
	}

	const storageConfig = config.storage;
	if (!storageConfig) {
		return null;
	}

	_s3Client = new S3Client({
		credentials: {
			accessKeyId: storageConfig.accessKeyId,
			secretAccessKey: storageConfig.secretAccessKey,
		},
		endpoint: storageConfig.endpoint,
		region: storageConfig.region,
	});

	return _s3Client;
}

function getBucket() {
	if (_bucket !== null) {
		return _bucket;
	}

	const storageConfig = config.storage;
	_bucket = storageConfig?.bucket || null;
	return _bucket;
}

export const storage = {
	async write(
		key: string,
		content: string,
		options?: { type?: string },
	): Promise<void> {
		const s3Client = getS3Client();
		const bucket = getBucket();

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
				const s3Client = getS3Client();
				const bucket = getBucket();

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
				const s3Client = getS3Client();
				const bucket = getBucket();

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
