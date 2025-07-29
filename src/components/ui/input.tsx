import React from "react";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return <input {...props} className={"px-3 py-2 rounded border bg-zinc-900 text-white " + (props.className || "")} />;
}
