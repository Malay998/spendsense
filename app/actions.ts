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
  const note = String(formData.get("note") || "").trim().slice(0,500);
  const ratingRaw = String(formData.get("rating") || "");
  const rating = ratingRaw ? Number(ratingRaw) : null;
  if (!title || !Number.isFinite(amount) || amount <= 0 || !["income","expense"].includes(type)) {
    throw new Error("Enter a description and a positive amount.");
  }
  if (rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 5)) throw new Error("Choose a rating from 1 to 5.");
  const { error } = await supabase.from("transactions").insert({
    user_id: user.id, title, amount, category, type, transaction_date: date, currency: "INR", note: note || null, rating
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


export async function addBudget(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const category = String(formData.get("category") || "").trim().slice(0, 60);
  const monthlyLimit = Number(formData.get("monthly_limit"));
  const monthValue = String(formData.get("month_start") || new Date().toISOString().slice(0, 7));
  const monthStart = /^\d{4}-\d{2}$/.test(monthValue) ? `${monthValue}-01` : "";
  if (!category || !Number.isFinite(monthlyLimit) || monthlyLimit <= 0 || !monthStart) {
    throw new Error("Enter a category, a positive monthly limit, and a valid month.");
  }
  const { error } = await supabase.from("budgets").upsert({
    user_id: user.id, category, monthly_limit: monthlyLimit, currency: "INR", month_start: monthStart
  }, { onConflict: "user_id,category,month_start" });
  if (error) throw new Error(error.message);
  await supabase.from("activity_events").insert({ user_id: user.id, event_type: "budget_saved", metadata: { category } });
  revalidatePath("/budgets"); revalidatePath("/dashboard");
  redirect("/budgets?saved=1");
}

export async function deleteBudget(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id") || "");
  const { error } = await supabase.from("budgets").delete().eq("id", id).eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/budgets");
}

export async function addSubscription(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const name = String(formData.get("name") || "").trim().slice(0, 100);
  const amount = Number(formData.get("amount"));
  const cycle = String(formData.get("billing_cycle") || "monthly");
  const category = String(formData.get("category") || "Other").trim().slice(0, 60);
  const renewalValue = String(formData.get("next_renewal") || "");
  const nextRenewal = /^\d{4}-\d{2}-\d{2}$/.test(renewalValue) ? renewalValue : null;
  if (!name || !Number.isFinite(amount) || amount < 0 || !["weekly", "monthly", "quarterly", "yearly"].includes(cycle)) {
    throw new Error("Enter a subscription name, a valid amount, and a billing cycle.");
  }
  const { error } = await supabase.from("subscriptions").insert({
    user_id: user.id, name, amount, currency: "INR", billing_cycle: cycle, next_renewal: nextRenewal, category, active: true
  });
  if (error) throw new Error(error.message);
  await supabase.from("activity_events").insert({ user_id: user.id, event_type: "subscription_created", metadata: { category, billing_cycle: cycle } });
  revalidatePath("/subscriptions"); revalidatePath("/dashboard");
  redirect("/subscriptions?saved=1");
}

export async function deleteSubscription(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id") || "");
  const { error } = await supabase.from("subscriptions").delete().eq("id", id).eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/subscriptions");
}
