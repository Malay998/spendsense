import { redirect } from "next/navigation";
import { ArrowRight, CreditCard, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/server";
import { addSubscription, deleteSubscription } from "@/app/actions";
import { money } from "@/lib/money";

const cycleLabel: Record<string, string> = { weekly: "Weekly", monthly: "Monthly", quarterly: "Every 3 months", yearly: "Yearly" };

export default async function SubscriptionsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data } = await supabase.from("subscriptions").select("id,name,amount,billing_cycle,next_renewal,category,active").eq("user_id", user.id).order("next_renewal", { ascending: true, nullsFirst: false });
  const rows = data ?? [];
  const monthlyEquivalent = rows.filter((row) => row.active).reduce((sum, row) => {
    const amount = Number(row.amount);
    return sum + (row.billing_cycle === "weekly" ? amount * 52 / 12 : row.billing_cycle === "quarterly" ? amount / 3 : row.billing_cycle === "yearly" ? amount / 12 : amount);
  }, 0);
  return <AppShell active="/subscriptions">
    <div className="topbar"><div><div className="eyebrow">RECURRING SPEND</div><h1 className="page-title">Subscriptions</h1><p className="muted" style={{fontSize:13,marginTop:9}}>Keep renewals, billing cycles and recurring costs in one place.</p></div></div>
    {params.saved && <div className="panel-soft" role="status" style={{marginBottom:16,color:"var(--positive)",fontSize:13}}>Subscription saved.</div>}
    <div className="grid-2" style={{alignItems:"start"}}>
      <section className="panel"><div style={{display:"flex",justifyContent:"space-between",gap:16,alignItems:"start"}}><div><div className="eyebrow">ESTIMATED MONTHLY EQUIVALENT</div><div className="metric-value" style={{fontSize:38,marginTop:8}}>{money(monthlyEquivalent)}</div><p className="muted small" style={{lineHeight:1.7}}>Based on active subscriptions you enter. Actual billing dates and taxes may vary.</p></div><span className="metric-icon"><CreditCard size={17}/></span></div>
        <div className="section-head" style={{marginTop:22}}><h2 className="section-title">Your subscriptions</h2><span className="pill">{rows.length} saved</span></div>
        {rows.length ? <div className="table-wrap"><table className="table"><thead><tr><th>Service</th><th>Cycle / renewal</th><th>Amount</th><th></th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td><div style={{fontWeight:600}}>{row.name}</div><div className="small muted" style={{marginTop:4}}>{row.category}{!row.active ? " · paused" : ""}</div></td><td><div>{cycleLabel[row.billing_cycle] ?? row.billing_cycle}</div><div className="small muted" style={{marginTop:4}}>{row.next_renewal || "No renewal date"}</div></td><td style={{whiteSpace:"nowrap",fontWeight:600}}>{money(Number(row.amount))}</td><td><form action={deleteSubscription}><input type="hidden" name="id" value={row.id}/><button className="btn btn-quiet" type="submit" aria-label={`Delete ${row.name}`} style={{padding:8}}><Trash2 size={14}/></button></form></td></tr>)}</tbody></table></div> : <div className="empty">No subscriptions yet. Add services like streaming, music, storage, gym or software to see your recurring costs here.</div>}
      </section>
      <section className="panel"><div className="eyebrow">RECORD A RECURRING PAYMENT</div><h2 className="section-title" style={{margin:"8px 0 18px"}}>Add subscription</h2><form action={addSubscription} style={{display:"grid",gap:13}}>
        <label className="field">Service name<input className="input" name="name" required maxLength={100} placeholder="e.g. Spotify, iCloud, gym"/></label>
        <label className="field">Amount per billing cycle (₹)<input className="input" name="amount" type="number" min="0" step="0.01" required placeholder="149"/></label>
        <label className="field">Billing cycle<select className="input" name="billing_cycle" defaultValue="monthly"><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="quarterly">Every 3 months</option><option value="yearly">Yearly</option></select></label>
        <label className="field">Category<input className="input" name="category" maxLength={60} defaultValue="Other" placeholder="Entertainment, Utilities…"/></label>
        <label className="field">Next renewal date (optional)<input className="input" name="next_renewal" type="date"/></label>
        <button className="btn btn-primary" type="submit">Save subscription <ArrowRight size={14}/></button>
      </form>
    </section></div>
  </AppShell>;
}
