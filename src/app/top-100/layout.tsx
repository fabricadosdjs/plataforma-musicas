import { Metadata } from 'next';
import { metadata } from './metadata';

export { metadata };

export default function Top100Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
