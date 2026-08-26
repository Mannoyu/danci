import { BrandMark } from "@/components/brand-mark";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#f5f5f3] px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <section className="w-full max-w-[420px]" aria-label="管理员认证">
        <div className="mb-8 flex justify-center">
          <BrandMark />
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.35)] sm:p-8">
          {children}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          仅限已授权的系统管理员访问
        </p>
      </section>
    </main>
  );
}
