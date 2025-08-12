import * as React from "react";
export function UserIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
            <circle cx={12} cy={8} r={4} />
            <path d="M6 20v-2a4 4 0 014-4h0a4 4 0 014 4v2" />
        </svg>
    );
}
