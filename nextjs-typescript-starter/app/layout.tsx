import './globals.css';

import { GeistSans } from 'geist/font/sans';

let title = 'Lexicon Note · 每天留下一个词';
let description = '一个安静、可持续的英语单词学习空间。';

export const metadata = {
  title,
  description,
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
  metadataBase: new URL('https://danci.vercel.app'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={GeistSans.variable}>{children}</body>
    </html>
  );
}
