"use client";

import Image from "next/image";
import Link from "next/link";

/** Official horizontal brand for portal pages */
export default function ApexPortalHeader() {
  return (
    <Link href="/apex" className="flex min-w-0 items-center gap-2.5 sm:gap-3">
      <Image
        src="/apex-symbol.png"
        alt=""
        width={44}
        height={44}
        className="shrink-0 object-contain drop-shadow-[0_4px_20px_rgba(180,200,220,0.3)]"
        style={{ width: 44, height: 44 }}
        priority
        draggable={false}
      />
      <Image
        src="/apex-wordmark.png"
        alt="APEX Education OS"
        width={547}
        height={135}
        className="h-8 w-auto max-w-[140px] object-contain object-left sm:max-w-[168px] sm:h-9"
        priority
        draggable={false}
      />
      <span className="sr-only">APEX Education OS</span>
    </Link>
  );
}
