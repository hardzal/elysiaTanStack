import { createFileRoute } from '@tanstack/react-router'
import { useState } from "react";
import { z } from "zod";

import { signIn } from "#/lib/auth/client";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute('/login')({
  validateSearch: searchSchema,
  component: LoginPage,
})

function LoginPage() {
  const { redirect: redirectTo } = Route.useSearch();
  const [isLoading, setIsLoading] = useState(false);

  const handleGitHubLogin = async () => {
    setIsLoading(true);
    const callbackURL = redirectTo
      ? `\({window.location.origin}\){redirectTo}`
      : `${window.location.origin}/dashboard`;

    await signIn.social({
      provider: "github",
      callbackURL,
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-lg border p-8">
        <h1 className="mb-6 text-2xl font-bold">Sign In</h1>
        <button
          onClick={handleGitHubLogin}
          disabled={isLoading}
          className="w-full rounded-md bg-gray-900 px-4 py-3 text-white"
        >
          {isLoading ? "Signing in..." : "Sign in with GitHub"}
        </button>
      </div>
    </div>
  );
}