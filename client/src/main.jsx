import React,{lazy,Suspense}from'react';
import{createRoot}from'react-dom/client';
import{BrowserRouter,Navigate,Route,Routes}from'react-router-dom';
import{AuthProvider,useAuth}from'./context/AuthContext';
import Layout from'./components/Layout';
import Login from'./pages/Login';
import'./styles.css';

const Dashboard=lazy(()=>import('./pages/Dashboard'));
const Leads=lazy(()=>import('./pages/Leads'));
const Messages=lazy(()=>import('./pages/Messages'));
const Team=lazy(()=>import('./pages/Team'));
const SettingsPage=lazy(()=>import('./pages/Settings'));

function Loading(){return <div className="page-loading"><div className="brand-mark pulse">S</div></div>}
function Protected({admin=false,children}){const{user,loading}=useAuth();if(loading)return <div className="boot"><div className="brand-mark pulse">S</div></div>;if(!user)return <Navigate to="/login" replace/>;if(admin&&user.role!=='admin')return <Navigate to="/dashboard" replace/>;return children}
function App(){return <Suspense fallback={<Loading/>}><Routes><Route path="/login" element={<Login/>}/><Route element={<Protected><Layout/></Protected>}><Route index element={<Navigate to="/dashboard" replace/>}/><Route path="dashboard" element={<Dashboard/>}/><Route path="leads" element={<Leads/>}/><Route path="messages" element={<Messages/>}/><Route path="team" element={<Protected admin><Team/></Protected>}/><Route path="settings" element={<SettingsPage/>}/></Route><Route path="*" element={<Navigate to="/dashboard" replace/>}/></Routes></Suspense>}
createRoot(document.getElementById('root')).render(<React.StrictMode><BrowserRouter><AuthProvider><App/></AuthProvider></BrowserRouter></React.StrictMode>);
