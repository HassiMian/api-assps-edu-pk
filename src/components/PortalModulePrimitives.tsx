"use client";
import type {ReactNode} from 'react';
import {Sparkles} from 'lucide-react';

/** Reusable editorial heading for actual operational screens, distinct from landing heroes. */
export function PortalModuleHeading({eyebrow,title,description,actions,children}:{eyebrow:string;title:string;description:string;actions?:ReactNode;children?:ReactNode}){
  return <header className="cw-module-heading">
    <div className="cw-module-heading-inner"><div className="min-w-0 flex-1"><p className="cw-eyebrow">{eyebrow}</p><h1>{title}</h1><p className="cw-module-lead">{description}</p>{children}</div>{actions&&<div className="cw-module-heading-actions">{actions}</div>}</div>
  </header>;
}

export function PortalSubheading({eyebrow,title,description,action}:{eyebrow?:string;title:string;description?:string;action?:ReactNode}){
  return <div className="cw-module-subheading"><div>{eyebrow&&<p className="cw-eyebrow">{eyebrow}</p>}<h2>{title}</h2>{description&&<p>{description}</p>}</div>{action}</div>;
}

export function PortalSupportNote({children}:{children:ReactNode}){
  return <div className="cw-support-note"><Sparkles size={16} aria-hidden="true"/><p>{children}</p></div>;
}
