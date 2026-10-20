import { AppShell } from "@/components/app-shell";
import { ShieldCheck, Database, Download, Mail } from "lucide-react";

export default function HelpPage() {
  return <AppShell active="/help"><div className="topbar"><div><div className="eyebrow">CLEAR ANSWERS</div><h1 className="page-title">Help & privacy</h1><p className="muted" style={{fontSize:13,marginTop:9}}>Understand how SpendSense handles your information.</p></div></div>
    <div style={{display:"grid",gap:14,maxWidth:850}}>
      <section className="panel"><ShieldCheck size={20} color="var(--lime)"/><h2 className="section-title" style={{margin:"12px 0 8px"}}>Who can see my financial records?</h2><p className="muted" style={{fontSize:13,lineHeight:1.8}}>The app is designed so each signed-in user can access only their own rows. Database Row Level Security (RLS) policies enforce this boundary. Admin operations are separated from normal user access.</p></section>
      <section className="panel"><Database size={20} color="var(--lime)"/><h2 className="section-title" style={{margin:"12px 0 8px"}}>Where is data stored?</h2><p className="muted" style={{fontSize:13,lineHeight:1.8}}>In the PostgreSQL database for your configured Supabase project. GitHub stores the source code, not user transactions. Production data should be backed up independently; the free Supabase plan does not include automatic database backups. <a href="https://supabase.com/docs/guides/platform/backups" target="_blank" rel="noreferrer" style={{color:"var(--lime)",textDecoration:"underline"}}>Backup documentation</a>.</p></section>
      <section className="panel"><Download size={20} color="var(--lime)"/><h2 className="section-title" style={{margin:"12px 0 8px"}}>Can I export or delete my data?</h2><p className="muted" style={{fontSize:13,lineHeight:1.8}}>Self-service export and account deletion are important production features, but are not fully implemented in this starter. Add and test them before inviting real users at scale.</p></section>
      <section className="panel"><Mail size={20} color="var(--lime)"/><h2 className="section-title" style={{margin:"12px 0 8px"}}>Need help?</h2><p className="muted" style={{fontSize:13,lineHeight:1.8}}>Add your support email and privacy policy before public launch. Never ask users to share banking passwords, PINs, CVVs or full card details.</p></section>
    </div>
  </AppShell>;
}
