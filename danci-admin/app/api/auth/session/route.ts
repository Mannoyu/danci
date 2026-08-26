import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  const user = await getSessionUser();
  return user
    ? NextResponse.json({ user })
    : NextResponse.json({ error: "未登录" }, { status: 401 });
}
