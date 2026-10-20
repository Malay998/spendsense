import Link from "next/link";
import { ArrowRight, Target, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/server";
import { money } from "@/lib/money";
import { addBudget, deleteBudget } from "@/app/actions";
import { redirect } from "next/navigation";

export default async function BudgetsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const today = new Date();
  const month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const monthStart = `${month}-01`;
  const { data: txs } = await supabase.from("transactions").select("amount,category,transaction_date").eq("user_id", user.id).eq("type", "expense").gte("transaction_date", monthStart);
  const { data: budgets } = await supabase.from("budgets").select("id,category,monthly_limit,month_start").eq("user_id", user.id).eq("month_start", monthStart).order("category");
  const rows = txs ?? [];
  const total = rows.reduce((sum, tx) => sum + Number(tx.amount), 0);
  const spendByCategory = new Map<string, number>();
  for (const tx of rows) spendByCategory.set(tx.category, (spendByCategory.get(tx.category) ?? 0) + Number(tx.amount));
  const categories = [...new Set([...spendByCategory.keys(), ...(budgets ?? []).map((b) => b.category)])].map((category) => ({
    category,
    amount: spendByCategory.get(category) ?? 0,
    limit: Number((budgets ?? []).find((b) => b.category === category)?.monthly_limit ?? 0),
  })).sort((a, b) => b.amount - a.amount);

  return <AppShell active="/budgets">
    <div className="topbar"><div><div className="eyebrow">SPEND WITH INTENTION</div><h1 className="page-title">Budgets</h1><p className="muted" style={{fontSize:13,marginTop:9}}>Set category limits and compare them with the expenses you record.</p></div><Link className="btn" href="/transactions?new=1">Add spending <ArrowRight size={14}/></Link></div>
    {params.saved && <div className="panel-soft" role="status" style={{marginBottom:16,color:"var(--positive)",fontSize:13}}>Monthly budget saved.</div>}
    <div className="grid-2" style={{alignItems:"start"}}>
      <section className="panel"><span className="metric-icon"><Target size={17}/></span><div className="eyebrow" style={{marginTop:20}}>SPENDING SO FAR THIS MONTH</div><div className="metric-value" style={{fontSize:42}}>{money(total)}</div><p className="muted" style={{fontSize:13,lineHeight:1.8}}>Calculated from your own expense records for {month}. No bank balance is inferred.</p>
        <div className="section-head" style={{marginTop:24}}><h2 className="section-title">Your category limits</h2><span className="pill">{(budgets ?? []).length} saved</span></div>
        {categories.length ? categories.map((item) => {
          const ratio = item.limit > 0 ? item.amount / item.limit : 0;
          return <div key={item.category} style={{marginBottom:20}}><div style={{display:"flex",justifyContent:"space-between",gap:10,fontSize:13,marginBottom:8}}><span>{item.category}</span><span style={{textAlign:"right"}}><b>{money(item.amount)}</b><span className="muted">{item.limit > 0 ? ` / ${money(item.limit)}` : " · no limit"}</span></span></div><div style={{height:7,background:"var(--panel-2)",borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:`${item.limit > 0 ? Math.min(100, ratio * 100) : 0}%`,background:ratio > 1 ? "var(--danger)" : "var(--accent)",borderRadius:99}}/></div>{item.limit > 0 && <div className="small muted" style={{marginTop:6}}>{ratio > 1 ? `${money(item.amount - item.limit)} over limit` : `${money(item.limit - item.amount)} remaining`}</div>}</div>;
        }) : <div className="empty">Add a monthly category limit to start planning. Expenses you record will be compared automatically.</div>}
      </section>
      <section className="panel"><div className="eyebrow">PLAN YOUR MONTH</div><h2 className="section-title" style={{margin:"8px 0 18px"}}>Add or update a limit</h2><form action={addBudget} style={{display:"grid",gap:14}}>
        <label className="field">Category<input className="input" name="category" required maxLength={60} placeholder="e.g. Food, Transport, Shopping"/></label>
        <label className="field">Monthly limit (₹)<input className="input" name="monthly_limit" type="number" min="1" step="0.01" required placeholder="5000"/></label>
        <label className="field">Month<input className="input" name="month_start" type="month" required defaultValue={month}/></label>
        <button className="btn btn-primary" type="submit">Save monthly limit <ArrowRight size={14}/></button>
      </form>
      {(budgets ?? []).length > 0 && <><div className="auth-divider">REMOVE A LIMIT</div><div style={{display:"grid",gap:8}}>{(budgets ?? []).map((budget) => <form key={budget.id} action={deleteBudget} style={{display:"flex",alignItems:"center",gap:10,justifyContent:"space-between"}}><span style={{fontSize:13}}>{budget.category}<span className="small muted"> · {money(Number(budget.monthly_limit))}</span></span><input type="hidden" name="id" value={budget.id}/><button className="btn btn-quiet" type="submit" aria-label={`Delete ${budget.category} budget`} style={{padding:8}}><Trash2 size={14}/></button></form>)}</div></>}
    </section></div>
  </AppShell>;
}
