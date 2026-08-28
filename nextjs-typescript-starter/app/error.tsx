"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="empty-state"><h2>页面暂时无法加载</h2><p>请稍后重试，如果问题持续存在请刷新页面。</p><button className="primary-button compact" onClick={() => reset()}>重新加载</button></main>;
}
