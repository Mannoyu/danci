import { z } from "zod";

export const signInSchema = z.object({
  email: z.email("请输入有效的邮箱地址").transform((value) => value.trim().toLowerCase()),
  password: z.string().min(8, "密码至少需要 8 个字符"),
});

export const publicSignUpSchema = signInSchema.extend({
  name: z.string().trim().min(2, "姓名至少需要 2 个字符").max(30, "姓名不能超过 30 个字符"),
});

export const bookSchema = z.object({
  title: z.string().trim().min(2, "名称至少需要 2 个字符").max(80, "名称不能超过 80 个字符"),
  wordCount: z.coerce.number().int("单词数量必须是整数").nonnegative("单词数量不能为负数"),
  coverUrl: z.string().trim().url("请输入有效的封面 URL").optional().or(z.literal("")),
  bookId: z.string().trim().optional(),
  tags: z.string().trim().optional(),
});

export const adminSchema = z.object({
  name: z.string().trim().min(2, "姓名至少需要 2 个字符").max(30, "姓名不能超过 30 个字符"),
  email: z.email("请输入有效的邮箱地址").transform((value) => value.trim().toLowerCase()),
  password: z.string().min(8, "密码至少需要 8 个字符"),
  role: z.enum(["system_admin", "admin"]),
});

export const updateAdminSchema = z.object({
  name: z.string().trim().min(2, "姓名至少需要 2 个字符").max(30, "姓名不能超过 30 个字符"),
  email: z.email("请输入有效的邮箱地址").transform((value) => value.trim().toLowerCase()),
  role: z.enum(["system_admin", "admin"]),
  status: z.enum(["active", "disabled"]),
});
