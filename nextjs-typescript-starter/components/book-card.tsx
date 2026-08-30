"use client";

import Link from "next/link";
import { ArrowRight, LockKeyhole, X } from "lucide-react";
import { useState } from "react";
import type { Book } from "@/lib/mock-data";
import { Cover } from "./h5-shell";

export function BookCard({ book, progress = 0 }: { book: Book; progress?: number }) {
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const percent = book.wordCount ? Math.min(100, Math.round((progress / book.wordCount) * 100)) : 0;

  function openBook(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!window.localStorage.getItem("danci-user")) {
      event.preventDefault();
      setShowAuthPrompt(true);
    }
  }

  return (
    <>
      <Link href={`/learn/${book.bookId}`} onClick={openBook} className="book-card" aria-label={`学习${book.title}`}>
        <Cover src={book.coverUrl} alt={`${book.title}封面`} />
        <div className="book-card-body">
          <div className="eyebrow">{book.tags?.split(",")[0] || "词汇"}</div>
          <h3>{book.title}</h3>
          <p>{book.wordCount.toLocaleString()} 词 <span aria-hidden="true">·</span> {progress ? `已学 ${progress}` : "尚未开始"}</p>
          <div className="book-progress" aria-label={`学习进度 ${percent}%`}><i style={{ width: `${percent}%` }} /></div>
        </div>
        <ArrowRight className="book-arrow" size={18} aria-hidden="true" />
      </Link>
      {showAuthPrompt && (
        <div className="auth-overlay" role="dialog" aria-modal="true" aria-labelledby={`auth-title-${book.id}`} onClick={() => setShowAuthPrompt(false)}>
          <div className="auth-prompt" onClick={(event) => event.stopPropagation()}>
            <button className="prompt-close" aria-label="关闭" onClick={() => setShowAuthPrompt(false)}><X size={17} /></button>
            <div className="prompt-icon"><LockKeyhole size={19} /></div>
            <p className="eyebrow">KEEP YOUR PLACE</p>
            <h2 id={`auth-title-${book.id}`}>登录后开始学习</h2>
            <p>登录后可以保存学习进度，下一次打开继续学习。</p>
            <Link href="/login" className="primary-button compact" onClick={() => setShowAuthPrompt(false)}>去登录 <ArrowRight size={16} /></Link>
          </div>
        </div>
      )}
    </>
  );
}
