import { Geist_Mono, Playfair_Display, Geist } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider';
import './globals.css';

const mono = Geist_Mono({ variable: '--font-mono', subsets: ['latin'] });
const sans = Geist({ variable: '--font-sans', subsets: ['latin'] });
const heading = Playfair_Display({ variable: '--font-heading', subsets: ['latin'] });

export const metadata = {
  title: 'Flashcards',
  description: 'Lofi flashcard study app',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${mono.variable} ${sans.variable} ${heading.variable} h-full`}>
      <body className="min-h-full" style={{ fontFamily: 'var(--font-sans), ui-sans-serif, system-ui, sans-serif' }}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
