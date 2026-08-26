"use client";

import { useEffect, useMemo, useState } from "react";
import { MoreHorizontal, Plus, Search, Shield, UserCog, UserX } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type AdminUser = { id: number; name: string; email: string; role: string; status: string; lastActive: string | null };

export default function AdminUsersPage() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const filtered = useMemo(() => admins.filter((admin) => `${admin.name}${admin.email}`.toLowerCase().includes(query.toLowerCase())), [admins, query]);

  useEffect(() => {
    fetch("/api/admin-users")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "加载管理员失败");
        setAdmins(result.admins);
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "加载管理员失败"))
      .finally(() => setLoading(false));
  }, []);

  async function createAdmin(formData: FormData) {
    setError("");
    const response = await fetch("/api/admin-users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData)),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? "添加管理员失败");
      return;
    }
    setAdmins((current) => [...current, result.admin]);
    setOpen(false);
  }

  async function toggleAdmin(admin: AdminUser) {
    setError("");
    const nextStatus = admin.status === "正常" ? "停用" : "正常";
    const response = await fetch(`/api/admin-users/${admin.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? "更新管理员状态失败");
      return;
    }
    setAdmins((current) => current.map((item) => item.id === admin.id ? { ...item, status: nextStatus } : item));
  }

  return (
    <div>
      <PageHeading
        title="管理员管理"
        description="管理后台成员及其内容操作权限。"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button />}><Plus className="size-4" />添加管理员</DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>添加管理员</DialogTitle><DialogDescription>新增管理员将在首次登录后激活账号。</DialogDescription></DialogHeader>
              <form action={createAdmin} className="space-y-4">
                <div className="space-y-2"><Label htmlFor="admin-name">姓名</Label><Input id="admin-name" name="name" required /></div>
                <div className="space-y-2"><Label htmlFor="admin-email">邮箱</Label><Input id="admin-email" name="email" type="email" required /></div>
                <div className="space-y-2"><Label htmlFor="admin-password">初始密码</Label><Input id="admin-password" name="password" type="password" minLength={8} required /></div>
                <div className="space-y-2">
                  <Label htmlFor="admin-role">角色</Label>
                  <Select name="role" defaultValue="内容管理员"><SelectTrigger id="admin-role"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="超级管理员">超级管理员</SelectItem><SelectItem value="内容管理员">内容管理员</SelectItem></SelectContent></Select>
                </div>
                <DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>取消</Button><Button type="submit">添加成员</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mt-6 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索姓名或邮箱" className="pl-9" aria-label="搜索管理员" />
        </div>
        <p className="hidden text-xs text-muted-foreground sm:block">{filtered.length} 位管理员</p>
      </div>

      {error && <p className="mt-3 text-sm text-destructive" role="alert">{error}</p>}

      <div className="mt-4 overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader><TableRow><TableHead className="w-[38%]">管理员</TableHead><TableHead>角色</TableHead><TableHead>账号状态</TableHead><TableHead>最近活动</TableHead><TableHead className="w-12"><span className="sr-only">操作</span></TableHead></TableRow></TableHeader>
          <TableBody>
            {!loading && filtered.map((admin) => (
              <TableRow key={admin.id}>
                <TableCell>
                  <div className="flex items-center gap-3"><Avatar className="size-9"><AvatarFallback className="bg-muted text-xs font-medium">{admin.name.slice(0, 1)}</AvatarFallback></Avatar><div className="min-w-0"><p className="font-medium">{admin.name}</p><p className="mt-0.5 truncate text-xs text-muted-foreground">{admin.email}</p></div></div>
                </TableCell>
                <TableCell><span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground"><Shield className="size-3.5" />{admin.role}</span></TableCell>
                <TableCell><Badge variant="outline" className={admin.status === "正常" ? "bg-emerald-50 font-normal text-emerald-700 ring-1 ring-emerald-600/15" : "bg-zinc-100 font-normal text-zinc-600"}>{admin.status}</Badge></TableCell>
                <TableCell className="text-muted-foreground">{formatLastActive(admin.lastActive)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label={`管理 ${admin.name}`} />}><MoreHorizontal className="size-4" /></DropdownMenuTrigger>
                    <DropdownMenuContent align="end"><DropdownMenuItem><UserCog className="size-4" />编辑权限</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem variant="destructive" onClick={() => toggleAdmin(admin)}><UserX className="size-4" />{admin.status === "正常" ? "停用账号" : "恢复账号"}</DropdownMenuItem></DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {loading && <TableRow><TableCell colSpan={5} className="h-32 text-center text-muted-foreground">正在加载管理员...</TableCell></TableRow>}
            {!loading && filtered.length === 0 && <TableRow><TableCell colSpan={5} className="h-32 text-center text-muted-foreground">没有找到符合条件的管理员</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function formatLastActive(value: string | null) {
  if (!value) return "尚未登录";
  return new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}
