"use client";

import { useState } from "react";
import { CheckCircle2, KeyRound } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";

export function ChangePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setMessage(""); setError("");
    if (password !== confirmPassword) { setError("The passwords don't match."); return; }
    setBusy(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setMessage("Password updated. You can use it the next time you sign in.");
      setPassword(""); setConfirmPassword("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Couldn't update the password. Please try again.");
    } finally { setBusy(false); }
  }

  return <form onSubmit={submit} style={{display:"grid",gap:13}}>
    <p className="muted small" style={{lineHeight:1.7,margin:"0 0 2px"}}>Set a password for quicker sign-ins, or update the one you already use.</p>
    <label className="field">New password<input className="input" type="password" minLength={6} required autoComplete="new-password" value={password} onChange={event=>setPassword(event.target.value)}/></label>
    <label className="field">Confirm password<input className="input" type="password" minLength={6} required autoComplete="new-password" value={confirmPassword} onChange={event=>setConfirmPassword(event.target.value)}/></label>
    <button className="btn btn-primary" type="submit" disabled={busy}><KeyRound size={14}/>{busy ? "Saving…" : "Update password"}</button>
    {message && <p role="status" className="positive small" style={{display:"flex",gap:7,lineHeight:1.6}}><CheckCircle2 size={15} style={{flexShrink:0}}/>{message}</p>}
    {error && <p role="alert" className="small" style={{color:"var(--danger)",lineHeight:1.6}}>{error}</p>}
  </form>;
}
