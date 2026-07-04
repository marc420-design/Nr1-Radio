"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      const from = searchParams.get("from") ?? "/admin";
      router.push(from);
    } else {
      setError("Wrong password.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        autoFocus
        className="w-full bg-nr1-grey border border-nr1-cyan/30 rounded px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-nr1-cyan"
      />
      {error && <p className="text-nr1-crimson text-xs font-mono">{error}</p>}
      <button
        type="submit"
        disabled={loading || !password}
        className="w-full bg-nr1-cyan text-nr1-black font-heading tracking-widest py-3 rounded hover:bg-nr1-cyan/90 disabled:opacity-40"
      >
        {loading ? "..." : "ENTER"}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-nr1-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="font-heading text-3xl text-nr1-cyan tracking-widest text-center">NR1 ADMIN</h1>
        <Suspense fallback={<div className="h-24" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
