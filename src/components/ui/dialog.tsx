export function DialogContent({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div {...props} className={"bg-zinc-900 border-zinc-700 max-w-md p-6 rounded-lg " + (props.className || "")}>{children}</div>;
}
export function DialogHeader({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div {...props} className={"mb-4 " + (props.className || "")}>{children}</div>;
}
export function DialogTitle({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return <h2 {...props} className={"text-lg font-bold mb-2 " + (props.className || "")}>{children}</h2>;
}
export function DialogTrigger({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return <button type="button" {...props}>{children}</button>;
}
import React from "react";

export function Dialog({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div {...props} className={"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 " + (props.className || "")}>{children}</div>;
}
