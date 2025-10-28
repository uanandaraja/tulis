import {
	DeleteObjectCommand,
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";

const s3Client = new S3Client({
	credentials: {
		accessKeyId: process.env.S3_ACCESS_KEY_ID!,
		secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
	},
	endpoint: process.env.S3_ENDPOINT,
	region: process.env.S3_REGION || "auto",
});

const bucket = process.env.S3_BUCKET!;

export const storage = {
	async write(
		key: string,
		content: string,
		options?: { type?: string },
	): Promise<void> {
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
				const response = await s3Client.send(
					new GetObjectCommand({
						Bucket: bucket,
						Key: key,
					}),
				);
				return await response.Body!.transformToString();
			},

			async delete(): Promise<void> {
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
