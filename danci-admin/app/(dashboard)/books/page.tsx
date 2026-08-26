"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, MoreHorizontal, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Book = { id: string; title: string; words: number; category: string; status: string; updatedAt: string };

export default function BooksPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [open, setOpen] = useState(false);
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
      return matchesQuery && (status === "all" || book.status === status);
    }),
    [books, query, status],
  );

  async function createBook(formData: FormData) {
    const title = String(formData.get("title"));
    const category = String(formData.get("category"));
    setError("");
    const response = await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, category }),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? "创建单词书失败");
      return;
    }
    setBooks((current) => [result.book, ...current]);
    setOpen(false);
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
        description="维护学习内容、词汇数量和发布状态。"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button />}>
              <Plus className="size-4" />新建单词书
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新建单词书</DialogTitle>
                <DialogDescription>创建后将保存为草稿，可继续补充词汇内容。</DialogDescription>
              </DialogHeader>
              <form action={createBook} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="book-title">名称</Label>
                  <Input id="book-title" name="title" placeholder="例如：雅思核心词汇" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="book-category">分类</Label>
                  <Input id="book-category" name="category" placeholder="例如：考试" required />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>取消</Button>
                  <Button type="submit">创建草稿</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索名称或编号" className="pl-9" aria-label="搜索单词书" />
        </div>
        <Select value={status} onValueChange={(value) => value && setStatus(value)}>
          <SelectTrigger className="w-full sm:w-36" aria-label="筛选发布状态"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="已发布">已发布</SelectItem>
            <SelectItem value="草稿">草稿</SelectItem>
            <SelectItem value="已停用">已停用</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && <p className="mt-3 text-sm text-destructive" role="alert">{error}</p>}

      <div className="mt-4 overflow-hidden rounded-lg border bg-card">
        <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2.5">
          <p className="text-xs text-muted-foreground">共 {filtered.length} 本单词书</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[42%]">单词书</TableHead>
              <TableHead>分类</TableHead>
              <TableHead className="text-right">词汇数</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>最近更新</TableHead>
              <TableHead className="w-12"><span className="sr-only">操作</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!loading && filtered.map((book) => (
              <TableRow key={book.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary/8 text-primary"><BookOpen className="size-4" /></span>
                    <div className="min-w-0"><p className="truncate font-medium">{book.title}</p><p className="mt-0.5 text-xs text-muted-foreground">{book.id}</p></div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{book.category}</TableCell>
                <TableCell className="text-right font-mono text-sm">{book.words.toLocaleString("zh-CN")}</TableCell>
                <TableCell><StatusBadge value={book.status} /></TableCell>
                <TableCell className="text-muted-foreground">{book.updatedAt}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label={`管理 ${book.title}`} />}><MoreHorizontal className="size-4" /></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem><Pencil className="size-4" />编辑内容</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onClick={() => deleteBook(book)}><Trash2 className="size-4" />删除</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {loading && <TableRow><TableCell colSpan={6} className="h-32 text-center text-muted-foreground">正在加载单词书...</TableCell></TableRow>}
            {!loading && filtered.length === 0 && (
              <TableRow><TableCell colSpan={6} className="h-32 text-center text-muted-foreground">没有找到符合条件的单词书</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function StatusBadge({ value }: { value: string }) {
  const style = value === "已发布" ? "bg-emerald-50 text-emerald-700 ring-emerald-600/15" : value === "草稿" ? "bg-amber-50 text-amber-700 ring-amber-600/15" : "bg-zinc-100 text-zinc-600 ring-zinc-500/15";
  return <Badge variant="outline" className={`font-normal ring-1 ring-inset ${style}`}>{value}</Badge>;
}
