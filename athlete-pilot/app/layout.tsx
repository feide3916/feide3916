import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "运动员训练工作台",
  description: "训练计划、实际完成记录与长期追踪",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
