"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Bookmark, LockKeyhole, RotateCcw } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type Word = { id: number; wordRank: number | null; headWord: string | null; content?: any };
type Book = { id: string; title: string; wordCount: number; bookId: string | null };

async function readJson(url: string) {
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "学习数据加载失败");
  return data;
}

export default function LearnPage() {
  const params = useParams<{ bookId: string }>();
  const router = useRouter();
  const [auth, setAuth] = useState<boolean | null>(null);
  const [book, setBook] = useState<Book | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [details, setDetails] = useState<Record<number, any>>({});
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const requested = useRef<Record<number, boolean>>({});
  const progressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadDetail = useCallback(async (id: number) => {
    if (requested.current[id]) return;
    requested.current[id] = true;
    try {
      const data = await readJson(`/api/words/${id}`);
      setDetails((current) => ({ ...current, [id]: data.word?.content ?? null }));
    } catch {
      setDetails((current) => ({ ...current, [id]: null }));
    }
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("danci-user") || "null");
    if (!user?.id) { setAuth(false); setLoading(false); return; }
    setAuth(true);
    Promise.all([
      readJson(`/api/books/${encodeURIComponent(params.bookId)}`),
      readJson(`/api/books/${encodeURIComponent(params.bookId)}/words?summary=1`),
      readJson(`/api/progress?userId=${user.id}`),
    ]).then(([bookResponse, wordsResponse, progressResponse]) => {
      const loaded: Word[] = wordsResponse.words || [];
      const saved = progressResponse.progress?.find((row: any) => row.book?.bookId === params.bookId);
      const start = saved ? Math.max(0, Math.min(Number(saved.currentWordRank) - 1, loaded.length - 1)) : 0;
      setBook(bookResponse.book);
      setWords(loaded);
      setIndex(start);
      if (loaded[start]) void loadDetail(loaded[start].id);
      if (loaded[start + 1]) void loadDetail(loaded[start + 1].id);
    }).catch((reason) => setError(reason instanceof Error ? reason.message : "学习数据加载失败")).finally(() => setLoading(false));
  }, [params.bookId, loadDetail]);

  useEffect(() => () => { if (progressTimer.current) clearTimeout(progressTimer.current); }, []);

  const save = (target: number) => {
    const next = Math.max(0, Math.min(words.length - 1, target));
    setDirection(next >= index ? "next" : "prev");
    setIndex(next);
    void loadDetail(words[next].id);
    if (words[next + 1]) void loadDetail(words[next + 1].id);
    const user = JSON.parse(localStorage.getItem("danci-user") || "null");
    if (progressTimer.current) clearTimeout(progressTimer.current);
    progressTimer.current = setTimeout(() => { void fetch("/api/progress", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: user?.id, bookId: book?.id, currentWordRank: next + 1 }) }); }, 180);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "ArrowRight") save(index + 1); if (event.key === "ArrowLeft") save(index - 1); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  if (auth === false) return <main className="empty-state"><LockKeyhole size={24} /><h2>登录后开始学习</h2><p>登录后可以保存你的学习进度。</p><Link href="/login" className="primary-button compact">去登录 <ArrowRight size={16} /></Link></main>;
  if (loading) return <main className="learn-page route-loading learn-loading"><div className="loading-line" /><div className="loading-card" /><div className="loading-line loading-line-wide" /></main>;
  if (error) return <main className="empty-state"><p className="form-error">{error}</p><button className="secondary-button" onClick={() => router.back()}>返回</button></main>;
  if (!book || !words.length) return <main className="empty-state"><h2>这本书还没有单词</h2><p>换一本单词书开始学习吧。</p><Link href="/" className="secondary-button">回到书架</Link></main>;

  const word = words[index];
  const content = details[word.id] ?? word.content ?? {};
  const detail = content?.word?.content ?? content;
  const meaning = detail?.trans?.[0]?.tranCn || "暂无释义";
  const percent = Math.round(((index + 1) / words.length) * 100);

  return (
    <div className="learn-page">
      <header className="learn-header">
        <button onClick={() => { save(index); router.back(); }} aria-label="返回"><ArrowLeft size={19} /></button>
        <div><p>{book.title}</p><span>{index + 1} / {words.length}</span></div>
        <button aria-label="收藏当前单词"><Bookmark size={19} /></button>
      </header>
      <div className="learn-progress" aria-label={`学习进度 ${percent}%`}><i style={{ width: `${percent}%` }} /></div>
      <main className="word-stage">
        <div key={word.id} className={`word-card swipe-${direction}`} onTouchStart={(event) => { event.currentTarget.dataset.x = String(event.touches[0].clientX); }} onTouchEnd={(event) => { const delta = event.changedTouches[0].clientX - Number(event.currentTarget.dataset.x || 0); if (Math.abs(delta) > 50) save(index + (delta < 0 ? 1 : -1)); }}>
          <div className="card-hint"><span>左右滑动切换</span><span>{percent}%</span></div>
          <p className="eyebrow">WORD {String(word.wordRank || index + 1).padStart(2, "0")}</p>
          <h1>{word.headWord}</h1>
          <p className="phonetic">英 / {detail?.ukphone || "暂无"} · 美 / {detail?.usphone || "暂无"}</p>
          <p className="meaning">{meaning}</p>
          <Link href={`/word/${word.id}`} className="detail-link">查看完整释义 <ArrowRight size={14} /></Link>
        </div>
      </main>
      <footer className="learn-footer"><button className="secondary-button" disabled={index === 0} onClick={() => save(index - 1)}><ArrowLeft size={16} />上一个</button><button className="primary-button" disabled={index === words.length - 1} onClick={() => save(index + 1)}>{index === words.length - 1 ? "已完成" : "下一个"}<ArrowRight size={16} /></button></footer>
      <p className="learn-shortcut"><RotateCcw size={12} /> 使用键盘 ← → 也可以切换</p>
    </div>
  );
}
