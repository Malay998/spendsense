import { AppShell } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/server";
import { saveProfile } from "@/app/actions";
import { ShieldCheck } from "lucide-react";

export default async function SettingsPage({searchParams}:{searchParams:Promise<{saved?:string}>}) {
  const params=await searchParams; const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser(); if(!user) return null;
  const {data:profile}=await supabase.from("profiles").select("*").eq("id",user.id).maybeSingle();
  return <AppShell active="/settings"><div className="topbar"><div><div className="eyebrow">MAKE IT YOURS</div><h1 className="page-title">Settings</h1><p className="muted" style={{fontSize:13,marginTop:9}}>Your preferences and financial starting point.</p></div></div>
    {params.saved && <div className="panel-soft" style={{marginBottom:16,color:"var(--lime)",fontSize:13}}>Settings saved.</div>}
    <div className="grid-2" style={{gridTemplateColumns:"minmax(0,1fr) minmax(0,1fr)",alignItems:"start"}}>
      <section className="panel"><div className="eyebrow">PROFILE</div><h2 className="section-title" style={{margin:"8px 0 22px"}}>Your details</h2><form action={saveProfile} style={{display:"grid",gap:16}}>
        <label className="field">Email address<input className="input" value={user.email??""} readOnly/></label>
        <label className="field">Display name<input name="display_name" className="input" defaultValue={profile?.display_name??""} placeholder="What should we call you?" maxLength={80}/></label>
        <label className="field">Expected monthly income (₹)<input name="monthly_income" className="input" type="number" min="0" step="1" defaultValue={profile?.monthly_income??0}/></label>
        <label className="field">Currency<select name="currency" className="input" defaultValue={profile?.currency??"INR"}><option value="INR">INR — Indian Rupee</option><option value="USD">USD — US Dollar</option><option value="GBP">GBP — Pound Sterling</option><option value="EUR">EUR — Euro</option></select></label>
        <button className="btn btn-primary" type="submit">Save preferences</button>
      </form></section>
      <section className="panel"><span className="metric-icon"><ShieldCheck size={17}/></span><h2 className="section-title" style={{margin:"16px 0 8px"}}>Privacy, by design</h2><p className="muted" style={{fontSize:13,lineHeight:1.8}}>Your transactions and budgets belong to your account. Database policies restrict access by user ID. The admin dashboard is intended for account and product-usage operations, not browsing everyone&apos;s financial details.</p><div className="panel-soft" style={{marginTop:16,fontSize:12,lineHeight:1.8}}>Never store bank passwords, card PINs, CVVs or full card numbers here. Use export/backup procedures for important data.</div></section>
    </div></AppShell>;
}
