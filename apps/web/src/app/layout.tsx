import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'nice_travel',
  description: '旅行攻略智能工作台与旅行记忆生成器',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

