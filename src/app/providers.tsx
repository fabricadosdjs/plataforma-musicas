"use client";

import { AppProvider } from "@/context/AppContext";
import { SessionProvider } from "next-auth/react";
import React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <AppProvider>{children}</AppProvider>
        </SessionProvider>
    );
}
