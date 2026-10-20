"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, KeyRound, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError("");
    if (password !== confirmPassword) { setError("Those passwords don't match yet."); return; }
    setBusy(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      router.replace("/dashboard?password=updated");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Couldn't update your password. Request a new reset link and try again.");
    } finally { setBusy(false); }
  }

  return <main className="auth-card-wrap" style={{minHeight:"100vh",background:"var(--bg)"}}><section className="auth-card">
    <Link href="/login" className="small muted" style={{display:"inline-flex",gap:8,alignItems:"center",marginBottom:30}}>← Back to sign in</Link>
    <span className="metric-icon"><KeyRound size={17}/></span>
    <div className="eyebrow" style={{marginTop:22}}>ACCOUNT SECURITY</div>
    <h1 className="display" style={{fontSize:34,margin:"10px 0"}}>Choose a new password.</h1>
    <p className="muted" style={{fontSize:13,lineHeight:1.7}}>Use at least 6 characters. After saving, you&apos;ll return to your SpendSense workspace.</p>
    <form onSubmit={submit} style={{display:"grid",gap:14,marginTop:24}}>
      <label className="field">New password<input className="input" type="password" required minLength={6} autoComplete="new-password" value={password} onChange={event=>setPassword(event.target.value)}/></label>
      <label className="field">Confirm new password<input className="input" type="password" required minLength={6} autoComplete="new-password" value={confirmPassword} onChange={event=>setConfirmPassword(event.target.value)}/></label>
      {error && <div className="panel-soft" role="alert" style={{color:"var(--danger)",fontSize:12,lineHeight:1.6}}>{error}</div>}
      <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? "Updating…" : "Update password"}<ArrowRight size={15}/></button>
    </form>
    <p className="small muted" style={{display:"flex",gap:8,lineHeight:1.7,marginTop:22}}><ShieldCheck size={15} style={{flexShrink:0}}/> Passwords are handled by Supabase Auth and are never stored in your SpendSense profile.</p>
  </section></main>;
}
