"use client";
import ConnectWorkspaceShell from './ConnectWorkspaceShell';
/** Kept as a compatibility alias; all faculty layout now comes from the unified system. */
export default function TeacherWorkspaceShell({children,title}:{children:React.ReactNode;title:string}){
 return <ConnectWorkspaceShell role="teacher" title={title}>{children}</ConnectWorkspaceShell>;
}
