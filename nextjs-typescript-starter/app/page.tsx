"use client";

import Link from "next/link";
import { ArrowRight, Clock3, LogIn, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BookCard } from "@/components/book-card";
import { Cover, H5Shell } from "@/components/h5-shell";

type BookData = {
  id: string;
  title: string;
  wordCount: number;
  coverUrl: string | null;
  bookId: string | null;
  tags: string;
};

type ProgressRow = { book?: BookData; currentWordRank: number };

async function readJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "加载失败");
  return data;
}

export default function HomePage() {
  const [email, setEmail] = useState<string | null>(null);
  const [books, setBooks] = useState<BookData[]>([]);
  const [progress, setProgress] = useState<ProgressRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHome = async () => {
    setLoading(true);
    setError("");
    try {
      const user = JSON.parse(localStorage.getItem("danci-user") || "null");
      setEmail(user?.email || null);
      if (user?.id) {
        const [booksResponse, progressResponse] = await Promise.all([
          readJson<{ books: BookData[] }>("/api/books"),
          readJson<{ progress: ProgressRow[] }>(`/api/progress?userId=${user.id}`),
        ]);
        setBooks(booksResponse.books || []);
        setProgress(progressResponse.progress || []);
      } else {
        const booksResponse = await readJson<{ books: BookData[] }>("/api/books");
        setBooks(booksResponse.books || []);
        setProgress([]);
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "加载失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadHome(); }, []);

  const progressByBook = useMemo(() => new Map(progress.filter((row) => row.book).map((row) => [row.book!.id, row.currentWordRank])), [progress]);
  const recent = progress[0];
  const recentBook = recent?.book;

  return (
    <H5Shell>
      <header className="topbar">
        <div>
          <div className="brand-mark">LN <span>LEXICON NOTE</span></div>
          <p className="top-kicker">DAILY WORD PRACTICE</p>
        </div>
        {email ? <Link href="/profile" className="avatar" aria-label="打开个人中心">{email[0].toUpperCase()}</Link> : <Link href="/login" className="login-link"><LogIn size={16} aria-hidden="true" />登录</Link>}
      </header>

      <section className="home-intro">
        <p className="eyebrow">你的词汇书架</p>
        <h1>每天一点，<em>留下一个词。</em></h1>
        <p className="lead">把学习变成一种轻盈、可持续的日常。</p>
        <div className="intro-note"><span className="intro-dot" />{email ? "今天也为自己留出几分钟" : "登录后保存每一次进步"}</div>
      </section>

      {email && recentBook && (
        <section className="recent-module" aria-labelledby="recent-heading">
          <div className="section-label"><span id="recent-heading">最近学习</span><Clock3 size={15} aria-hidden="true" /></div>
          <Link href={`/learn/${recentBook.bookId || recentBook.id}`} className="recent-card">
            <Cover src={recentBook.coverUrl} alt="" />
            <div className="recent-copy">
              <p className="eyebrow">继续上次进度</p>
              <h2>{recentBook.title}</h2>
              <div className="progress-meta"><span>已学 {recent.currentWordRank} / {recentBook.wordCount}</span><strong>{recentBook.wordCount ? Math.round((recent.currentWordRank / recentBook.wordCount) * 100) : 0}%</strong></div>
              <div className="progress-track"><i style={{ width: `${recentBook.wordCount ? Math.min(100, (recent.currentWordRank / recentBook.wordCount) * 100) : 0}%` }} /></div>
            </div>
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </section>
      )}

      <section className="books-section" aria-labelledby="library-heading">
        <div className="section-heading"><div><p className="eyebrow">LIBRARY</p><h2 id="library-heading">全部单词书</h2></div><span>{loading ? "加载中" : `${books.length} 本`}</span></div>
        {error && <div className="inline-error"><p className="form-error">{error}</p><button className="icon-button" onClick={() => void loadHome()} aria-label="重新加载"><RefreshCw size={16} /></button></div>}
        {loading ? <div className="book-list" aria-label="正在加载"><div className="skeleton-book" /><div className="skeleton-book" /><div className="skeleton-book" /></div> : books.length ? <div className="book-list">{books.map((book) => <BookCard key={book.id} book={{ ...book, bookId: book.bookId || book.id, coverUrl: book.coverUrl || "" }} progress={progressByBook.get(book.id) || 0} />)}</div> : <div className="empty-state compact-empty"><h2>还没有可学习的单词书</h2><p>稍后再来看看，或联系管理员添加内容。</p></div>}
      </section>

      {!email && !loading && <section className="guest-callout"><div><p className="eyebrow">MAKE IT YOURS</p><h2>保存进度，随时继续。</h2></div><Link href="/register" className="secondary-button">创建账号 <ArrowRight size={16} /></Link></section>}
    </H5Shell>
  );
}
