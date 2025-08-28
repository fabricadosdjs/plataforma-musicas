import { generateMetadata } from './metadata';

export { generateMetadata };

export default function FolderLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
