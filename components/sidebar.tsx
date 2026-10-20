import Link from "next/link";
import { Activity, ArrowLeftRight, CircleHelp, CreditCard, LayoutDashboard, LogOut, Settings2, Target } from "lucide-react";
import { signOut } from "@/app/actions";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/budgets", label: "Budgets", icon: Target },
  { href: "/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/insights", label: "Insights", icon: Activity }
];

export function Sidebar({ active, email }: { active: string; email: string }) {
  return <aside className="sidebar">
    <Link href="/dashboard" className="brand"><span className="brand-mark">S</span> spendsense<span style={{color:"var(--lime)"}}>.</span></Link>
    <div className="nav-group"><div className="nav-label">Workspace</div>{links.map(({href,label,icon:Icon})=><Link key={href} href={href} className={`nav-link ${active===href?"active":""}`}><Icon size={16}/>{label}</Link>)}</div>
    <div className="nav-group"><div className="nav-label">Account</div><Link href="/settings" className={`nav-link ${active==="/settings"?"active":""}`}><Settings2 size={16}/> Settings</Link><Link href="/help" className={`nav-link ${active==="/help"?"active":""}`}><CircleHelp size={16}/> Help & privacy</Link></div>
    <div className="side-bottom panel-soft"><div style={{display:"flex",gap:10,alignItems:"center"}}><div className="metric-icon" style={{width:32,height:32,borderRadius:99}}>{email.slice(0,1).toUpperCase()}</div><div style={{minWidth:0}}><div style={{fontSize:12,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:145}}>{email}</div><div className="small muted" style={{marginTop:3}}>Personal workspace</div></div></div><form action={signOut} style={{marginTop:16}}><button className="btn btn-quiet" style={{width:"100%",justifyContent:"flex-start"}}><LogOut size={15}/> Sign out</button></form></div>
  </aside>;
}
