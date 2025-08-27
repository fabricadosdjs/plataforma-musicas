import { Metadata } from 'next';
import { generateMetadata } from './metadata';

export { generateMetadata };

export default function PoolLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
