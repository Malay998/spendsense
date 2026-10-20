import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AppShell } from "@/components/app-shell";
import { Activity, Users, ShieldAlert } from "lucide-react";

export default async function AdminPage() {
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/login");
  if(user.app_metadata?.role!=="admin") redirect("/dashboard");
  const admin=createAdminClient();
  const {data:{users},error:userError}=await admin.auth.admin.listUsers({page:1,perPage:100});
  const {data:events,error:eventError}=await admin.from("activity_events").select("id,user_id,event_type,metadata,created_at").order("created_at",{ascending:false}).limit(100);
  const emails=new Map((users??[]).map(u=>[u.id,u.email??"No email"]));
  return <AppShell active=""><div className="topbar"><div><div className="eyebrow">OPERATIONS · RESTRICTED</div><h1 className="page-title">Admin console</h1><p className="muted" style={{fontSize:13,marginTop:9}}>Account and product activity. Financial transaction details are intentionally excluded.</p></div><span className="pill pill-lime"><ShieldAlert size={13}/> Admin</span></div>
    {(userError||eventError)&&<div className="panel-soft negative" style={{marginBottom:14}}>Admin data could not be loaded. Check the server-only service key and permissions.</div>}
    <div className="grid-2"><div className="panel"><span className="metric-icon"><Users size={17}/></span><div className="eyebrow" style={{marginTop:20}}>REGISTERED ACCOUNTS</div><div className="metric-value">{users?.length??0}</div><p className="muted small">First 100 accounts returned by the admin API.</p></div><div className="panel"><span className="metric-icon"><Activity size={17}/></span><div className="eyebrow" style={{marginTop:20}}>RECENT PRODUCT EVENTS</div><div className="metric-value">{events?.length??0}</div><p className="muted small">Up to 100 recent tracked events.</p></div></div>
    <section className="panel" style={{marginTop:16}}><div className="section-head"><h2 className="section-title">Accounts</h2><span className="pill">Email + status</span></div><div className="table-wrap"><table className="table"><thead><tr><th>Email</th><th>Created</th><th>Verified</th><th>Last sign-in</th></tr></thead><tbody>{(users??[]).map(u=><tr key={u.id}><td>{u.email}</td><td className="muted">{u.created_at?.slice(0,10)??"—"}</td><td>{u.email_confirmed_at?"Verified":"Pending"}</td><td className="muted">{u.last_sign_in_at?.replace("T"," ").slice(0,16)??"Never"}</td></tr>)}</tbody></table></div></section>
    <section className="panel" style={{marginTop:16}}><div className="section-head"><h2 className="section-title">Recent activity</h2><span className="pill">No amounts or descriptions</span></div><div className="table-wrap"><table className="table"><thead><tr><th>Event</th><th>Account</th><th>Time</th></tr></thead><tbody>{(events??[]).map(e=><tr key={e.id}><td>{e.event_type}</td><td className="muted">{emails.get(e.user_id)??e.user_id.slice(0,8)}</td><td className="muted">{e.created_at?.replace("T"," ").slice(0,16)}</td></tr>)}</tbody></table></div><p className="small muted" style={{marginTop:12}}>Activity tracking is limited to events inserted by the app. This is not a complete audit trail of every click or request.</p></section>
  </AppShell>;
}
