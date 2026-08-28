import { NextResponse } from "next/server";
import { createUser, getUser } from "@/app/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "请输入有效邮箱" }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ error: "密码至少需要 6 位" }, { status: 400 });
    if ((await getUser(email)).length > 0) return NextResponse.json({ error: "该邮箱已注册，请直接登录" }, { status: 409 });
    const [user] = await createUser(email, password);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Failed to register user", error);
    return NextResponse.json({ error: "注册失败，请稍后重试" }, { status: 500 });
  }
}
