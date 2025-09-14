
import React, { useEffect, useMemo, useReducer, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useParams } from 'react-router-dom'
import { Upload, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

const STATUS = ["Active","Expired","Renewal Due"]
const RISK = ["Low","Medium","High"]

function useAuthStore(){
  const [state, dispatch] = useReducer((s,a)=>{
    if(a.type==='login') return { ...s, user:{ name:a.name }, token:'mock.jwt' }
    if(a.type==='logout') return { user:null, token:null }
    return s
  }, { user: JSON.parse(localStorage.getItem('user'))||null, token: localStorage.getItem('token')||null })
  const login=(name,pw)=>{ if(pw!=='test123') throw new Error('Invalid credentials'); localStorage.setItem('token','mock.jwt'); localStorage.setItem('user', JSON.stringify({name:name||'Guest'})); dispatch({type:'login', name}) }
  const logout=()=>{ localStorage.removeItem('token'); localStorage.removeItem('user'); dispatch({type:'logout'}) }
  return { ...state, login, logout }
}

const seedContracts=[
  {id:'c1', name:'MSA 2025', parties:'Microsoft & ABC Corp', expiry:'2025-12-31', status:'Active', risk:'Medium'},
  {id:'c2', name:'Network Services Agreement', parties:'TelNet & ABC Corp', expiry:'2025-10-10', status:'Renewal Due', risk:'High'},
  {id:'c3', name:'DPA Addendum', parties:'ABC Corp & DataHold', expiry:'2026-03-31', status:'Active', risk:'Low'},
  {id:'c4', name:'Reseller Agreement', parties:'ResellCo & ABC Corp', expiry:'2024-12-01', status:'Expired', risk:'Medium'}
]

function useData(){
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(()=>{(async()=>{try{const r=await fetch('/contracts.json'); if(!r.ok) throw 0; const d=await r.json(); setContracts(d)}catch{setContracts(seedContracts)}finally{setLoading(false)}})()},[])
  const getById = async(id)=>{ try{ const r=await fetch(`/contracts/${id}.json`); if(r.ok) return r.json() }catch{}_ 
    const local={
      c1:{id:'c1',name:'MSA 2025',parties:'Microsoft & ABC Corp',start:'2023-01-01',expiry:'2025-12-31',status:'Active',risk:'Medium',clauses:[{title:'Termination',summary:'90 days notice period.',confidence:.82},{title:'Liability Cap',summary:'12 months’ fees limit.',confidence:.87}],insights:[{risk:'High',message:'Liability cap excludes data breach costs.'},{risk:'Medium',message:'Renewal auto-renews unless cancelled 60 days before.'}],evidence:[{source:'Section 12.2',snippet:'Total liability limited to 12 months’ fees.',relevance:.91}]},
      c2:{id:'c2',name:'Network Services Agreement',parties:'TelNet & ABC Corp',start:'2024-02-01',expiry:'2025-10-10',status:'Renewal Due',risk:'High',clauses:[{title:'SLA',summary:'99.9% uptime with credits.',confidence:.78},{title:'Data Processing',summary:'Standard DPA terms.',confidence:.8}],insights:[{risk:'High',message:'Penalties capped at 5% monthly fees.'},{risk:'Low',message:'SLA exclusions only planned maintenance.'}],evidence:[{source:'Exhibit B',snippet:'Credits escalate after 4h downtime.',relevance:.84}]}
    }; return local[id] }
  return { contracts, loading, getById }
}

function Topbar({ user, onLogout }){
  return (
    <div className="flex h-14 items-center justify-between border-b bg-white/80 px-4 backdrop-blur">
      <Link to="/app" className="font-semibold">Contracts</Link>
      <div className="flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white">{user?.name?.[0]?.toUpperCase()||'U'}</span>
        <button onClick={onLogout} className="text-sm underline">Logout</button>
      </div>
    </div>
  )
}
function Sidebar(){
  const Item=({to,children})=><Link to={to} className="block rounded-xl px-3 py-2 text-sm hover:bg-gray-100">{children}</Link>
  return <aside className="border-r p-2"><Item to="/app">Contracts</Item><Item to="/app/insights">Insights</Item><Item to="/app/reports">Reports</Item><Item to="/app/settings">Settings</Item></aside>
}

function Login({ auth }){
  const nav=useNavigate(); const [u,setU]=useState(''); const [p,setP]=useState(''); const [e,setE]=useState('')
  useEffect(()=>{ if(auth.token) nav('/app') },[auth.token])
  const submit=(ev)=>{ ev.preventDefault(); setE(''); try{ auth.login(u,p); nav('/app') }catch(err){ setE(err.message) } }
  return (<div className="grid min-h-screen place-items-center bg-gray-50 p-4">
    <div className="w-full max-w-md card p-6">
      <h1 className="mb-1 text-2xl font-semibold">Welcome back</h1>
      <p className="mb-6 text-sm text-gray-600">Sign in to manage your contracts.</p>
      <form onSubmit={submit} className="space-y-3">
        <div><label className="text-sm">Username</label><input className="input" value={u} onChange={e=>setU(e.target.value)} /></div>
        <div><label className="text-sm">Password <span className="text-gray-400">(test123)</span></label><input type="password" className="input" value={p} onChange={e=>setP(e.target.value)} /></div>
        {e && <p className="text-sm text-red-600">{e}</p>}
        <button className="btn-primary w-full">Sign in</button>
      </form>
    </div></div>)
}

function Dashboard({ data }){
  const nav=useNavigate()
  const [q,setQ]=useState(''); const [status,setStatus]=useState('All'); const [risk,setRisk]=useState('All')
  const [page,setPage]=useState(1); const [pageSize,setPageSize]=useState(10)
  const list = useMemo(()=>{
    let xs=data.contracts
    if(q){const s=q.toLowerCase(); xs=xs.filter(c=>c.name.toLowerCase().includes(s)||c.parties.toLowerCase().includes(s))}
    if(status!=='All') xs=xs.filter(c=>c.status===status)
    if(risk!=='All') xs=xs.filter(c=>c.risk===risk)
    return xs
  },[data.contracts,q,status,risk])
  const pageData=list.slice((page-1)*pageSize, page*pageSize)
  return (<div className="p-4 space-y-3">
    <div className="flex items-center justify-between"><div><h2 className="text-xl font-semibold">Contracts</h2><p className="text-sm text-gray-600">Search & filter</p></div><button className="btn-primary"><Upload className="mr-2 h-4 w-4"/>Upload</button></div>
    <div className="grid gap-2 sm:grid-cols-3">
      <div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500"/><input className="input pl-9" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by name or parties" /></div>
      <div className="flex items-center gap-2"><Filter className="h-4 w-4 text-gray-500"/><select className="input" value={status} onChange={e=>setStatus(e.target.value)}><option>All</option>{STATUS.map(s=><option key={s}>{s}</option>)}</select><select className="input" value={risk} onChange={e=>setRisk(e.target.value)}><option>All</option>{RISK.map(r=><option key={r}>{r}</option>)}</select></div>
      <div className="flex items-center gap-2"><span className="text-sm text-gray-600">Rows</span><select className="input" value={pageSize} onChange={e=>setPageSize(Number(e.target.value))}>{[10,20,50].map(n=><option key={n}>{n}</option>)}</select></div>
    </div>
    <div className="card overflow-hidden">
      <table className="min-w-full divide-y">
        <thead className="bg-gray-50"><tr>{['Contract Name','Parties','Expiry','Status','Risk'].map(h=><th key={h} className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-600">{h}</th>)}</tr></thead>
        <tbody className="divide-y">
          {data.loading && <tr><td colSpan="5" className="p-4 text-sm text-gray-500">Loading…</td></tr>}
          {!data.loading && pageData.length===0 && <tr><td colSpan="5" className="p-6 text-center text-sm text-gray-600">No contracts yet.</td></tr>}
          {!data.loading && pageData.map(c=>(<tr key={c.id} className="hover:bg-gray-50">
            <td className="px-4 py-2 text-sm"><button onClick={()=>nav(`/app/contracts/${c.id}`)} className="text-indigo-600 hover:underline">{c.name}</button></td>
            <td className="px-4 py-2 text-sm">{c.parties}</td>
            <td className="px-4 py-2 text-sm">{new Date(c.expiry).toLocaleDateString()}</td>
            <td className="px-4 py-2 text-sm"><span className="badge">{c.status}</span></td>
            <td className="px-4 py-2 text-sm"><span className="badge">{c.risk}</span></td>
          </tr>))}
        </tbody>
      </table>
    </div>
    <div className="flex items-center justify-between"><p className="text-xs text-gray-500">Showing {(page-1)*pageSize + (list.length?1:0)}-{Math.min(page*pageSize, list.length)} of {list.length}</p><div className="flex items-center gap-2"><button className="btn" onClick={()=>setPage(p=>Math.max(1,p-1))}><ChevronLeft className="h-4 w-4"/></button><span className="text-sm">{page}</span><button className="btn" onClick={()=>setPage(p=>Math.min(Math.ceil(list.length/pageSize)||1,p+1))}><ChevronRight className="h-4 w-4"/></button></div></div>
  </div>)
}

function ContractDetail({ data }){
  const { id }=useParams(); const nav=useNavigate()
  const [detail,setDetail]=useState(null); useEffect(()=>{(async()=>{setDetail(await data.getById(id))})()},[id])
  if(!detail) return <div className="p-6">Loading…</div>
  return (<div className="p-4 space-y-4">
    <button onClick={()=>nav(-1)} className="text-sm underline"><ChevronLeft className="inline h-4 w-4"/> Back</button>
    <div className="card p-4"><div className="flex items-center justify-between"><div><h2 className="text-xl font-semibold">{detail.name}</h2><p className="text-sm text-gray-600">{detail.parties}</p></div><div className="flex items-center gap-2"><span className="badge">{detail.status}</span><span className="badge">{detail.risk}</span></div></div>
      <div className="grid gap-3 sm:grid-cols-3 mt-3"><Info label="Start" value={new Date(detail.start).toLocaleDateString()}/><Info label="Expiry" value={new Date(detail.expiry).toLocaleDateString()}/><Info label="ID" value={detail.id}/></div>
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      <div className="card p-4"><h3 className="font-semibold mb-2">Clauses</h3>{detail.clauses?.map((c,i)=>(<div key={i} className="rounded-xl border p-3 mb-2"><div className="flex items-center justify-between"><span className="font-medium">{c.title}</span><span className="badge">Conf. {(c.confidence*100).toFixed(0)}%</span></div><p className="text-sm text-gray-700 mt-1">{c.summary}</p></div>))}</div>
      <div className="card p-4"><h3 className="font-semibold mb-2">AI Insights</h3>{detail.insights?.map((x,i)=>(<div key={i} className="rounded-xl border p-3 mb-2"><div className="flex items-center justify-between"><p className="text-sm">{x.message}</p><span className="badge">{x.risk}</span></div></div>))}</div>
    </div>
    <div className="card p-4"><h3 className="font-semibold mb-2">Evidence</h3>{detail.evidence?.map((e,i)=>(<div key={i} className="rounded-xl border p-3 mb-2"><div className="flex items-center justify-between text-sm"><span>{e.source}</span><span className="badge">Rel. {(e.relevance*100).toFixed(0)}%</span></div><p className="text-sm mt-1">{e.snippet}</p></div>))}</div>
  </div>)
}
const Info=({label,value})=>(<div className="rounded-xl border p-3 text-sm"><div className="text-gray-500">{label}</div><div className="font-medium">{value}</div></div>)

function Insights({ data }){
  const byStatus = STATUS.map(s=>({name:s,value:data.contracts.filter(c=>c.status===s).length}))
  const byRisk = RISK.map(r=>({name:r,value:data.contracts.filter(c=>c.risk===r).length}))
  return (<div className="p-4 space-y-4">
    <div className="grid gap-3 sm:grid-cols-3">
      <KPI label="Total Contracts" value={data.contracts.length}/>
      <KPI label="High Risk" value={data.contracts.filter(c=>c.risk==='High').length}/>
      <KPI label="Upcoming (≤ 90d)" value={data.contracts.filter(c=>(new Date(c.expiry)-new Date())/86400000<=90 && (new Date(c.expiry)-new Date())>=0).length}/>
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      <div className="card p-4"><h3 className="font-semibold mb-2">By Status</h3><div className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={byStatus} dataKey="value" nameKey="name" outerRadius={90}>{byStatus.map((_,i)=><Cell key={i} />)}</Pie><Tooltip/></PieChart></ResponsiveContainer></div></div>
      <div className="card p-4"><h3 className="font-semibold mb-2">By Risk</h3><div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={byRisk}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis allowDecimals={false}/><Tooltip/><Bar dataKey="value"/></BarChart></ResponsiveContainer></div></div>
    </div>
  </div>)
}
const KPI=({label,value})=>(<div className="card p-4"><div className="text-sm text-gray-600">{label}</div><div className="text-2xl font-semibold">{value}</div></div>)

function Reports({ data }){
  const [risk,setRisk]=useState('All'); const [status,setStatus]=useState('All')
  const rows=data.contracts.filter(c=>(risk==='All'||c.risk===risk)&&(status==='All'||c.status===status))
  const toCSV=(rows)=>{ if(!rows.length) return ''; const headers=Object.keys(rows[0]); const esc=v=>`"${String(v).replace(/"/g,'""')}"`; return [headers.join(',')].concat(rows.map(r=>headers.map(h=>esc(r[h]??'')).join(','))).join('\n') }
  const download=(name,txt)=>{ const b=new Blob([txt],{type:'text/csv;charset=utf-8;'}); const u=URL.createObjectURL(b); const a=document.createElement('a'); a.href=u; a.download=name; a.click(); URL.revokeObjectURL(u) }
  return (<div className="p-4 space-y-3">
    <div className="flex items-center justify-between"><h2 className="text-xl font-semibold">Reports</h2><button className="btn-primary" onClick={()=>download(`contracts-${new Date().toISOString().slice(0,10)}.csv`, toCSV(rows))}>Export CSV</button></div>
    <div className="grid gap-2 sm:grid-cols-3">
      <div className="flex items-center gap-2"><span className="text-sm text-gray-600">Risk</span><select className="input" value={risk} onChange={e=>setRisk(e.target.value)}><option>All</option>{RISK.map(r=><option key={r}>{r}</option>)}</select></div>
      <div className="flex items-center gap-2"><span className="text-sm text-gray-600">Status</span><select className="input" value={status} onChange={e=>setStatus(e.target.value)}><option>All</option>{STATUS.map(s=><option key={s}>{s}</option>)}</select></div>
    </div>
    <div className="card overflow-hidden"><table className="min-w-full divide-y"><thead className="bg-gray-50"><tr>{['ID','Name','Parties','Expiry','Status','Risk'].map(h=><th key={h} className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-600">{h}</th>)}</tr></thead><tbody className="divide-y">{rows.map(r=>(<tr key={r.id}><td className="px-4 py-2 text-sm">{r.id}</td><td className="px-4 py-2 text-sm">{r.name}</td><td className="px-4 py-2 text-sm">{r.parties}</td><td className="px-4 py-2 text-sm">{new Date(r.expiry).toLocaleDateString()}</td><td className="px-4 py-2 text-sm">{r.status}</td><td className="px-4 py-2 text-sm">{r.risk}</td></tr>))}</tbody></table></div>
  </div>)
}

function Settings(){
  return (<div className="p-4 space-y-4"><h2 className="text-xl font-semibold">Settings</h2><div className="card p-4 text-sm text-gray-600">Theme/density defaults can be added here (kept compact for the demo build).</div></div>)
}

function Protected({ token, children }){ return token ? children : <Navigate to="/login" replace /> }

export default function App(){
  const auth = useAuthStore(); const data = useData()
  return (<BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login auth={auth} />} />
      <Route path="/app" element={<Protected token={auth.token}><div className="grid min-h-screen grid-rows-[auto_1fr]"><Topbar user={auth.user} onLogout={auth.logout}/><div className="grid grid-cols-1 sm:grid-cols-[220px_1fr]"><Sidebar/><main><Dashboard data={data}/></main></div></div></Protected>} />
      <Route path="/app/contracts/:id" element={<Protected token={auth.token}><div className="grid min-h-screen grid-rows-[auto_1fr]"><Topbar user={auth.user} onLogout={auth.logout}/><div className="grid grid-cols-1 sm:grid-cols-[220px_1fr]"><Sidebar/><main><ContractDetail data={data}/></main></div></div></Protected>} />
      <Route path="/app/insights" element={<Protected token={auth.token}><div className="grid min-h-screen grid-rows-[auto_1fr]"><Topbar user={auth.user} onLogout={auth.logout}/><div className="grid grid-cols-1 sm:grid-cols-[220px_1fr]"><Sidebar/><main><Insights data={data}/></main></div></div></Protected>} />
      <Route path="/app/reports" element={<Protected token={auth.token}><div className="grid min-h-screen grid-rows-[auto_1fr]"><Topbar user={auth.user} onLogout={auth.logout}/><div className="grid grid-cols-1 sm:grid-cols-[220px_1fr]"><Sidebar/><main><Reports data={data}/></main></div></div></Protected>} />
      <Route path="/app/settings" element={<Protected token={auth.token}><div className="grid min-h-screen grid-rows-[auto_1fr]"><Topbar user={auth.user} onLogout={auth.logout}/><div className="grid grid-cols-1 sm:grid-cols-[220px_1fr]"><Sidebar/><main><Settings/></main></div></div></Protected>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </BrowserRouter>)
}
