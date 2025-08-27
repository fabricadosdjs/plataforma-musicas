import { Metadata } from 'next';
import { metadata } from './metadata';

export { metadata };

export default function TrendingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
