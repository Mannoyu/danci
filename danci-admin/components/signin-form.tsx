"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      if (!response.ok) {
        if (result.redirectTo) router.replace(result.redirectTo);
        setError(result.error ?? "登录失败，请稍后重试");
        return;
      }
      router.replace("/books");
      router.refresh();
    } catch {
      setError("无法连接到服务器，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <header className="mb-7">
        <p className="mb-2 text-xs font-medium text-primary">ADMIN ACCESS</p>
        <h1 className="text-2xl font-semibold tracking-tight">欢迎回来</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">登录后管理单词书和系统内容。</p>
      </header>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">邮箱</Label>
          <Input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" className="h-10 bg-background" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">密码</Label>
          <div className="relative">
            <Input id="password" type={visible ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-10 bg-background pr-11" minLength={8} required />
            <button type="button" onClick={() => setVisible((current) => !current)} className="absolute inset-y-0 right-0 grid w-10 place-items-center text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring" aria-label={visible ? "隐藏密码" : "显示密码"}>
              {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
        <Button type="submit" className="h-10 w-full" disabled={loading}>
          {loading ? <LoaderCircle className="size-4 animate-spin" /> : "登录"}
          {!loading && <ArrowRight className="size-4" />}
        </Button>
        {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
      </form>
    </AuthShell>
  );
}
