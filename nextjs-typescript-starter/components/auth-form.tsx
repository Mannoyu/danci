"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Mail, LockKeyhole } from "lucide-react";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    const data = new FormData(event.currentTarget); const email = String(data.get("email")); const password = String(data.get("password"));
    if (!email.includes("@") || password.length < 6) { setError("请输入有效邮箱和至少 6 位密码"); setBusy(false); return; }
    if (mode === "register" && password !== data.get("confirmPassword")) { setError("两次输入的密码不一致"); setBusy(false); return; }
    const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/signin";
    try {
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "操作失败");
      window.localStorage.setItem("danci-user", JSON.stringify(result.user));
      router.push("/");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "操作失败");
    } finally {
      setBusy(false);
    }
  }
  return <div className="auth-page"><Link href="/" className="back-link"><ArrowLeft size={16} />返回书架</Link><div className="auth-mark"><span>LN</span><small>LEXICON NOTE</small></div><div className="auth-copy"><div className="eyebrow">{mode === "login" ? "WELCOME BACK" : "START A ROUTINE"}</div><h1>{mode === "login" ? "继续你的学习" : "建立你的词汇节奏"}</h1><p>{mode === "login" ? "今天也花几分钟，让一个新单词留下来。" : "创建一个账号，保存进度并随时继续。"}</p></div><form className="auth-form" onSubmit={submit}><label>邮箱<div className="input-wrap"><Mail size={17} /><input name="email" type="email" placeholder="you@example.com" required /></div></label><label>密码<div className="input-wrap"><LockKeyhole size={17} /><input name="password" type="password" placeholder="至少 6 位字符" minLength={6} required /></div></label>{mode === "register" && <label>确认密码<div className="input-wrap"><LockKeyhole size={17} /><input name="confirmPassword" type="password" placeholder="再次输入密码" minLength={6} required /></div></label>}{error && <p className="form-error">{error}</p>}<button className="primary-button" type="submit" disabled={busy}>{busy ? "处理中…" : mode === "login" ? "登录学习" : "创建账号"}<ArrowRight size={17} /></button></form><p className="auth-switch">{mode === "login" ? "还没有账号？" : "已经有账号？"}<Link href={mode === "login" ? "/register" : "/login"}>{mode === "login" ? "注册一个" : "去登录"}</Link></p></div>;
}
