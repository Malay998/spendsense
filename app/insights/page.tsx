import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/server";
import { money } from "@/lib/money";
import { ArrowRight, Sparkles } from "lucide-react";

export default async function InsightsPage() {
  const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user)return null;
  const {data}=await supabase.from("transactions").select("amount,type,category,transaction_date");
  const rows=data??[]; const expenses=rows.filter(t=>t.type==="expense"); const income=rows.filter(t=>t.type==="income");
  const total=expenses.reduce((s,t)=>s+Number(t.amount),0); const totalIncome=income.reduce((s,t)=>s+Number(t.amount),0);
  const categoryTotals=[...new Set(expenses.map(t=>t.category))].map(category=>({category,total:expenses.filter(t=>t.category===category).reduce((s,t)=>s+Number(t.amount),0)})).sort((a,b)=>b.total-a.total);
  const top=categoryTotals[0];
  return <AppShell active="/insights"><div className="topbar"><div><div className="eyebrow">TURN DATA INTO DECISIONS</div><h1 className="page-title">Insights</h1><p className="muted" style={{fontSize:13,marginTop:9}}>Simple patterns from the records you&apos;ve entered.</p></div></div>
    <div className="grid-2"><section className="panel"><div className="eyebrow">RECORDED CASH FLOW</div><div className="metric-value">{money(totalIncome-total)}</div><p className="muted" style={{fontSize:13}}>Net income minus expenses across all recorded transactions.</p><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:20}}><div className="panel-soft"><div className="small muted">Income</div><div style={{fontSize:21,marginTop:8}}>{money(totalIncome)}</div></div><div className="panel-soft"><div className="small muted">Expenses</div><div style={{fontSize:21,marginTop:8}}>{money(total)}</div></div></div></section>
    <section className="panel"><span className="metric-icon"><Sparkles size={17}/></span><h2 className="section-title" style={{margin:"16px 0 9px"}}>A pattern to watch</h2>{top?<><p style={{fontSize:14,lineHeight:1.8}}>Your highest recorded expense category is <b>{top.category}</b>, at <b>{money(top.total)}</b> across the transactions entered.</p><p className="muted small">This describes your recorded data only. Missing transactions can change the picture.</p></>:<p className="muted" style={{fontSize:13,lineHeight:1.8}}>Add some transactions and we&apos;ll start showing patterns from your own records.</p>}<Link href="/transactions?new=1" className="btn" style={{marginTop:12}}>Add more data <ArrowRight size={14}/></Link></section></div>
    <section className="panel" style={{marginTop:16}}><div className="section-head"><h2 className="section-title">Category breakdown</h2><span className="pill">Recorded only</span></div>{categoryTotals.length?categoryTotals.map(c=><div key={c.category} style={{display:"flex",justifyContent:"space-between",padding:"14px 0",borderBottom:"1px solid var(--line)",fontSize:13}}><span>{c.category}</span><b>{money(c.total)}</b></div>):<div className="empty">No expense data yet.</div>}</section>
  </AppShell>;
}
