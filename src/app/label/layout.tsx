
import { Metadata } from 'next';
import { metadata } from './metadata';

export { metadata };

export default function LabelLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
