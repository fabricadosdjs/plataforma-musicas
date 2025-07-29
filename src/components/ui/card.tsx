export function CardHeader({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div {...props} className={"mb-4 " + (props.className || "")}>{children}</div>;
}
export function CardTitle({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return <h3 {...props} className={"text-xl font-bold mb-2 " + (props.className || "")}>{children}</h3>;
}
import React from "react";

export function Card({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div {...props} className={"bg-gray-900 rounded-2xl shadow-lg p-8 " + (props.className || "")}>{children}</div>;
}
export function CardContent({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div {...props} className={" " + (props.className || "")}>{children}</div>;
}
