import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Expense Tracker',
  description: 'Track your expenses on Vercel',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
