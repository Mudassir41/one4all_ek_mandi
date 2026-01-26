import { languages } from './i18n';

// Generate hreflang links for SEO
export const generateHreflangLinks = (currentPath: string = '/') => {
  return languages.map(lang => ({
    hrefLang: lang.code,
    href: lang.code === 'en' ? currentPath : `/${lang.code}${currentPath}`
  }));
};

// Generate structured data for multilingual content
export const generateMultilingualStructuredData = (
  title: string,
  description: string,
  currentLang: string = 'en'
) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ekbharatekamandi.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: title,
    description: description,
    url: baseUrl,
    inLanguage: currentLang,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    },
    sameAs: languages.map(lang => 
      lang.code === 'en' ? baseUrl : `${baseUrl}/${lang.code}`
    )
  };
};

// Generate Open Graph data for different languages
export const generateOpenGraphData = (
  title: string,
  description: string,
  currentLang: string = 'en',
  imagePath?: string
) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ekbharatekamandi.com';
  const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0];
  
  return {
    title,
    description,
    type: 'website',
    locale: `${currentLang}_IN`,
    alternateLocale: languages
      .filter(lang => lang.code !== currentLang)
      .map(lang => `${lang.code}_IN`),
    siteName: 'Ek Bharath Ek Mandi',
    images: imagePath ? [{
      url: `${baseUrl}${imagePath}`,
      width: 1200,
      height: 630,
      alt: title
    }] : undefined
  };
};

// Generate Twitter Card data
export const generateTwitterCardData = (
  title: string,
  description: string,
  imagePath?: string
) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ekbharatekamandi.com';
  
  return {
    card: 'summary_large_image',
    title,
    description,
    images: imagePath ? [`${baseUrl}${imagePath}`] : undefined,
    creator: '@EkBharatEkMandi'
  };
};

// Language-specific meta tags
export const generateLanguageMetaTags = (currentLang: string = 'en') => {
  const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0];
  
  return {
    language: currentLang,
    'content-language': currentLang,
    'http-equiv': 'content-language',
    content: currentLang,
    // Cultural context
    'cultural-context': currentLanguage.region,
    'script': currentLanguage.script,
    'text-direction': currentLanguage.dir
  };
};

// Generate canonical URLs for different languages
export const generateCanonicalUrls = (currentPath: string = '/') => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ekbharatekamandi.com';
  
  return {
    canonical: `${baseUrl}${currentPath}`,
    alternates: languages.reduce((acc, lang) => {
      acc[lang.code] = lang.code === 'en' 
        ? `${baseUrl}${currentPath}`
        : `${baseUrl}/${lang.code}${currentPath}`;
      return acc;
    }, {} as Record<string, string>)
  };
};

// Sitemap generation helper
export const generateSitemapUrls = (paths: string[]) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ekbharatekamandi.com';
  
  return paths.flatMap(path => 
    languages.map(lang => ({
      url: lang.code === 'en' 
        ? `${baseUrl}${path}`
        : `${baseUrl}/${lang.code}${path}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: path === '/' ? 1.0 : 0.8,
      alternateRefs: languages.map(altLang => ({
        href: altLang.code === 'en'
          ? `${baseUrl}${path}`
          : `${baseUrl}/${altLang.code}${path}`,
        hreflang: altLang.code
      }))
    }))
  );
};