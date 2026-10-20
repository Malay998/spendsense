"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function addTransaction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const amount = Number(formData.get("amount"));
  const title = String(formData.get("title") || "").trim();
  const category = String(formData.get("category") || "Other");
  const type = String(formData.get("type") || "expense");
  const date = String(formData.get("date") || new Date().toISOString().slice(0,10));
  if (!title || !Number.isFinite(amount) || amount <= 0 || !["income","expense"].includes(type)) {
    throw new Error("Enter a description and a positive amount.");
  }
  const { error } = await supabase.from("transactions").insert({
    user_id: user.id, title, amount, category, type, transaction_date: date, currency: "INR"
  });
  if (error) throw new Error(error.message);
  await supabase.from("activity_events").insert({ user_id: user.id, event_type: "transaction_created", metadata: { type, category } });
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  redirect("/transactions?saved=1");
}

export async function deleteTransaction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id") || "");
  const { error } = await supabase.from("transactions").delete().eq("id", id).eq("user_id", user.id);
  if (error) throw new Error(error.message);
  await supabase.from("activity_events").insert({ user_id: user.id, event_type: "transaction_deleted", metadata: {} });
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
}

export async function saveProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const displayName = String(formData.get("display_name") || "").trim().slice(0,80);
  const monthlyIncome = Number(formData.get("monthly_income") || 0);
  const currency = String(formData.get("currency") || "INR");
  const { error } = await supabase.from("profiles").upsert({
    id: user.id, display_name: displayName || null,
    monthly_income: Number.isFinite(monthlyIncome) && monthlyIncome >= 0 ? monthlyIncome : 0,
    currency, updated_at: new Date().toISOString()
  });
  if (error) throw new Error(error.message);
  revalidatePath("/settings"); revalidatePath("/dashboard");
  redirect("/settings?saved=1");
}
