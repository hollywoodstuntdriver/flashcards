import { Geist_Mono } from 'next/font/google';
import './globals.css';

const mono = Geist_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'Flashcards',
  description: 'Lofi flashcard study app',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${mono.variable} h-full`}>
      <body className="min-h-full" style={{ fontFamily: 'var(--font-mono), ui-monospace, monospace' }}>
        {children}
      </body>
    </html>
  );
}
