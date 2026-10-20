import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/server";
import { ReportTools } from "@/components/report-tools";
import { FileDown } from "lucide-react";
export default async function ReportsPage(){
 const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect("/login");
 const [{data:transactions},{data:subscriptions},{data:profile}]=await Promise.all([
  supabase.from("transactions").select("id,title,amount,type,category,transaction_date,currency,created_at,note,rating").eq("user_id",user.id).order("transaction_date",{ascending:false}).limit(5000),
  supabase.from("subscriptions").select("name,amount,billing_cycle,next_renewal,category,active").eq("user_id",user.id).order("next_renewal",{ascending:true,nullsFirst:false}),
  supabase.from("profiles").select("display_name,currency").eq("id",user.id).maybeSingle()
 ]);
 return <AppShell active="/reports"><div className="topbar"><div><div className="eyebrow">YOUR MONEY, CLEARLY EXPLAINED</div><h1 className="page-title">Reports & exports<span style={{color:"var(--accent)"}}>.</span></h1><p className="muted" style={{fontSize:13,marginTop:9}}>Choose a period, understand the picture, and take your records with you.</p></div><span className="metric-icon" style={{width:46,height:46}}><FileDown size={20}/></span></div><ReportTools transactions={(transactions??[]).map(t=>({...t,amount:Number(t.amount)}))} subscriptions={(subscriptions??[]).map(s=>({...s,amount:Number(s.amount)}))} displayName={profile?.display_name||user.email||"SpendSense user"}/></AppShell>
}
