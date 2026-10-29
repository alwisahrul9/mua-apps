export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="public-light min-h-dvh bg-background text-foreground">
            {children}
        </div>
    );
}
