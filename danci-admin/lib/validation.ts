import { z } from "zod";

export const signInSchema = z.object({
  email: z.email("请输入有效的邮箱地址").transform((value) => value.trim().toLowerCase()),
  password: z.string().min(8, "密码至少需要 8 个字符"),
});

export const publicSignUpSchema = signInSchema.extend({
  name: z.string().trim().min(2, "姓名至少需要 2 个字符").max(30, "姓名不能超过 30 个字符"),
});

export const bookSchema = z.object({
  title: z.string().trim().min(2, "名称至少需要 2 个字符").max(80),
  category: z.string().trim().min(1, "请输入分类").max(30),
});

export const adminSchema = z.object({
  name: z.string().trim().min(2, "姓名至少需要 2 个字符").max(30, "姓名不能超过 30 个字符"),
  email: z.email("请输入有效的邮箱地址").transform((value) => value.trim().toLowerCase()),
  password: z.string().min(8, "密码至少需要 8 个字符"),
  role: z.enum(["超级管理员", "内容管理员"]),
});
