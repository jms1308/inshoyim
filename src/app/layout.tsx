
import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Toaster } from '@/components/ui/toaster';
import { AuthDialogProvider } from '@/context/AuthDialogContext';

export const metadata: Metadata = {
  metadataBase: new URL('https://inshoyim.uz'),
  title: {
    default: 'Inshoyim | O‘zbekcha Insholar, Maqolalar Yozish va O‘qish',
    template: '%s | Inshoyim',
  },
  description: 'Inshoyim – o‘zbek tilidagi insholar, maqolalar va ijodiy yozuvlar uchun eng yaxshi platforma. Bu yerda o‘qing, o‘zingiznikini yozing, fikrlaringizni ulashing va o‘zbek adabiyotini boyiting.',
  keywords: [
    'insho', 'insholar', 'insho yozish', 'maqola', 'maqolalar', 'tahlil', 
    'o‘zbek adabiyoti', 'yozish', 'yozuvchi', 'ijod', 'blog', 'o‘zbekcha', 
    'matn', 'esse', 'hikoya', 'o‘zbek tilida insho', 'adabiyot'
  ],
  openGraph: {
    title: 'Inshoyim | O‘zbekcha Insholar, Maqolalar Yozish va O‘qish',
    description: 'O‘zbek tilidagi insholar va ijodiy yozuvlar uchun zamonaviy platforma.',
    type: 'website',
    locale: 'uz_UZ',
    url: 'https://inshoyim.uz',
    siteName: 'Inshoyim',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Inshoyim Platformasi',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inshoyim | O‘zbekcha Insholar, Maqolalar Yozish va O‘qish',
    description: 'O‘zbek tilidagi insholar, tahlillar va ijodiy yozuvlar uchun zamonaviy platforma.',
    images: ['/twitter-image.png'],
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
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📖</text></svg>" />
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
