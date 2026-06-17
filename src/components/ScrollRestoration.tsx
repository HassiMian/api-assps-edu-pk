"use client";

import { useEffect, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

function keyFor(pathname: string, search: string) {
  return `apex_connect_window_scroll_${pathname}${search ? `?${search}` : ""}`;
}

export default function ScrollRestoration() {
  const pathname = usePathname();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useLayoutEffect(() => {
    const key = keyFor(pathname, window.location.search);
    const saved = sessionStorage.getItem(key);
    const target = saved != null ? parseInt(saved, 10) : 0;

    let raf1 = 0;
    let raf2 = 0;
    const restore = () => {
      window.scrollTo({ top: Number.isFinite(target) ? target : 0, left: 0, behavior: "auto" });
    };

    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(restore);
    });

    const onScroll = () => {
      sessionStorage.setItem(key, String(window.scrollY));
    };

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) restore();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pageshow", onPageShow);

    return () => {
      sessionStorage.setItem(key, String(window.scrollY));
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pageshow", onPageShow);
      if (raf1) cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [pathname]);

  return null;
}
