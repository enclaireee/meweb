import type { Metadata } from 'next';
import { Cormorant_Garamond } from 'next/font/google';
import { notFound } from 'next/navigation';
import { ui, type Lang } from '@/content';
import '../globals.css';

const display = Cormorant_Garamond({ subsets: ['latin'], weight: ['500', '600'], variable: '--font-display', display: 'swap' });
// Italic as its own instance: one call with both styles breaks Turbopack dev ("queries have exactly one entry").
const displayItalic = Cormorant_Garamond({ subsets: ['latin'], weight: '500', style: 'italic', variable: '--font-display-italic', display: 'swap' });

export const dynamicParams = false;
export const generateStaticParams = () => [{ lang: 'en' }, { lang: 'id' }];

const isLang = (l: string): l is Lang => l === 'en' || l === 'id';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  return {
    title: ui.site.title[lang],
    description: ui.site.description[lang],
    alternates: { canonical: `/${lang}`, languages: { en: '/en', id: '/id' } },
  };
}

export default async function RootLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return (
    // The inline script adds .js before paint (so the class differs from the server HTML).
    <html lang={lang} className={`${display.variable} ${displayItalic.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
