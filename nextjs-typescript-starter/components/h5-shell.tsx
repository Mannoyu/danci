"use client";

import Link from "next/link";
import { BookOpen, UserRound } from "lucide-react";
import { usePathname } from "next/navigation";

export function H5Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="app-frame">
      <main className="app-content">{children}</main>
      <nav className="tab-bar" aria-label="主导航">
        <Link href="/" className={pathname === "/" ? "tab active" : "tab"}>
          <BookOpen size={19} strokeWidth={1.8} aria-hidden="true" />
          <span>书架</span>
        </Link>
        <Link href="/profile" className={pathname.startsWith("/profile") ? "tab active" : "tab"}>
          <UserRound size={19} strokeWidth={1.8} aria-hidden="true" />
          <span>我的</span>
        </Link>
      </nav>
    </div>
  );
}

export function Cover({ src, alt, className = "" }: { src?: string | null; alt: string; className?: string }) {
  if (!src) {
    return <div className={`book-cover book-cover-placeholder ${className}`} aria-label={alt}><span>LN</span></div>;
  }
  return <img src={src} alt={alt} width={58} height={70} loading="lazy" decoding="async" className={`book-cover ${className}`} />;
}
