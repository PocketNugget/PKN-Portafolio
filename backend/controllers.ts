import { signJWT, validateJWT, markdownToHtml } from "./deps.ts";
import { hash, compare } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const JWT_SECRET =
  Deno.env.get("JWT_SECRET") ||
  "thisisareallylongsecretkeythatisdefinitelymorethan32characterslongandshouldworkwiththejwtlibrary";

export async function createJWT(payload: Record<string, unknown>) {
  return await signJWT(payload, JWT_SECRET);
}

export async function verifyJWT(token: string) {
  try {
    return await validateJWT(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function renderMarkdown(md: string): Promise<string> {
  const { html } = await markdownToHtml(md, {});
  return html;
}

export async function hashPassword(password: string): Promise<string> {
  return await hash(password);
}

export async function verifyPassword(
  password: string,
  hashStr: string
): Promise<boolean> {
  return await compare(password, hashStr);
}
