"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { getMe, login } from "@/lib/api";
import { getAdminToken } from "@/lib/auth";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) return;
    void getMe(token).then((r) => {
      if (r.success) router.replace("/admin/dashboard");
    });
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await login(email.trim(), password);
      router.replace("/admin/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-md space-y-4 rounded-2xl border border-white/10 bg-midnight p-8"
    >
      <div>
        <p className="section-label mb-2">Admin Access</p>
        <h1 className="font-display text-2xl font-extrabold text-pearl">
          Sign in
        </h1>
        <p className="mt-1 text-sm text-[#5C6B82]">
          Use your Supabase admin email and password. Requests go through the
          FE API proxy to avoid CORS.
        </p>
      </div>
      <Input
        label="Email"
        type="email"
        required
        autoComplete="username"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="admin@example.com"
      />
      <Input
        label="Password"
        type="password"
        required
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
      />
      {error ? <p className="text-sm text-plot-sold">{error}</p> : null}
      <Button type="submit" variant="gold" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
