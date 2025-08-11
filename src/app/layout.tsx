
import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Toaster } from '@/components/ui/toaster';
import { AuthDialogProvider } from '@/context/AuthDialogContext';

export const metadata: Metadata = {
  metadataBase: new URL('https://inshoyim.uz'), // Replace with your actual domain
  title: {
    default: 'Inshoyim - O‘qing, Yozing, Ulashing',
    template: '%s | Inshoyim',
  },
  description: 'O‘zbek tilidagi insholar, tahlillar va ijodiy yozuvlar uchun zamonaviy platforma. O‘qing, o‘zingiznikini yozing va fikrlaringizni butun dunyo bilan baham ko‘ring.',
  keywords: ['insho', 'maqola', 'tahlil', 'o‘zbek adabiyoti', 'yozish', 'ijod', 'blog', 'o‘zbekcha'],
  openGraph: {
    title: 'Inshoyim - O‘qing, Yozing, Ulashing',
    description: 'O‘zbek tilidagi insholar va ijodiy yozuvlar uchun platforma.',
    type: 'website',
    locale: 'uz_UZ',
    url: 'https://inshoyim.uz', // Replace with your actual domain
    siteName: 'Inshoyim',
    images: [
      {
        url: '/og-image.png', // Replace with a link to your open graph image
        width: 1200,
        height: 630,
        alt: 'Inshoyim Platformasi',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inshoyim - O‘qing, Yozing, Ulashing',
    description: 'O‘zbek tilidagi insholar, tahlillar va ijodiy yozuvlar uchun zamonaviy platforma.',
     images: ['/twitter-image.png'], // Replace with a link to your twitter image
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='blue' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M4 19.5A2.5 2.5 0 0 1 6.5 17H20'></path><path d='M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z'></path></svg>" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,700;1,7..72,400&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('font-body antialiased min-h-screen flex flex-col')}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthDialogProvider>
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
            <Toaster />
          </AuthDialogProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
