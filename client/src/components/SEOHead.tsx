import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  canonical?: string;
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
}

export default function SEOHead({
  title = "OD News - भारत की प्रमुख समाचार वेबसाइट",
  description = "OD News पर पढ़ें ताजा समाचार, राजनीति, खेल, मनोरंजन, व्यापार और तकनीक की खबरें। भारत और दुनिया की सबसे तेज़ और सच्ची न्यूज़।",
  keywords = "समाचार, न्यूज़, भारत, राजनीति, खेल, मनोरंजन, व्यापार, तकनीक, हिंदी न्यूज़, OD News",
  ogTitle,
  ogDescription,
  ogImage = "/api/assets/og-image.jpg",
  ogUrl,
  canonical,
  article
}: SEOHeadProps) {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta tags
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('author', 'OD News');
    updateMetaTag('robots', 'index, follow');
    updateMetaTag('viewport', 'width=device-width, initial-scale=1');
    
    // Open Graph tags
    updateMetaTag('og:type', article ? 'article' : 'website', true);
    updateMetaTag('og:title', ogTitle || title, true);
    updateMetaTag('og:description', ogDescription || description, true);
    updateMetaTag('og:image', ogImage, true);
    updateMetaTag('og:url', ogUrl || window.location.href, true);
    updateMetaTag('og:site_name', 'OD News', true);
    updateMetaTag('og:locale', 'hi_IN', true);
    
    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', ogTitle || title);
    updateMetaTag('twitter:description', ogDescription || description);
    updateMetaTag('twitter:image', ogImage);
    
    // Article specific tags
    if (article) {
      if (article.publishedTime) {
        updateMetaTag('article:published_time', article.publishedTime, true);
      }
      if (article.modifiedTime) {
        updateMetaTag('article:modified_time', article.modifiedTime, true);
      }
      if (article.author) {
        updateMetaTag('article:author', article.author, true);
      }
      if (article.section) {
        updateMetaTag('article:section', article.section, true);
      }
      if (article.tags) {
        article.tags.forEach(tag => {
          const meta = document.createElement('meta');
          meta.setAttribute('property', 'article:tag');
          meta.setAttribute('content', tag);
          document.head.appendChild(meta);
        });
      }
    }
    
    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonical || window.location.href);
    
    // Structured data for better SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": article ? "NewsArticle" : "WebSite",
      "name": title,
      "description": description,
      "url": ogUrl || window.location.href,
      "publisher": {
        "@type": "Organization",
        "name": "OD News",
        "logo": {
          "@type": "ImageObject",
          "url": "/api/assets/logo.png"
        }
      },
      "inLanguage": "hi-IN"
    };
    
    if (article) {
      Object.assign(structuredData, {
        "headline": title,
        "datePublished": article.publishedTime,
        "dateModified": article.modifiedTime || article.publishedTime,
        "author": {
          "@type": "Person",
          "name": article.author || "OD News"
        },
        "articleSection": article.section,
        "keywords": article.tags?.join(', ')
      });
    }
    
    // Add structured data script
    let structuredDataScript = document.querySelector('script[type="application/ld+json"]');
    if (!structuredDataScript) {
      structuredDataScript = document.createElement('script');
      structuredDataScript.setAttribute('type', 'application/ld+json');
      document.head.appendChild(structuredDataScript);
    }
    structuredDataScript.textContent = JSON.stringify(structuredData);
    
  }, [title, description, keywords, ogTitle, ogDescription, ogImage, ogUrl, canonical, article]);

  return null;
}