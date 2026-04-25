import { createClient } from "@supabase/supabase-js";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
if (!url || !key) console.warn("Supabase environment variables not set");
export const supabase = createClient(url, key);
export async function getUser() { const { data: { user } } = await supabase.auth.getUser(); return user; }
export async function signOut() { await supabase.auth.signOut(); }
export async function getPackages(userId: string) { const { data, error } = await supabase.from("packages").select("*").eq("user_id",userId); if (error) throw error; return data; }
