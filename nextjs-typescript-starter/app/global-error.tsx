"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="zh-CN"><body><main className="empty-state"><h2>页面暂时无法加载</h2><p>请刷新页面后重试。</p><button className="primary-button compact" onClick={() => reset()}>重新加载</button></main></body></html>;
}
