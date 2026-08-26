"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, LoaderCircle } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name"));
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    const confirmation = String(form.get("confirmation"));

    if (password !== confirmation) {
      setError("两次输入的密码不一致，请重新确认。");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? "注册失败，请稍后重试");
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
        <p className="mb-2 text-xs font-medium text-primary">CREATE ADMIN</p>
        <h1 className="text-2xl font-semibold tracking-tight">注册管理员</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">创建用于管理系统内容的管理员账号。</p>
      </header>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="name">姓名</Label>
          <Input id="name" name="name" autoComplete="name" placeholder="请输入姓名" className="h-10 bg-background" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">邮箱</Label>
          <Input id="email" name="email" type="email" autoComplete="email" placeholder="name@example.com" className="h-10 bg-background" required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} className="h-10 bg-background" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmation">确认密码</Label>
            <Input id="confirmation" name="confirmation" type="password" autoComplete="new-password" minLength={8} className="h-10 bg-background" required />
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Check className="size-3.5 text-emerald-600" />
          密码至少需要 8 个字符
        </div>
        {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
        <Button type="submit" className="h-10 w-full" disabled={loading}>
          {loading ? <LoaderCircle className="size-4 animate-spin" /> : "创建账号"}
          {!loading && <ArrowRight className="size-4" />}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        已经有账号？
        <Link href="/signin" className="ml-1 font-medium text-primary hover:underline">返回登录</Link>
      </p>
    </AuthShell>
  );
}
