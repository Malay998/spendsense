import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/sidebar";

export async function AppShell({ active, children }: { active: string; children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return <div className="shell"><Sidebar active={active} email={user.email ?? "Your account"}/><main className="main">{children}</main></div>;
}
