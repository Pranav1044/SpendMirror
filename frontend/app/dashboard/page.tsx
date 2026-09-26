import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const email =
    typeof data?.claims?.email === "string" ? data.claims.email : null;

  if (error || !data?.claims) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-lg space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground">{email ?? "Signed in"}</p>
      </div>
    </main>
  );
}
