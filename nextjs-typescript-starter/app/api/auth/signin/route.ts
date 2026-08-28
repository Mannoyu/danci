import { NextResponse } from "next/server";
import { compare } from "bcrypt-ts";
import { getUser } from "@/app/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const [user] = await getUser(email);
    if (!user || !(await compare(password, user.password))) return NextResponse.json({ error: "邮箱或密码不正确" }, { status: 401 });
    return NextResponse.json({ user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error("Failed to sign in user", error);
    return NextResponse.json({ error: "登录失败，请稍后重试" }, { status: 500 });
  }
}
