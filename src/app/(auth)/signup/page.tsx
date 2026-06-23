// src/app/(auth)/signup/page.tsx

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signupSchema, SignupFormData } from "@/lib/validations/auth";
import { signUp } from "@/services/auth";

export default function SignupPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  async function onSubmit(data: SignupFormData) {
    setLoading(true);
    setServerError(null);

    try {
      await signUp({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
      });
      router.push("/dashboard");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setServerError(error.message);
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F1623]">
      <div className="w-full max-w-md p-8 rounded-xl bg-[#1A2333] border border-[#2A3A52]">

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-[#F5ECD7]">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-[#8A9BB0]">
            Start remembering every story
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-[#C8D6E5] mb-1">
              Full Name
            </label>
            <input
              {...register("fullName")}
              type="text"
              placeholder="Your name"
              className="w-full px-4 py-2.5 rounded-lg bg-[#0F1623] border border-[#2A3A52] text-[#F5ECD7] placeholder-[#4A5A6A] focus:outline-none focus:border-[#C9A84C] text-sm"
            />
            {errors.fullName && (
              <p className="mt-1 text-xs text-red-400">{errors.fullName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#C8D6E5] mb-1">
              Email
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 rounded-lg bg-[#0F1623] border border-[#2A3A52] text-[#F5ECD7] placeholder-[#4A5A6A] focus:outline-none focus:border-[#C9A84C] text-sm"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#C8D6E5] mb-1">
              Password
            </label>
            <input
              {...register("password")}
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-lg bg-[#0F1623] border border-[#2A3A52] text-[#F5ECD7] placeholder-[#4A5A6A] focus:outline-none focus:border-[#C9A84C] text-sm"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>

          {serverError && (
            <p className="text-xs text-red-400 text-center">{serverError}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-[#C9A84C] text-[#0F1623] font-semibold text-sm hover:bg-[#D4B86A] transition-colors disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

        </form>

        <p className="mt-6 text-center text-sm text-[#8A9BB0]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#C9A84C] hover:underline">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}