import { AppShell } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/server";
import { saveProfile } from "@/app/actions";
import { ThemePicker } from "@/components/theme-picker";
import { ChangePasswordForm } from "@/components/change-password-form";
import { ShieldCheck, UserRound, Palette, KeyRound } from "lucide-react";

export default async function SettingsPage({searchParams}:{searchParams:Promise<{saved?:string}>}) {
  const params=await searchParams; const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser(); if(!user) return null;
  const {data:profile}=await supabase.from("profiles").select("*").eq("id",user.id).maybeSingle();
  return <AppShell active="/settings">
    <div className="topbar"><div><div className="eyebrow">YOUR SPACE, YOUR RULES</div><h1 className="page-title">Settings</h1><p className="muted" style={{fontSize:13,marginTop:9}}>Personalize your workspace, manage your profile, and choose how you sign in.</p></div><span className="pill pill-lime">Preferences</span></div>
    {params.saved && <div className="panel-soft" role="status" style={{marginBottom:16,color:"var(--positive)",fontSize:13}}>Your preferences were saved successfully.</div>}
    <section className="panel" style={{marginBottom:16}}><div className="section-head"><div><div className="eyebrow">APPEARANCE</div><h2 className="section-title" style={{marginTop:7}}>Pick your vibe</h2></div><span className="metric-icon"><Palette size={17}/></span></div><ThemePicker/></section>
    <div className="grid-2" style={{gridTemplateColumns:"minmax(0,1fr) minmax(0,1fr)",alignItems:"start"}}>
      <section className="panel"><div className="section-head"><div><div className="eyebrow">PROFILE</div><h2 className="section-title" style={{marginTop:7}}>Your details</h2></div><span className="metric-icon"><UserRound size={17}/></span></div><form action={saveProfile} style={{display:"grid",gap:16}}>
        <label className="field">Email address<input className="input" value={user.email??""} readOnly/></label>
        <label className="field">Display name<input name="display_name" className="input" defaultValue={profile?.display_name??""} placeholder="What should we call you?" maxLength={80}/></label>
        <label className="field">Expected monthly income ({profile?.currency??"INR"})<input name="monthly_income" className="input" type="number" min="0" step="1" defaultValue={profile?.monthly_income??0}/></label>
        <label className="field">Currency<select name="currency" className="input" defaultValue={profile?.currency??"INR"}><option value="INR">INR — Indian Rupee</option><option value="USD">USD — US Dollar</option><option value="GBP">GBP — Pound Sterling</option><option value="EUR">EUR — Euro</option></select></label>
        <button className="btn btn-primary" type="submit">Save preferences</button>
      </form></section>
      <div style={{display:"grid",gap:16}}>
        <section className="panel"><div className="section-head"><div><div className="eyebrow">SIGN-IN & SECURITY</div><h2 className="section-title" style={{marginTop:7}}>Keep your account yours</h2></div><span className="metric-icon"><KeyRound size={17}/></span></div><ChangePasswordForm/></section>
        <section className="panel"><span className="metric-icon"><ShieldCheck size={17}/></span><h2 className="section-title" style={{margin:"16px 0 8px"}}>Privacy, by design</h2><p className="muted" style={{fontSize:13,lineHeight:1.8,marginBottom:0}}>Your transactions are tied to your account and database policies restrict access by user ID. Themes are saved locally on this device and do not change your financial data.</p><div className="panel-soft" style={{marginTop:16,fontSize:12,lineHeight:1.8}}>Never store bank passwords, card PINs, CVVs, or full card numbers here. SpendSense is a personal finance organizer, not a bank.</div></section>
      </div>
    </div>
  </AppShell>;
}
