import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ProSlate — India\'s Verified Surface Finishing Network',
  description: 'Tile, Marble, Epoxy, Waterproofing — Done Right. Every Time. India\'s first verified surface finishing labor execution platform.',
  keywords: 'tile laying, marble installation, epoxy flooring, waterproofing, surface finishing, Bengaluru, verified workers',
  authors: [{ name: 'ProSlate' }],
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
  openGraph: {
    title: 'ProSlate — India\'s Verified Surface Finishing Network',
    description: 'Tile, Marble, Epoxy, Waterproofing — Done Right. Every Time.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#1A1A2E',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
