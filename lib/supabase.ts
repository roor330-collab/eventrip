import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase environment variables not set. Some features may not work."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function getPackages(userId: string) {
  const { data, error } = await supabase
    .from("packages")
    .select("*")
    .eq("user_id", userId);

  if (error) throw error;
  return data;
}

export async function getPackageById(packageId: string) {
  const { data, error } = await supabase
    .from("packages")
    .select("*")
    .eq("id", packageId)
    .single();

  if (error) throw error;
  return data;
}

export async function createPackage(packageData: any) {
  const { data, error } = await supabase
    .from("packages")
    .insert([packageData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePackage(packageId: string, updates: any) {
  const { data, error } = await supabase
    .from("packages")
    .update(updates)
    .eq("id", packageId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePackage(packageId: string) {
  const { error } = await supabase
    .from("packages")
    .delete()
    .eq("id", packageId);

  if (error) throw error;
}
