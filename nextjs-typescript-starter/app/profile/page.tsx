"use client";

import Link from "next/link";
import { ArrowRight, LogOut, RefreshCw, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Cover, H5Shell } from "@/components/h5-shell";

type ProgressRow = { id: number; currentWordRank: number; book?: { id: string; title: string; wordCount: number; coverUrl: string | null; bookId: string | null } };

export default function ProfilePage() {
  const [email, setEmail] = useState<string | null>(null);
  const [rows, setRows] = useState<ProgressRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProgress = async () => {
    const user = JSON.parse(localStorage.getItem("danci-user") || "null");
    setEmail(user?.email || null);
    if (!user?.id) { setLoading(false); return; }
    try {
      const response = await fetch(`/api/progress?userId=${user.id}`, { headers: { Accept: "application/json" } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "进度加载失败");
      setRows(data.progress || []);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "进度加载失败");
    } finally { setLoading(false); }
  };

  useEffect(() => { void loadProgress(); }, []);

  if (!email) return <H5Shell><section className="empty-state profile-empty"><UserRound size={24} /><p className="eyebrow">YOUR ROUTINE</p><h2>登录后查看你的学习轨迹</h2><p>保存每一本书的进度，下一次打开就能从上次的位置继续。</p><Link href="/login" className="primary-button compact">去登录 <ArrowRight size={16} /></Link></section></H5Shell>;

  return (
    <H5Shell>
      <header className="simple-header"><div><p className="eyebrow">ACCOUNT</p><h1>我的</h1></div><span className="profile-status">学习中</span></header>
      <section className="profile-identity"><span className="identity-avatar">{email[0].toUpperCase()}</span><div><p className="eyebrow">当前账号</p><h2>{email}</h2><p className="identity-note">你的学习记录只属于你。</p></div></section>
      <section className="progress-section" aria-labelledby="progress-heading">
        <div className="section-heading"><div><p className="eyebrow">YOUR LIBRARY</p><h2 id="progress-heading">学习进度</h2></div><span>{loading ? "加载中" : `${rows.length} 本`}</span></div>
        {error && <div className="inline-error"><p className="form-error">{error}</p><button className="icon-button" onClick={() => { setLoading(true); setError(""); void loadProgress(); }} aria-label="重新加载"><RefreshCw size={16} /></button></div>}
        {loading ? <div className="progress-list"><div className="skeleton-progress" /><div className="skeleton-progress" /></div> : rows.length ? <div className="progress-list">{rows.map((row) => { if (!row.book) return null; const percent = row.book.wordCount ? Math.min(100, Math.round((row.currentWordRank / row.book.wordCount) * 100)) : 0; return <Link href={`/learn/${row.book.bookId || row.book.id}`} className="progress-row" key={row.id}><Cover src={row.book.coverUrl} alt="" /><div><strong>{row.book.title}</strong><p>已学 {row.currentWordRank} / {row.book.wordCount} 词</p><div className="book-progress"><i style={{ width: `${percent}%` }} /></div></div><span className="row-percent">{percent}%</span><ArrowRight size={16} aria-hidden="true" /></Link>; })}</div> : <div className="empty-state compact-empty"><h2>还没有学习记录</h2><p>从书架挑一本喜欢的单词书开始吧。</p><Link href="/" className="secondary-button">去书架 <ArrowRight size={16} /></Link></div>}
      </section>
      <button className="logout-button" onClick={() => { localStorage.removeItem("danci-user"); location.href = "/login"; }}><LogOut size={17} aria-hidden="true" />退出登录</button>
    </H5Shell>
  );
}
