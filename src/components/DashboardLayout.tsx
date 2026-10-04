"use client";

import {useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {useAuth} from '@/context/AuthContext';
import ConnectWorkspaceShell from './ConnectWorkspaceShell';
import PremiumLogo from './PremiumLogo';

type Role='admin'|'teacher'|'student'|'parent';

/** APEX Connect v3: authentication gate only. Visual identity lives in ConnectWorkspaceShell. */
export default function DashboardLayout({children,role,title}:{children:React.ReactNode;role:Role;title:string}){
 const {user,loading}=useAuth();
 const router=useRouter();
 useEffect(()=>{if(!loading&&!user)router.replace(`/login?next=%2F${role}`)},[loading,user,router,role]);
 if(loading)return <div className="flex min-h-screen items-center justify-center bg-[#F6F6F2] p-5 text-[#26362D]" role="status" aria-live="polite"><div className="w-full max-w-sm rounded-3xl border border-[#E3E8E1] bg-white px-7 py-8 text-center shadow-[0_14px_38px_#3146300b]"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF2EC]"><PremiumLogo src='/ilm-logo.svg' size={43}/></div><h2 className="mt-5 font-serif text-xl font-semibold">Preparing your workspace</h2><p className="mt-2 text-xs leading-6 text-[#55645B]">Securely restoring your APEX Connect session.</p><span className="mx-auto mt-5 block h-1.5 w-36 animate-pulse rounded-full bg-[#88B097]"/></div></div>;
 if(!user)return null;
 return <ConnectWorkspaceShell role={role} title={title}>{children}</ConnectWorkspaceShell>;
}
