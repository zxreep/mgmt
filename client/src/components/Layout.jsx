import {NavLink,Outlet,useLocation} from 'react-router-dom';
import {LayoutDashboard,UsersRound,MessageSquareText,Settings,LogOut,Menu,X,MapPinned,ChevronDown} from 'lucide-react';
import {useAuth} from '../context/AuthContext';
import {useEffect,useState} from 'react';
import {cx} from '../api';
const titles={dashboard:['Command center','A live view of your sales pipeline'],leads:['Leads','Find, contact and move opportunities forward'],messages:['Messages','Reusable WhatsApp templates for faster outreach'],team:['Team & assignments','Manage access and district ownership'],settings:['Settings','Customize your workspace and account']};
export default function Layout(){
 const {user,logout}=useAuth(),[open,setOpen]=useState(false),[profile,setProfile]=useState(false),location=useLocation();
 const key=location.pathname.split('/')[1]||'dashboard';useEffect(()=>setOpen(false),[location.pathname]);
 const nav=[['/dashboard',LayoutDashboard,'Dashboard'],['/leads',MapPinned,'Leads'],['/messages',MessageSquareText,'Messages'],...(user.role==='admin'?[['/team',UsersRound,'Team']]:[]),['/settings',Settings,'Settings']];
 return <div className="app-shell">
  <aside className={cx('sidebar',open&&'sidebar-open')}><div className="brand"><div className="brand-mark">S</div><div><strong>SalesPulse</strong><span>TEAM CRM</span></div><button className="mobile-close" onClick={()=>setOpen(false)}><X/></button></div>
   <nav>{nav.map(([to,Icon,label])=><NavLink key={to} to={to} className={({isActive})=>cx('nav-link',isActive&&'active')}><Icon size={19}/><span>{label}</span></NavLink>)}</nav>
   <div className="sidebar-foot"><div className="mini-user"><div className="avatar">{user.name?.[0]?.toUpperCase()}</div><div><strong>{user.name}</strong><span>{user.role==='admin'?'Administrator':'Team member'}</span></div></div></div>
  </aside>{open&&<div className="side-overlay" onClick={()=>setOpen(false)}/>}<main className="main"><header className="topbar"><button className="menu-btn" onClick={()=>setOpen(true)}><Menu/></button><div className="page-title"><h1>{titles[key]?.[0]||'SalesPulse'}</h1><p>{titles[key]?.[1]}</p></div><div className="profile-wrap"><button className="profile-button" onClick={()=>setProfile(!profile)}><div className="avatar small">{user.name?.[0]}</div><span>{user.name}</span><ChevronDown size={15}/></button>{profile&&<div className="profile-menu"><div><strong>{user.name}</strong><span>@{user.username}</span></div><button onClick={logout}><LogOut size={16}/> Sign out</button></div>}</div></header><div className="content"><Outlet/></div></main>
 </div>;
}
