import Link from "next/link";
import { ArrowDownLeft, ArrowRight, ArrowUpRight, CalendarDays, CircleDollarSign, Plus, Sparkles, Wallet } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/server";
import { money, monthLabel } from "@/lib/money";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const start = new Date(); start.setDate(1);
  const { data: txs } = await supabase.from("transactions").select("*").gte("transaction_date", start.toISOString().slice(0,10)).order("transaction_date", {ascending:false}).limit(8);
  const { data: profile } = await supabase.from("profiles").select("display_name,monthly_income,currency").eq("id",user.id).maybeSingle();
  const rows = txs ?? [];
  const income = rows.filter(t=>t.type==="income").reduce((s,t)=>s+Number(t.amount),0);
  const expenses = rows.filter(t=>t.type==="expense").reduce((s,t)=>s+Number(t.amount),0);
  const plannedIncome = Number(profile?.monthly_income ?? 0);
  return <AppShell active="/dashboard">
    <div className="topbar"><div><div className="eyebrow">{monthLabel()} · YOUR OVERVIEW</div><h1 className="page-title">Good to see you{profile?.display_name ? `, ${profile.display_name}` : ""}.</h1><p className="muted" style={{fontSize:13,marginTop:9}}>Small steps. Clearer choices. Your money at a glance.</p></div><Link href="/transactions?new=1" className="btn btn-primary"><Plus size={15}/> Add transaction</Link></div>
    <div className="grid-4">
      <div className="panel metric"><div style={{display:"flex",justifyContent:"space-between"}}><span className="metric-label">Income recorded</span><span className="metric-icon"><ArrowDownLeft size={16}/></span></div><div><div className="metric-value">{money(income)}</div><div className="small muted">This month · recorded only</div></div></div>
      <div className="panel metric"><div style={{display:"flex",justifyContent:"space-between"}}><span className="metric-label">Spending recorded</span><span className="metric-icon"><ArrowUpRight size={16}/></span></div><div><div className="metric-value">{money(expenses)}</div><div className="small muted">This month · recorded only</div></div></div>
      <div className="panel metric"><div style={{display:"flex",justifyContent:"space-between"}}><span className="metric-label">Net cash flow</span><span className="metric-icon"><CircleDollarSign size={16}/></span></div><div><div className={`metric-value ${income-expenses>=0?"positive":"negative"}`}>{money(income-expenses)}</div><div className="small muted">Income minus expenses entered</div></div></div>
      <div className="panel metric"><div style={{display:"flex",justifyContent:"space-between"}}><span className="metric-label">Monthly income plan</span><span className="metric-icon"><Wallet size={16}/></span></div><div><div className="metric-value">{money(plannedIncome)}</div><div className="small muted">Set this in Settings</div></div></div>
    </div>
    <div className="grid-2" style={{marginTop:16}}>
      <section className="panel"><div className="section-head"><div><div className="eyebrow">RECENT ACTIVITY</div><h2 className="section-title" style={{marginTop:7}}>Latest transactions</h2></div><Link href="/transactions" className="btn btn-quiet">View all <ArrowRight size={14}/></Link></div>
        {rows.length ? <div className="table-wrap"><table className="table"><thead><tr><th>Transaction</th><th>Date</th><th>Amount</th></tr></thead><tbody>{rows.slice(0,6).map(t=><tr key={t.id}><td><div style={{fontWeight:600}}>{t.title}</div><div className="small muted" style={{marginTop:4}}>{t.category}{t.rating ? ` · ${"★".repeat(t.rating)}` : ""}</div>{t.note ? <div className="small muted" style={{marginTop:3}}>{t.note}</div> : null}</td><td className="muted">{t.transaction_date}</td><td style={{fontWeight:600,whiteSpace:"nowrap"}} className={t.type==="income"?"positive":"negative"}>{t.type==="income"?"+":"−"}{money(Number(t.amount))}</td></tr>)}</tbody></table></div> : <div className="empty"><div className="metric-icon" style={{margin:"0 auto 14px"}}><CalendarDays size={17}/></div><div style={{color:"#e6e9ea",fontWeight:600,marginBottom:7}}>Your story starts here.</div>Add your first transaction to make this dashboard yours.<div style={{marginTop:16}}><Link href="/transactions?new=1" className="btn btn-primary">Add first transaction <ArrowRight size={14}/></Link></div></div>}
      </section>
      <section className="panel"><div className="eyebrow">YOUR NEXT MOVE</div><h2 className="section-title" style={{marginTop:8}}>Build your money picture.</h2><p className="muted" style={{fontSize:13,lineHeight:1.8}}>SpendSense only calculates from the data you enter. Add your regular income and expenses to get a more useful view of your month.</p>
        <div style={{display:"grid",gap:10,marginTop:22}}><Link href="/transactions?new=1" className="panel-soft" style={{display:"flex",alignItems:"center",gap:12}}><span className="metric-icon"><Plus size={16}/></span><span style={{flex:1}}><b style={{fontSize:13}}>Record a transaction</b><div className="small muted" style={{marginTop:4}}>Capture money in or out</div></span><ArrowRight size={15}/></Link><Link href="/settings" className="panel-soft" style={{display:"flex",alignItems:"center",gap:12}}><span className="metric-icon"><Wallet size={16}/></span><span style={{flex:1}}><b style={{fontSize:13}}>Set your monthly income</b><div className="small muted" style={{marginTop:4}}>Give your budget a starting point</div></span><ArrowRight size={15}/></Link><Link href="/budgets" className="panel-soft" style={{display:"flex",alignItems:"center",gap:12}}><span className="metric-icon"><Sparkles size={16}/></span><span style={{flex:1}}><b style={{fontSize:13}}>Create a budget</b><div className="small muted" style={{marginTop:4}}>Give your money a plan</div></span><ArrowRight size={15}/></Link></div>
      </section>
    </div>
    <p className="small muted" style={{marginTop:20}}>Numbers are calculated from transactions you have entered. No bank account is connected.</p>
  </AppShell>;
}
