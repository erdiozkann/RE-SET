import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
  schema?: object;
  lastModified?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

export default function SEO({
  title,
  description,
  keywords,
  ogImage = '/og-image.jpg',
  ogType = 'website',
  canonical,
  schema,
  lastModified,
  noindex = false,
  nofollow = false
}: SEOProps) {
  const siteUrl = (import.meta.env.VITE_SITE_URL || 'https://re-set.com.tr').replace(/\/$/, '');
  // Sayfalar tam (markalı) başlık geçirir — burada tekrar ek YAPMA (çift-suffix olurdu).
  const fullTitle = title;
  // og:image her zaman mutlak URL olmalı
  const ogImageUrl = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage.startsWith('/') ? '' : '/'}${ogImage}`;

  useEffect(() => {
    const canonicalPath = canonical || window.location.pathname || '/';
    const canonicalUrl = canonicalPath.startsWith('http')
      ? canonicalPath
      : new URL(canonicalPath, `${siteUrl}/`).toString();
    const robotsDirectives = `${noindex ? 'noindex' : 'index'}, ${nofollow ? 'nofollow' : 'follow'}`;

    // Set document title
    document.title = fullTitle;

    // Helper function to set or update meta tags
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    const removeMetaTag = (name: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      const element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (element) {
        element.remove();
      }
    };

    // Set or update link tags
    const setLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      
      element.href = href;
    };

    // Basic meta tags
    setMetaTag('description', description);
    if (keywords) {
      setMetaTag('keywords', keywords);
    } else {
      removeMetaTag('keywords');
    }
    setMetaTag('author', 'Şafak Özkan');
    setMetaTag('robots', robotsDirectives);

    if (lastModified) {
      setMetaTag('last-modified', lastModified);
    } else {
      removeMetaTag('last-modified');
    }

    // Open Graph tags
    setMetaTag('og:title', fullTitle, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:type', ogType, true);
    setMetaTag('og:url', canonicalUrl, true);
    setMetaTag('og:image', ogImageUrl, true);
    setMetaTag('og:site_name', 'RE-SET — Şafak Özkan', true);
    setMetaTag('og:locale', 'tr_TR', true);

    // Twitter Card tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', fullTitle);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', ogImageUrl);

    // Canonical URL
    setLinkTag('canonical', canonicalUrl);

    // Schema.org JSON-LD
    if (schema) {
      let scriptElement = document.querySelector('#seo-json-ld') as HTMLScriptElement | null;
      
      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.id = 'seo-json-ld';
        scriptElement.setAttribute('type', 'application/ld+json');
        document.head.appendChild(scriptElement);
      }
      
      scriptElement.textContent = JSON.stringify(schema);
    } else {
      const existingSchema = document.querySelector('#seo-json-ld');
      if (existingSchema) {
        existingSchema.remove();
      }
    }

    // Cleanup function
    return () => {
      // Optional: Remove meta tags on unmount if needed
    };
  }, [title, description, keywords, ogImageUrl, ogType, canonical, schema, lastModified, fullTitle, noindex, nofollow, siteUrl]);

  return null;
}
