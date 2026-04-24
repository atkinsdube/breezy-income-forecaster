import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Breezy Income Forecaster',
  description: "Forecast next month's revenue for solo service professionals.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
