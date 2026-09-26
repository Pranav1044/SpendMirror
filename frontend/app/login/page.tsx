"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signInWithGoogle() {
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center bg-background px-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 rounded-xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Sign in
          </h1>
          <p className="text-sm text-muted-foreground">
            Continue with your Google account to open the dashboard.
          </p>
        </div>
        <Button
          type="button"
          size="lg"
          className="w-full"
          disabled={isLoading}
          onClick={signInWithGoogle}
        >
          {isLoading ? "Redirecting…" : "Sign in with Google"}
        </Button>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </main>
  );
}
