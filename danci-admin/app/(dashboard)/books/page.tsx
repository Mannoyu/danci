"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { BookOpen, MoreHorizontal, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Book = {
  id: string;
  title: string;
  wordCount: number;
  coverUrl: string | null;
  bookId: string | null;
  tags: string | null;
  createdAt: string;
  updatedAt: string;
};

type BookPayload = { title: string; wordCount: number; coverUrl: string; bookId: string; tags: string };

export default function BooksPage() {
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/books")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "加载单词书失败");
        setBooks(result.books);
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "加载单词书失败"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => books.filter((book) => {
      const matchesQuery = book.title.toLowerCase().includes(query.toLowerCase()) || book.id.toLowerCase().includes(query.toLowerCase());
      return matchesQuery;
    }),
    [books, query],
  );

  function toPayload(formData: FormData): BookPayload {
    return {
      title: String(formData.get("title")),
      wordCount: Number(formData.get("wordCount")),
      coverUrl: String(formData.get("coverUrl")),
      bookId: String(formData.get("bookId")),
      tags: String(formData.get("tags")),
    };
  }

  async function saveBook(formData: FormData, id?: string) {
    setError("");
    const response = await fetch(id ? `/api/books/${encodeURIComponent(id)}` : "/api/books", {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toPayload(formData)),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? "保存单词书失败");
      return;
    }
    if (id) {
      setBooks((current) => current.map((book) => (book.id === id ? result.book : book)));
      setEditing(null);
    } else {
      setBooks((current) => [result.book, ...current]);
      setCreateOpen(false);
    }
  }

  async function deleteBook(book: Book) {
    setError("");
    const response = await fetch(`/api/books/${encodeURIComponent(book.id)}`, { method: "DELETE" });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? "删除单词书失败");
      return;
    }
    setBooks((current) => current.filter((item) => item.id !== book.id));
  }

  return (
    <div>
      <PageHeading
        title="单词书管理"
        description="维护单词书的封面、标题、词汇数量、bookId 与标签。"
        actions={
          <BookFormDialog
            open={createOpen}
            onOpenChange={setCreateOpen}
            initial={null}
            onSubmit={(formData) => saveBook(formData)}
            trigger={<DialogTrigger render={<Button />}><Plus className="size-4" />新增单词书</DialogTrigger>}
          />
        }
      />

      <div className="mt-6 flex items-center justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索名称或编号" className="pl-9" aria-label="搜索单词书" />
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-destructive" role="alert">{error}</p>}

      <div className="mt-4 overflow-hidden rounded-lg border bg-card">
        <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2.5">
          <p className="text-xs text-muted-foreground">共 {filtered.length} 本单词书</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[38%]">单词书</TableHead>
              <TableHead className="text-right">单词数量</TableHead>
              <TableHead>bookId</TableHead>
              <TableHead>最近更新</TableHead>
              <TableHead className="w-12"><span className="sr-only">操作</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!loading && filtered.map((book) => (
              <TableRow key={book.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span
                      className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-md bg-primary/8 text-primary"
                      style={book.coverUrl ? { backgroundImage: `url("${book.coverUrl}")`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
                    >
                      {!book.coverUrl && <BookOpen className="size-4" />}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{book.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{book.id}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono text-sm">{book.wordCount.toLocaleString("zh-CN")}</TableCell>
                <TableCell className="text-muted-foreground">{book.bookId}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(book.updatedAt)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label={`管理 ${book.title}`} />}><MoreHorizontal className="size-4" /></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditing(book)}><Pencil className="size-4" />编辑</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onClick={() => deleteBook(book)}><Trash2 className="size-4" />删除</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {loading && <TableRow><TableCell colSpan={5} className="h-32 text-center text-muted-foreground">正在加载单词书...</TableCell></TableRow>}
            {!loading && filtered.length === 0 && (
              <TableRow><TableCell colSpan={5} className="h-32 text-center text-muted-foreground">没有找到符合条件的单词书</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <BookFormDialog
        key={editing?.id ?? "new"}
        open={editing !== null}
        onOpenChange={(open) => { if (!open) setEditing(null); }}
        initial={editing}
        onSubmit={(formData) => saveBook(formData, editing?.id)}
      />
    </div>
  );
}

function BookFormDialog({ open, onOpenChange, initial, onSubmit, trigger }: { open: boolean; onOpenChange: (open: boolean) => void; initial: Book | null; onSubmit: (formData: FormData) => void | Promise<void>; trigger?: ReactNode }) {
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  async function handleSubmit(formData: FormData) {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "编辑单词书" : "新增单词书"}</DialogTitle>
          <DialogDescription>{initial ? "修改单词书的基本信息。" : "填写单词书的基本信息，bookId 用于关联词汇表。"}</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="book-title">标题</Label>
            <Input id="book-title" name="title" placeholder="例如：雅思核心词汇" defaultValue={initial?.title ?? ""} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="book-word-count">单词数量</Label>
            <Input id="book-word-count" name="wordCount" type="number" min={0} placeholder="例如：1248" defaultValue={initial?.wordCount ?? 0} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="book-cover-url">封面 URL</Label>
            <Input id="book-cover-url" name="coverUrl" type="url" placeholder="https://example.com/cover.png" defaultValue={initial?.coverUrl ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="book-book-id">bookId</Label>
            <Input id="book-book-id" name="bookId" placeholder="用于关联词汇表，例如：PEPXiaoXue3_1" defaultValue={initial?.bookId ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="book-tags">标签</Label>
            <Input id="book-tags" name="tags" placeholder="多个用逗号分隔，例如：小学, 人教版, 英语" defaultValue={initial?.tags ?? ""} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>取消</Button>
            <Button type="submit" disabled={submitting}>{submitting ? "保存中..." : initial ? "保存修改" : "创建单词书"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("zh-CN", { dateStyle: "medium", timeStyle: "short" });
}
