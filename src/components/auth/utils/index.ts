import { signIn } from "next-auth/react";

import { z } from "zod";

export const handleGoogleSignIn = async () =>
  await signIn("google", { callbackUrl: "/" });

export const handleSignIn = async (email: string, password: string) => {
  const status = await signIn("credentials", {
    redirect: false,
    email,
    password,
    callbackUrl: "/",
  });

  return status;
};

export const regexPattern = /^[a-zA-Z]+$/;

export const registerValidationSchema = z
  .object({
    username: z
      .string()
      .min(1, { message: "Name is required" })
      .refine((value) => regexPattern.test(value), {
        message: "Name cannot have any numbers or special characters",
      }),

    email: z.string().min(1, { message: "Email is required" }).email({
      message: "Must be a valid email",
    }),
    password: z
      .string()
      .min(6, { message: "Password must be atleast 6 characters" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Confirm Password is required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Password don't match",
  });

export const loginValidationSchema = z.object({
  email: z.string().min(1, { message: "Email is required" }).email({
    message: "Must be a valid email",
  }),
  password: z
    .string()
    .min(6, { message: "Password must be atleast 6 characters" }),
});
