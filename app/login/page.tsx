"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { ArrowLeft, ArrowRight, CheckCircle2, KeyRound, Mail, ShieldCheck, Sparkles } from "lucide-react";

type LoginMethod = "password" | "email";

function friendlyAuthError(cause: unknown) {
  const raw = cause instanceof Error ? cause.message : "We couldn't complete that request. Please try again.";
  const message = raw.toLowerCase();
  if (message.includes("email rate limit") || message.includes("over_email_send_rate_limit") || message.includes("email_send_rate_limit")) {
    return "Supabase is temporarily limiting email messages for this project. You can still use Continue with Google, or sign in with your password. If you are creating accounts for the public, configure a custom SMTP provider in Supabase.";
  }
  if (message.includes("invalid login credentials")) return "That email and password combination doesn't match. Check your details or choose Forgot password.";
  if (message.includes("email not confirmed")) return "This email still needs confirmation. Try Continue with Google, or check your inbox for the confirmation message.";
  if (message.includes("provider is not enabled") || message.includes("unsupported provider")) return "Google sign-in isn't enabled in Supabase yet. Follow GOOGLE-SIGN-IN-SETUP.txt to connect Google OAuth.";
  return raw;
}

function GoogleMark() {
  return <svg aria-hidden="true" width="19" height="19" viewBox="0 0 48 48" role="img"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 37.98 46.98 31.93 46.98 24.55Z"/><path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19Z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.14 1.44-4.89 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"/></svg>;
}

export default function LoginPage() {
  const router = useRouter();
  const [method, setMethod] = useState<LoginMethod>("password");
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [busyGoogle, setBusyGoogle] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "auth") setError("Sign-in could not be completed. Try again, choose another Google account, or sign in with your password.");
  }, []);

  function clearFeedback() { setMessage(""); setError(""); }

  async function signInWithGoogle() {
    setBusyGoogle(true); clearFeedback();
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
          queryParams: { prompt: "select_account" },
        },
      });
      if (authError) throw authError;
    } catch (cause) {
      setError(friendlyAuthError(cause));
      setBusyGoogle(false);
    }
  }

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
          router.replace("/dashboard"); router.refresh();
        } else {
          setMessage("Your account request was received. If email confirmation is enabled, you'll need to confirm it before password sign-in. For the smoothest setup, use Continue with Google.");
          setCreatingAccount(false); setPassword("");
        }
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (authError) throw authError;
        router.replace("/dashboard"); router.refresh();
      }
    } catch (cause) {
      setError(friendlyAuthError(cause));
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
      setMessage("If email delivery is available, your secure sign-in link will arrive shortly. For instant sign-in without this email limit, choose Continue with Google.");
    } catch (cause) {
      setError(friendlyAuthError(cause));
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
      setMessage("If an account exists for that email, a password reset link has been requested. Delivery depends on your Supabase email configuration.");
    } catch (cause) {
      setError(friendlyAuthError(cause));
    } finally { setBusy(false); }
  }

  function chooseMethod(next: LoginMethod) { setMethod(next); setCreatingAccount(false); setPassword(""); clearFeedback(); }

  return <main className="auth-wrap">
    <aside className="auth-visual">
      <Link href="/" className="brand"><span className="brand-mark">S</span> spendsense<span style={{color:"var(--lime)"}}>.</span></Link>
      <div>
        <div className="pill pill-lime"><Sparkles size={13}/> YOUR MONEY, YOUR RULES</div>
        <h1 className="display" style={{fontSize:"clamp(40px,5vw,65px)",lineHeight:1.02,margin:"24px 0"}}>A clearer<br/>headspace for<br/><span style={{color:"var(--lime)"}}>your money.</span></h1>
        <p className="muted" style={{maxWidth:370,lineHeight:1.85}}>One secure sign-in. Your transactions, budgets and subscriptions stay connected to your account when you come back.</p>
        <div className="auth-benefits">
          <div><CheckCircle2 size={16}/> Continue with Google in a few clicks</div>
          <div><CheckCircle2 size={16}/> Password sign-in whenever you prefer</div>
          <div><CheckCircle2 size={16}/> Your saved records follow your account</div>
        </div>
      </div>
      <div className="small muted">Private by design · No bank connection required</div>
    </aside>
    <section className="auth-card-wrap"><div className="auth-card">
      <Link href="/" className="small muted" style={{display:"inline-flex",gap:8,alignItems:"center",marginBottom:34}}><ArrowLeft size={14}/> Back to home</Link>
      <div className="eyebrow">YOUR PERSONAL MONEY SPACE</div>
      <h2 className="display" style={{fontSize:36,margin:"10px 0 7px"}}>{creatingAccount ? "Create your account." : "Welcome back."}</h2>
      <p className="muted" style={{fontSize:13,lineHeight:1.7,margin:"0 0 20px"}}>{creatingAccount ? "Create an account with Google, or use your email and a password." : "Sign in to pick up where you left off."}</p>

      <button type="button" className="btn btn-google" onClick={signInWithGoogle} disabled={busyGoogle || busy} style={{width:"100%",minHeight:48,display:"flex",justifyContent:"center",alignItems:"center",gap:11,background:"#fff",color:"#1f2937",border:"1px solid #d8dee8",fontWeight:700}}>
        <GoogleMark/>{busyGoogle ? "Connecting to Google…" : "Continue with Google"}
      </button>
      <div className="auth-divider"><span>OR USE EMAIL</span></div>

      <div className="auth-tabs" role="group" aria-label="Email sign-in method">
        <button type="button" className="auth-tab" aria-pressed={method === "password"} onClick={() => chooseMethod("password")}><KeyRound size={14} style={{display:"inline",verticalAlign:"-3px",marginRight:6}}/>Password</button>
        <button type="button" className="auth-tab" aria-pressed={method === "email"} onClick={() => chooseMethod("email")}><Mail size={14} style={{display:"inline",verticalAlign:"-3px",marginRight:6}}/>Email link</button>
      </div>

      {method === "password" ? <form onSubmit={submitPassword} style={{display:"grid",gap:15}}>
        <label className="field">Email address<input className="input" type="email" required placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"/></label>
        <label className="field">Password<input className="input" type="password" required minLength={6} placeholder={creatingAccount ? "At least 6 characters" : "Your password"} value={password} onChange={e=>setPassword(e.target.value)} autoComplete={creatingAccount ? "new-password" : "current-password"}/></label>
        {!creatingAccount && <div style={{display:"flex",justifyContent:"flex-end",marginTop:-5}}><button type="button" className="text-button" onClick={resetPassword} disabled={busy}>Forgot password?</button></div>}
        <button className="btn btn-primary" type="submit" disabled={busy || busyGoogle}>{busy ? "Please wait…" : creatingAccount ? "Create account with email" : "Sign in with password"}<ArrowRight size={15}/></button>
        <div className="auth-divider">{creatingAccount ? "ALREADY HAVE AN ACCOUNT?" : "NEW TO SPENDSENSE?"}</div>
        <button type="button" className="btn btn-quiet" onClick={()=>{setCreatingAccount(!creatingAccount);clearFeedback();setPassword("");}}>{creatingAccount ? "Back to sign in" : "Create an email account"}</button>
      </form> : <form onSubmit={sendMagicLink} style={{display:"grid",gap:15}}>
        <label className="field">Email address<input className="input" type="email" required placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"/></label>
        <button className="btn btn-primary" type="submit" disabled={busy || busyGoogle}>{busy ? "Sending link…" : "Email me a sign-in link"}<ArrowRight size={15}/></button>
        <p className="muted small" style={{lineHeight:1.7,margin:0}}>Email links depend on your project&apos;s email sending limits. Google sign-in avoids sending a sign-in email.</p>
      </form>}

      {message && <div className="panel-soft" role="status" style={{display:"flex",gap:9,alignItems:"flex-start",marginTop:17,color:"var(--positive)",fontSize:12,lineHeight:1.7}}><Mail size={16} style={{flexShrink:0,marginTop:2}}/>{message}</div>}
      {error && <div className="panel-soft" role="alert" style={{marginTop:17,color:"var(--danger)",fontSize:12,lineHeight:1.7}}>{error}</div>}
      <div style={{display:"flex",gap:10,alignItems:"flex-start",marginTop:25,color:"var(--muted)",fontSize:11,lineHeight:1.7}}><ShieldCheck size={16} style={{flexShrink:0,color:"var(--lime)"}}/> SpendSense is a personal finance organizer, not a bank. Never enter banking passwords, card PINs, CVVs, or full card numbers.</div>
    </div></section>
  </main>;
}

