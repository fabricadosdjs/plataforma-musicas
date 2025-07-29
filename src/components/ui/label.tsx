import React from "react";

export function Label({ children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
    return <label {...props} className={"block text-sm font-medium mb-1 " + (props.className || "")}>{children}</label>;
}
