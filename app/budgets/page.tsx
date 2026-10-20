import { AppShell } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/server";
import { money } from "@/lib/money";
import { Target, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function BudgetsPage() {
  const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user)return null;
  const {data:txs}=await supabase.from("transactions").select("amount,category,type,transaction_date").eq("type","expense");
  const rows=txs??[]; const month=new Date().toISOString().slice(0,7);
  const current=rows.filter(t=>t.transaction_date.startsWith(month));
  const total=current.reduce((s,t)=>s+Number(t.amount),0);
  const categories=[...new Set(current.map(t=>t.category))].map(category=>({category,amount:current.filter(t=>t.category===category).reduce((s,t)=>s+Number(t.amount),0)})).sort((a,b)=>b.amount-a.amount);
  return <AppShell active="/budgets"><div className="topbar"><div><div className="eyebrow">SPEND WITH INTENTION</div><h1 className="page-title">Budgets</h1><p className="muted" style={{fontSize:13,marginTop:9}}>Start with awareness. Category limits are the next step.</p></div><Link className="btn" href="/transactions?new=1">Add spending <ArrowRight size={14}/></Link></div>
    <div className="grid-2"><section className="panel"><span className="metric-icon"><Target size={17}/></span><div className="eyebrow" style={{marginTop:20}}>SPENDING SO FAR THIS MONTH</div><div className="metric-value" style={{fontSize:42}}>{money(total)}</div><p className="muted" style={{fontSize:13,lineHeight:1.8}}>This is the sum of expense transactions you&apos;ve recorded. It is not a bank balance or a complete statement.</p><div className="pill">Budget limits: coming next</div></section>
    <section className="panel"><div className="section-head"><h2 className="section-title">By category</h2><span className="pill">{categories.length} categories</span></div>{categories.length?categories.map(c=><div key={c.category} style={{marginBottom:20}}><div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:9}}><span>{c.category}</span><b>{money(c.amount)}</b></div><div style={{height:6,background:"#262c30",borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(100,total?c.amount/total*100:0)}%`,background:"var(--lime)",borderRadius:99}}/></div></div>):<div className="empty">Record a few expenses and category patterns will appear here.</div>}</section></div>
  </AppShell>;
}
