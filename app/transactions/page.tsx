import { AppShell } from "@/components/app-shell";
import { TransactionForm } from "@/components/transaction-form";
import { createClient } from "@/lib/supabase/server";
import { money } from "@/lib/money";
import { deleteTransaction } from "@/app/actions";
import { Plus, Trash2 } from "lucide-react";

export default async function TransactionsPage({ searchParams }: { searchParams: Promise<{new?:string;saved?:string}> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("transactions").select("*").order("transaction_date",{ascending:false}).limit(250);
  const rows = data ?? [];
  return <AppShell active="/transactions">
    <div className="topbar"><div><div className="eyebrow">YOUR MONEY, IN CONTEXT</div><h1 className="page-title">Transactions</h1><p className="muted" style={{fontSize:13,marginTop:9}}>One clear record of money coming in and going out.</p></div><a href="#add" className="btn btn-primary"><Plus size={15}/> Add transaction</a></div>
    {params.saved && <div className="panel-soft" style={{marginBottom:16,color:"var(--lime)",fontSize:13}}>Transaction saved successfully.</div>}
    <div className="grid-2" style={{gridTemplateColumns:"minmax(0,1.35fr) minmax(280px,.65fr)",alignItems:"start"}}>
      <section className="panel"><div className="section-head"><h2 className="section-title">All transactions</h2><span className="pill">{rows.length} records shown</span></div>
        {rows.length ? <div className="table-wrap"><table className="table"><thead><tr><th>Details</th><th>Date</th><th>Amount</th><th></th></tr></thead><tbody>{rows.map(t=><tr key={t.id}><td><div style={{fontWeight:600}}>{t.title}</div><div className="small muted" style={{marginTop:4}}>{t.category} · {t.type}</div></td><td className="muted">{t.transaction_date}</td><td className={t.type==="income"?"positive":"negative"} style={{whiteSpace:"nowrap",fontWeight:600}}>{t.type==="income"?"+":"−"}{money(Number(t.amount))}</td><td><form action={deleteTransaction}><input type="hidden" name="id" value={t.id}/><button aria-label="Delete transaction" title="Delete transaction" className="btn btn-quiet" style={{padding:8}}><Trash2 size={14}/></button></form></td></tr>)}</tbody></table></div> : <div className="empty">No transactions yet. Add your first one on the right.</div>}
      </section>
      <section id="add" className="panel"><div className="eyebrow">ADD TO YOUR RECORD</div><h2 className="section-title" style={{margin:"8px 0 20px"}}>New transaction</h2><TransactionForm/></section>
    </div>
  </AppShell>;
}
