export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-full items-center justify-center px-4 py-10">
      {children}
    </div>
  );
}
