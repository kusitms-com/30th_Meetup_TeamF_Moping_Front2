// app/layout.tsx
import "../styles/globals.css";

export const metadata = {
  title: "My App",
  description: "Generated by Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="font-pretendard bg-gray-100">{children}</body>
    </html>
  );
}
