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
}

export default function SEO({
  title,
  description,
  keywords,
  ogImage = 'https://readdy.ai/api/search-image?query=Professional%20therapy%20and%20counseling%20services%2C%20modern%20minimalist%20office%20interior%2C%20warm%20and%20welcoming%20atmosphere%2C%20soft%20natural%20lighting%2C%20professional%20setting%2C%20high%20quality%20photography&width=1200&height=630&seq=seo-og&orientation=landscape',
  ogType = 'website',
  canonical,
  schema,
  lastModified
}: SEOProps) {
  const siteUrl = 'https://re-set.com.tr';
  const fullTitle = `${title} | Reset - Şafak Özkan Danışmanlık`;
  const canonicalUrl = canonical ? `${siteUrl}${canonical}` : siteUrl;

  useEffect(() => {
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
    }
    setMetaTag('author', 'Şafak Özkan');
    setMetaTag('robots', 'index, follow');
    setMetaTag('language', 'Turkish');
    setMetaTag('revisit-after', '7 days');
    
    if (lastModified) {
      setMetaTag('last-modified', lastModified);
    }

    // Open Graph tags
    setMetaTag('og:title', fullTitle, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:type', ogType, true);
    setMetaTag('og:url', canonicalUrl, true);
    setMetaTag('og:image', ogImage, true);
    setMetaTag('og:site_name', 'Reset - Şafak Özkan Danışmanlık', true);
    setMetaTag('og:locale', 'tr_TR', true);

    // Twitter Card tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', fullTitle);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', ogImage);

    // Canonical URL
    setLinkTag('canonical', canonicalUrl);

    // Schema.org JSON-LD
    if (schema) {
      let scriptElement = document.querySelector('script[type="application/ld+json"]');
      
      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.setAttribute('type', 'application/ld+json');
        document.head.appendChild(scriptElement);
      }
      
      scriptElement.textContent = JSON.stringify(schema);
    }

    // Cleanup function
    return () => {
      // Optional: Remove meta tags on unmount if needed
    };
  }, [title, description, keywords, ogImage, ogType, canonical, schema, lastModified, fullTitle, canonicalUrl]);

  return null;
}
