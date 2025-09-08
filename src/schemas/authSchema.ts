import * as z from "zod";

export const SignUpSchema = z.object({
  name: z.optional(
    z.string().min(2, { message: "Name must be at least 2 characters long" })
  ),
  email: z.email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
});

export const SignInSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
});
