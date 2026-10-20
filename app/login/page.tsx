"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { ArrowLeft, ArrowRight, CheckCircle2, KeyRound, Mail, ShieldCheck, Sparkles } from "lucide-react";

type LoginMethod = "password" | "email";

export default function LoginPage() {
  const router = useRouter();
  const [method, setMethod] = useState<LoginMethod>("password");
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function clearFeedback() { setMessage(""); setError(""); }

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); clearFeedback();
    try {
      const supabase = createClient();
      if (creatingAccount) {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
        });
        if (authError) throw authError;
        if (data.session) {
          router.replace("/dashboard");
          router.refresh();
        } else {
          setMessage("Your account is ready for verification. Check your inbox for the confirmation email, then return here to sign in.");
          setCreatingAccount(false);
          setPassword("");
        }
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (authError) throw authError;
        router.replace("/dashboard");
        router.refresh();
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We couldn't complete that request. Please try again.");
    } finally { setBusy(false); }
  }

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); clearFeedback();
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
      });
      if (authError) throw authError;
      setMessage("Your secure sign-in link is on its way. Check your inbox and spam folder.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not send the sign-in email. Check your Supabase Auth settings.");
    } finally { setBusy(false); }
  }

  async function resetPassword() {
    clearFeedback();
    if (!email.trim()) { setError("Enter your email address first, then choose Forgot password."); return; }
    setBusy(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
      });
      if (authError) throw authError;
      setMessage("If an account exists for that email, a password reset link is on its way.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not request a password reset. Please try again.");
    } finally { setBusy(false); }
  }

  function chooseMethod(next: LoginMethod) { setMethod(next); setCreatingAccount(false); setPassword(""); clearFeedback(); }

  return <main className="auth-wrap">
    <aside className="auth-visual">
      <Link href="/" className="brand"><span className="brand-mark">S</span> spendsense<span style={{color:"var(--lime)"}}>.</span></Link>
      <div>
        <div className="pill pill-lime"><Sparkles size={13}/> YOUR MONEY, YOUR RULES</div>
        <h1 className="display" style={{fontSize:"clamp(40px,5vw,65px)",lineHeight:1.02,margin:"24px 0"}}>A clearer<br/>headspace for<br/><span style={{color:"var(--lime)"}}>your money.</span></h1>
        <p className="muted" style={{maxWidth:370,lineHeight:1.85}}>Come back whenever you need to. Your account keeps your workspace connected, and your data stays tied to your sign-in.</p>
        <div className="auth-benefits">
          <div><CheckCircle2 size={16}/> Sign in with a password or email link</div>
          <div><CheckCircle2 size={16}/> Your session stays active between visits</div>
          <div><CheckCircle2 size={16}/> Eight color themes to make it yours</div>
        </div>
      </div>
      <div className="small muted">Private by design · No bank connection required</div>
    </aside>
    <section className="auth-card-wrap"><div className="auth-card">
      <Link href="/" className="small muted" style={{display:"inline-flex",gap:8,alignItems:"center",marginBottom:34}}><ArrowLeft size={14}/> Back to home</Link>
      <div className="eyebrow">YOUR PERSONAL MONEY SPACE</div>
      <h2 className="display" style={{fontSize:36,margin:"10px 0 7px"}}>{creatingAccount ? "Create your account." : "Welcome back."}</h2>
      <p className="muted" style={{fontSize:13,lineHeight:1.7,margin:"0 0 12px"}}>{creatingAccount ? "Start with your email. You can change your sign-in method later." : "Pick the way you want to sign in. You can return to the same account anytime."}</p>

      <div className="auth-tabs" role="group" aria-label="Sign-in method">
        <button type="button" className="auth-tab" aria-pressed={method === "password"} onClick={() => chooseMethod("password")}><KeyRound size={14} style={{display:"inline",verticalAlign:"-3px",marginRight:6}}/>Password</button>
        <button type="button" className="auth-tab" aria-pressed={method === "email"} onClick={() => chooseMethod("email")}><Mail size={14} style={{display:"inline",verticalAlign:"-3px",marginRight:6}}/>Email link</button>
      </div>

      {method === "password" ? <form onSubmit={submitPassword} style={{display:"grid",gap:15}}>
        <label className="field">Email address<input className="input" type="email" required placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"/></label>
        <label className="field">Password<input className="input" type="password" required minLength={6} placeholder={creatingAccount ? "At least 6 characters" : "Your password"} value={password} onChange={e=>setPassword(e.target.value)} autoComplete={creatingAccount ? "new-password" : "current-password"}/></label>
        {!creatingAccount && <div style={{display:"flex",justifyContent:"flex-end",marginTop:-5}}><button type="button" className="text-button" onClick={resetPassword} disabled={busy}>Forgot password?</button></div>}
        <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? "Please wait…" : creatingAccount ? "Create account" : "Sign in securely"}<ArrowRight size={15}/></button>
        <div className="auth-divider">{creatingAccount ? "ALREADY HAVE AN ACCOUNT?" : "NEW TO SPENDSENSE?"}</div>
        <button type="button" className="btn btn-quiet" onClick={()=>{setCreatingAccount(!creatingAccount);clearFeedback();setPassword("");}}>{creatingAccount ? "Back to sign in" : "Create a new account"}</button>
      </form> : <form onSubmit={sendMagicLink} style={{display:"grid",gap:15}}>
        <label className="field">Email address<input className="input" type="email" required placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"/></label>
        <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? "Sending link…" : "Email me a sign-in link"}<ArrowRight size={15}/></button>
        <p className="muted small" style={{lineHeight:1.7,margin:0}}>No password needed. Open the secure link from your email on this device to return to your workspace.</p>
      </form>}

      {message && <div className="panel-soft" role="status" style={{display:"flex",gap:9,alignItems:"flex-start",marginTop:17,color:"var(--positive)",fontSize:12,lineHeight:1.7}}><Mail size={16} style={{flexShrink:0,marginTop:2}}/>{message}</div>}
      {error && <div className="panel-soft" role="alert" style={{marginTop:17,color:"var(--danger)",fontSize:12,lineHeight:1.7}}>{error}</div>}
      <div style={{display:"flex",gap:10,alignItems:"flex-start",marginTop:25,color:"var(--muted)",fontSize:11,lineHeight:1.7}}><ShieldCheck size={16} style={{flexShrink:0,color:"var(--lime)"}}/> SpendSense is a personal finance organizer, not a bank. Never enter banking passwords, card PINs, CVVs, or full card numbers.</div>
    </div></section>
  </main>;
}
