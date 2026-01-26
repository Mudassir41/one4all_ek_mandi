import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/contexts/I18nContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { BiddingProvider } from "@/contexts/BiddingContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ClientI18nInitializer } from "@/components/ClientI18nInitializer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ek Bharath Ek Mandi | एक भारत एक मंडी",
  description: "India's Voice-First Cross-State Trading Platform | भारत का आवाज-प्रथम अंतर-राज्यीय व्यापार मंच",
  keywords: "agriculture, trading, multilingual, voice, AI, India, मंडी, व्यापार",
  openGraph: {
    title: "Ek Bharath Ek Mandi",
    description: "Connecting regional vendors with national buyers through AI voice translation",
    type: "website",
    locale: "en_IN",
    alternateLocale: ["hi_IN", "ta_IN", "te_IN", "kn_IN", "bn_IN", "or_IN", "ml_IN"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="theme-indian">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Load Indian language fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Noto+Sans+Tamil:wght@400;500;600;700&family=Noto+Sans+Telugu:wght@400;500;600;700&family=Noto+Sans+Kannada:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;600;700&family=Noto+Sans+Oriya:wght@400;500;600;700&family=Noto+Sans+Malayalam:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Language alternates for SEO */}
        <link rel="alternate" hrefLang="en" href="/" />
        <link rel="alternate" hrefLang="hi" href="/hi" />
        <link rel="alternate" hrefLang="ta" href="/ta" />
        <link rel="alternate" hrefLang="te" href="/te" />
        <link rel="alternate" hrefLang="kn" href="/kn" />
        <link rel="alternate" hrefLang="bn" href="/bn" />
        <link rel="alternate" hrefLang="or" href="/or" />
        <link rel="alternate" hrefLang="ml" href="/ml" />
        <link rel="alternate" hrefLang="x-default" href="/" />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ClientI18nInitializer />
        <LanguageProvider>
          <I18nProvider>
            <ThemeProvider>
              <AuthProvider>
                <BiddingProvider>
                  {children}
                </BiddingProvider>
              </AuthProvider>
            </ThemeProvider>
          </I18nProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
