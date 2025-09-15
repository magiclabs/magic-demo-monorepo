"use client";

import { MagicService } from "@/lib/get-magic";
import "../../globals.css";
import { useEffect } from "react";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    
    useEffect(() => {
        // initialize Magic
        MagicService.magic
        
    }, [])

  return (
    <>{children}</>
  );
}
