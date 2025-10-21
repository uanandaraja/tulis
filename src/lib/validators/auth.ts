import { z } from "zod";

export const emailSchema = z
	.string()
	.min(1, "Email is required")
	.email("Invalid email address");

export const nameSchema = z
	.string()
	.min(1, "Name is required")
	.max(100, "Name must be less than 100 characters");

export const signInSchema = z.object({
	email: emailSchema,
});

export const signUpSchema = z.object({
	name: nameSchema,
	email: emailSchema,
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
