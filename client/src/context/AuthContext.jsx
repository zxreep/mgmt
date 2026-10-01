import {createContext,useContext,useEffect,useState} from 'react';
import {api} from '../api';
const AuthContext=createContext(null);
export function AuthProvider({children}){
 const [user,setUser]=useState(null),[loading,setLoading]=useState(true);
 useEffect(()=>{api('/auth/me').then(x=>setUser(x.user)).catch(()=>{}).finally(()=>setLoading(false));},[]);
 const login=async(credentials)=>{const x=await api('/auth/login',{method:'POST',body:credentials});setUser(x.user);};
 const logout=async()=>{await api('/auth/logout',{method:'POST'});setUser(null);};
 return <AuthContext.Provider value={{user,setUser,loading,login,logout}}>{children}</AuthContext.Provider>;
}
export const useAuth=()=>useContext(AuthContext);
