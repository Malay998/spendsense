import Link from "next/link";
import { ArrowRight, ArrowUpRight, BarChart3, Check, CreditCard, ShieldCheck, Sparkles, Wallet } from "lucide-react";

const features = [
  { icon: Wallet, title: "Know your number", desc: "See what's safe to spend after bills, goals and the rest of your month." },
  { icon: BarChart3, title: "Spot the patterns", desc: "Understand where money goes with clear, useful spending insights." },
  { icon: CreditCard, title: "No surprise renewals", desc: "Keep subscriptions and recurring payments in one calm place." },
  { icon: ShieldCheck, title: "Your money stays yours", desc: "Private-by-default records with account-level data access controls." }
];

export default function Home() {
  return <main style={{minHeight:"100vh",overflow:"hidden"}}>
    <nav style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"24px clamp(20px,6vw,88px)",borderBottom:"1px solid var(--line)"}}>
      <Link href="/" className="brand"><span className="brand-mark">S</span> spendsense<span style={{color:"var(--lime)"}}>.</span></Link>
      <div style={{display:"flex",gap:10,alignItems:"center"}}><Link className="btn btn-quiet" href="/login">Log in</Link><Link className="btn btn-primary" href="/login">Get started <ArrowRight size={15}/></Link></div>
    </nav>
    <section style={{maxWidth:1280,margin:"0 auto",padding:"clamp(64px,10vw,130px) 24px 70px",display:"grid",gridTemplateColumns:"minmax(0,1.1fr) minmax(300px,.9fr)",gap:60,alignItems:"center"}}>
      <div>
        <div className="pill pill-lime"><Sparkles size={13}/> MONEY, WITHOUT THE NOISE</div>
        <h1 className="display" style={{fontSize:"clamp(48px,7.3vw,88px)",lineHeight:.98,margin:"25px 0",fontWeight:600}}>Your money.<br/><span style={{color:"var(--lime)"}}>Your clarity.</span></h1>
        <p style={{fontSize:17,lineHeight:1.8,color:"#9ba5aa",maxWidth:510}}>A calmer way to track spending, plan your month, and make your next money move with confidence. Built for real life — and student budgets.</p>
        <div style={{display:"flex",gap:12,flexWrap:"wrap",marginTop:30}}><Link className="btn btn-primary" href="/login">Start your journey <ArrowRight size={16}/></Link><a className="btn" href="#features">Explore features</a></div>
        <div style={{display:"flex",gap:18,flexWrap:"wrap",marginTop:30,color:"#7d878d",fontSize:12}}><span><Check size={14} style={{display:"inline",color:"var(--lime)"}}/> Free to start</span><span><Check size={14} style={{display:"inline",color:"var(--lime)"}}/> No bank connection required</span><span><Check size={14} style={{display:"inline",color:"var(--lime)"}}/> Private by design</span></div>
      </div>
      <div style={{position:"relative"}}>
        <div style={{position:"absolute",inset:"10% -10% -8% 5%",background:"radial-gradient(ellipse,#a5d84a18,transparent 70%)",filter:"blur(20px)"}}/>
        <div className="panel" style={{position:"relative",padding:24,transform:"rotate(1.2deg)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div className="eyebrow">MONTHLY SNAPSHOT</div><div style={{fontSize:13,color:"#9ca5aa",marginTop:5}}>A clearer view of your money</div></div><span className="metric-icon"><Wallet size={17}/></span></div>
          <div style={{marginTop:30}}><div className="muted small">AVAILABLE TO SPEND</div><div className="display" style={{fontSize:46,marginTop:6}}>₹8,450<span style={{fontSize:16,color:"#778187"}}>.00</span></div><div className="pill pill-lime" style={{marginTop:12}}><ArrowUpRight size={13}/> Example preview</div></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:25}}><div className="panel-soft"><div className="muted small">Income</div><div className="display" style={{fontSize:23,marginTop:8}}>₹18,000</div><div className="small positive" style={{marginTop:5}}>Monthly plan</div></div><div className="panel-soft"><div className="muted small">Spent</div><div className="display" style={{fontSize:23,marginTop:8}}>₹6,200</div><div className="small muted" style={{marginTop:5}}>This month</div></div></div>
          <div className="panel-soft" style={{marginTop:12}}><div style={{display:"flex",justifyContent:"space-between",fontSize:12}}><span className="muted">Your budget progress</span><span>Example</span></div><div style={{height:7,background:"#282e31",borderRadius:99,marginTop:12,overflow:"hidden"}}><div style={{height:"100%",width:"42%",background:"var(--lime)",borderRadius:99}}/></div></div>
          <div className="small muted" style={{marginTop:14}}>Illustrative preview — not real user financial data.</div>
        </div>
      </div>
    </section>
    <section id="features" style={{maxWidth:1280,margin:"0 auto",padding:"48px 24px 100px"}}>
      <div className="eyebrow">LESS GUESSING. MORE CONTROL.</div><h2 className="display" style={{fontSize:"clamp(32px,5vw,52px)",margin:"14px 0 38px",maxWidth:650}}>The small money decisions add up.</h2>
      <div className="grid-4">{features.map(({icon:Icon,title,desc})=><div className="panel" key={title}><span className="metric-icon"><Icon size={17}/></span><h3 style={{fontSize:19,margin:"22px 0 10px"}}>{title}</h3><p className="muted" style={{fontSize:13,lineHeight:1.75,margin:0}}>{desc}</p></div>)}</div>
      <div style={{display:"flex",justifyContent:"space-between",gap:20,alignItems:"center",flexWrap:"wrap",marginTop:64,paddingTop:28,borderTop:"1px solid var(--line)"}}><div><div className="display" style={{fontSize:26}}>Build a better relationship with money.</div><p className="muted" style={{fontSize:13}}>Start with what you know. Grow from there.</p></div><Link className="btn btn-primary" href="/login">Create your account <ArrowRight size={16}/></Link></div>
    </section>
    <footer style={{borderTop:"1px solid var(--line)",padding:"22px clamp(20px,6vw,88px)",display:"flex",justifyContent:"space-between",gap:16,color:"#6e787f",fontSize:11}}><span>© {new Date().getFullYear()} SpendSense</span><span>Private by default. Clear by design.</span></footer>
    <style>{`@media(max-width:800px){section[style*="grid-template-columns:minmax(0,1.1fr)"]{grid-template-columns:1fr!important;gap:38px!important;padding-top:65px!important}}`}</style>
  </main>;
}
