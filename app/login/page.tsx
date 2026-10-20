"use client";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { ArrowLeft, ArrowRight, Mail, ShieldCheck, Sparkles } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMessage(""); setError("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard` }
      });
      if (error) throw error;
      setMessage("Check your inbox. We've sent you a secure sign-in link.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send the sign-in email. Check your Supabase configuration.");
    } finally { setBusy(false); }
  }
  return <main className="auth-wrap">
    <aside className="auth-visual">
      <Link href="/" className="brand"><span className="brand-mark">S</span> spendsense<span style={{color:"var(--lime)"}}>.</span></Link>
      <div><div className="pill pill-lime"><Sparkles size={13}/> A BETTER MONEY HABIT</div><h1 className="display" style={{fontSize:"clamp(40px,5vw,65px)",lineHeight:1.02,margin:"24px 0"}}>Make space<br/>for what<br/><span style={{color:"var(--lime)"}}>matters.</span></h1><p className="muted" style={{maxWidth:360,lineHeight:1.8}}>A little more awareness today can mean a lot more freedom tomorrow.</p></div>
      <div className="small muted">Your journey. Your pace. Your data.</div>
    </aside>
    <section className="auth-card-wrap"><div className="auth-card">
      <Link href="/" className="small muted" style={{display:"inline-flex",gap:8,alignItems:"center",marginBottom:42}}><ArrowLeft size={14}/> Back to home</Link>
      <div className="eyebrow">YOUR MONEY, REIMAGINED</div><h2 className="display" style={{fontSize:36,margin:"10px 0"}}>Welcome in.</h2><p className="muted" style={{fontSize:13,lineHeight:1.7,marginBottom:30}}>Sign in or create your account with your email. No password to remember.</p>
      <form onSubmit={submit} style={{display:"grid",gap:16}}>
        <label className="field">Email address<input className="input" type="email" required placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"/></label>
        <button className="btn btn-primary" type="submit" disabled={busy}>{busy?"Sending link…":"Continue with email"} <ArrowRight size={15}/></button>
      </form>
      {message && <div className="panel-soft" role="status" style={{marginTop:18,color:"var(--lime)",fontSize:13,lineHeight:1.6}}><Mail size={16} style={{display:"inline",marginRight:8}}/>{message}</div>}
      {error && <div className="panel-soft" role="alert" style={{marginTop:18,color:"#ffaaaa",fontSize:13,lineHeight:1.6}}>{error}</div>}
      <div style={{display:"flex",gap:10,alignItems:"flex-start",marginTop:28,color:"#7d878d",fontSize:11,lineHeight:1.7}}><ShieldCheck size={16} style={{flexShrink:0,color:"var(--lime)"}}/> By continuing, you agree to use SpendSense responsibly. Do not enter banking passwords or card PINs. This is a personal finance organizer, not a bank.</div>
      <p className="small muted" style={{marginTop:28}}>Email link delivery requires Supabase Auth to be configured.</p>
    </div></section>
  </main>;
}
