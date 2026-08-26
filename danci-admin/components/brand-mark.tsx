import { BookOpenText } from "lucide-react";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground shadow-sm">
        <BookOpenText className="size-[18px]" aria-hidden="true" />
      </span>
      {!compact && (
        <div className="leading-tight">
          <p className="text-sm font-semibold text-foreground">词库管理台</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Lexicon Console</p>
        </div>
      )}
    </div>
  );
}
