"use client";

import { useEffect, useMemo, useState } from "react";
import { MoreHorizontal, Pencil, Plus, Search, Shield } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type AdminRole = "system_admin" | "admin";
type AdminStatus = "active" | "disabled";
type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  lastActive: string | null;
  createdAt: string;
};

export default function AdminUsersPage() {
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const filtered = useMemo(() => admins.filter((admin) => `${admin.name}${admin.email}`.toLowerCase().includes(query.toLowerCase())), [admins, query]);

  useEffect(() => {
    fetch("/api/admin-users")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "加载管理员失败");
        setAdmins(result.admins);
        setCurrentUserId(result.currentUserId);
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "加载管理员失败"))
      .finally(() => setLoading(false));
  }, []);

  async function createAdmin(formData: FormData) {
    setError("");
    setSubmitting(true);
    try {
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
      setCreateOpen(false);
    } catch {
      setError("无法连接到服务器，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  }

  async function updateAdmin(formData: FormData) {
    if (!editing) return;
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch(`/api/admin-users/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData)),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? "更新管理员失败");
        return;
      }
      setAdmins((current) => current.map((item) => item.id === result.admin.id ? result.admin : item));
      setEditOpen(false);
      setEditing(null);
    } catch {
      setError("无法连接到服务器，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  }

  function openEditor(admin: AdminUser) {
    setError("");
    setEditing(admin);
    setEditOpen(true);
  }

  return (
    <div>
      <PageHeading
        title="管理员管理"
        description="管理后台成员、系统权限和账号状态。"
        actions={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger render={<Button />}><Plus className="size-4" />添加管理员</DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>添加管理员</DialogTitle><DialogDescription>设置初始密码和权限类型，成员随后可使用邮箱登录。</DialogDescription></DialogHeader>
              <form action={createAdmin} className="space-y-4">
                <AdminIdentityFields />
                <div className="space-y-2"><Label htmlFor="admin-password">初始密码</Label><Input id="admin-password" name="password" type="password" minLength={8} autoComplete="new-password" required /></div>
                <RoleField id="admin-role" defaultValue="admin" />
                <DialogFooter><Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>取消</Button><Button type="submit" disabled={submitting}>{submitting ? "正在添加..." : "添加成员"}</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) setEditing(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>编辑管理员</DialogTitle><DialogDescription>修改成员资料、管理员类型和账号状态。</DialogDescription></DialogHeader>
          {editing && (
            <form action={updateAdmin} className="space-y-4">
              <AdminIdentityFields admin={editing} />
              <RoleField id="edit-admin-role" defaultValue={editing.role} disabled={editing.id === currentUserId} />
              <div className="space-y-2">
                <Label htmlFor="edit-admin-status">账号状态</Label>
                <Select name="status" defaultValue={editing.status} disabled={editing.id === currentUserId}>
                  <SelectTrigger id="edit-admin-status"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="active">正常</SelectItem><SelectItem value="disabled">停用</SelectItem></SelectContent>
                </Select>
                {editing.id === currentUserId && <input type="hidden" name="status" value="active" />}
              </div>
              <DialogFooter><Button type="button" variant="outline" onClick={() => setEditOpen(false)}>取消</Button><Button type="submit" disabled={submitting}>{submitting ? "正在保存..." : "保存修改"}</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <div className="mt-6 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索姓名或邮箱" className="pl-9" aria-label="搜索管理员" /></div>
        <p className="hidden text-xs text-muted-foreground sm:block">{filtered.length} 位管理员</p>
      </div>
      {error && <p className="mt-3 text-sm text-destructive" role="alert">{error}</p>}

      <div className="mt-4 overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader><TableRow><TableHead className="w-[38%]">管理员</TableHead><TableHead>类型</TableHead><TableHead>账号状态</TableHead><TableHead>最近活动</TableHead><TableHead className="w-12"><span className="sr-only">操作</span></TableHead></TableRow></TableHeader>
          <TableBody>
            {!loading && filtered.map((admin) => (
              <TableRow key={admin.id}>
                <TableCell><div className="flex items-center gap-3"><Avatar className="size-9"><AvatarFallback className="bg-muted text-xs font-medium">{admin.name.slice(0, 1)}</AvatarFallback></Avatar><div className="min-w-0"><p className="font-medium">{admin.name}{admin.id === currentUserId && <span className="ml-2 text-xs font-normal text-muted-foreground">当前账号</span>}</p><p className="mt-0.5 truncate text-xs text-muted-foreground">{admin.email}</p></div></div></TableCell>
                <TableCell><span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground"><Shield className="size-3.5" />{roleLabel(admin.role)}</span></TableCell>
                <TableCell><StatusBadge status={admin.status} /></TableCell>
                <TableCell className="text-muted-foreground">{formatLastActive(admin.lastActive)}</TableCell>
                <TableCell><DropdownMenu><DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label={`管理 ${admin.name}`} />}><MoreHorizontal className="size-4" /></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => openEditor(admin)}><Pencil className="size-4" />编辑管理员</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell>
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

function AdminIdentityFields({ admin }: { admin?: AdminUser }) {
  return (
    <>
      <div className="space-y-2"><Label htmlFor={admin ? "edit-admin-name" : "admin-name"}>姓名</Label><Input id={admin ? "edit-admin-name" : "admin-name"} name="name" defaultValue={admin?.name} required /></div>
      <div className="space-y-2"><Label htmlFor={admin ? "edit-admin-email" : "admin-email"}>邮箱</Label><Input id={admin ? "edit-admin-email" : "admin-email"} name="email" type="email" defaultValue={admin?.email} required /></div>
    </>
  );
}

function RoleField({ id, defaultValue, disabled = false }: { id: string; defaultValue: AdminRole; disabled?: boolean }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>管理员类型</Label>
      <Select name="role" defaultValue={defaultValue} disabled={disabled}><SelectTrigger id={id}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="admin">普通管理员</SelectItem><SelectItem value="system_admin">系统管理员</SelectItem></SelectContent></Select>
      {disabled && <input type="hidden" name="role" value={defaultValue} />}
    </div>
  );
}

function StatusBadge({ status }: { status: AdminStatus }) {
  return <Badge variant="outline" className={status === "active" ? "bg-emerald-50 font-normal text-emerald-700 ring-1 ring-emerald-600/15" : "bg-zinc-100 font-normal text-zinc-600"}>{status === "active" ? "正常" : "停用"}</Badge>;
}

function roleLabel(role: AdminRole) {
  return role === "system_admin" ? "系统管理员" : "普通管理员";
}

function formatLastActive(value: string | null) {
  if (!value) return "尚未登录";
  return new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}
