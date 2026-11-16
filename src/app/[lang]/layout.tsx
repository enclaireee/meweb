import type { Metadata } from 'next';
import { Cormorant_Garamond, Source_Sans_3 } from 'next/font/google';
import { notFound } from 'next/navigation';
import { ui, type Lang } from '@/content';
import '../globals.css';

// Display: Cormorant at 600 over art (500 is too thin on textured paper). Body: Source Sans 3, a humanist sans whose
// open shapes and compact width keep long Indonesian words in bounds and sit well beside Cormorant.
const display = Cormorant_Garamond({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-display', display: 'swap' });
// Italic as its own instance: one call with both styles breaks Turbopack dev ("queries have exactly one entry").
const displayItalic = Cormorant_Garamond({ subsets: ['latin'], weight: '600', style: 'italic', variable: '--font-display-italic', display: 'swap' });
const body = Source_Sans_3({ subsets: ['latin'], weight: ['400', '600'], variable: '--font-body', display: 'swap' });

export const dynamicParams = false;
export const generateStaticParams = () => [{ lang: 'en' }, { lang: 'id' }];

// Before paint: .js (the world replaces the plain page), and .intro-wait when the opening may play: the main lane
// (/en or /id), at the top, no hash, no reduced motion. The engine removes it on its first intro frame or skip.
const INIT = `(function(d){d.classList.add('js');try{if(/^\\/(en|id)\\/?$/.test(location.pathname)&&!location.hash&&!scrollY&&!matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('intro-wait')}catch(e){}})(document.documentElement)`;

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
    <html lang={lang} className={`${display.variable} ${displayItalic.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: INIT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
