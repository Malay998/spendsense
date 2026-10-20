import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { CreditCard, ArrowRight } from "lucide-react";

export default function SubscriptionsPage() {
  return <AppShell active="/subscriptions"><div className="topbar"><div><div className="eyebrow">RECURRING SPEND</div><h1 className="page-title">Subscriptions</h1><p className="muted" style={{fontSize:13,marginTop:9}}>Know what renews, when it renews, and what it costs.</p></div></div>
    <section className="panel" style={{maxWidth:720}}><span className="metric-icon"><CreditCard size={17}/></span><h2 className="section-title" style={{margin:"17px 0 8px"}}>Your recurring payments, in one place.</h2><p className="muted" style={{fontSize:13,lineHeight:1.8}}>Subscription tracking is part of the product roadmap. The next implementation step is to add subscription records, renewal dates, monthly-equivalent costs and reminders.</p><div className="pill" style={{marginTop:8}}>No subscriptions have been invented or prefilled.</div><div style={{marginTop:20}}><Link className="btn btn-primary" href="/help">See what&apos;s planned <ArrowRight size={14}/></Link></div></section>
  </AppShell>;
}
