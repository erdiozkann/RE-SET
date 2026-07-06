import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import SEO from '../../components/SEO';
import NotFound from '../NotFound';
import { sitePagesApi } from '../../lib/api';
import { mdToHtml } from '../../lib/markdown';
import type { SitePage } from '../../types';

// Panelden yönetilen içerik sayfası (site_pages). /:slug rotasında render olur.
export default function CmsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<SitePage | null>(null);
  const [state, setState] = useState<'loading' | 'ok' | 'missing'>('loading');

  useEffect(() => {
    let alive = true;
    setState('loading');
    sitePagesApi
      .getBySlug(slug || '')
      .then((p) => {
        if (!alive) return;
        if (p) {
          setPage(p);
          setState('ok');
        } else {
          setState('missing');
        }
      })
      .catch(() => alive && setState('missing'));
    return () => {
      alive = false;
    };
  }, [slug]);

  if (state === 'loading') {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 md:px-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-2/3 mb-6"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </section>
    );
  }

  // Bilinen bir CMS sayfası değilse gerçek 404 (yanlış pozitif indexlemeyi önler).
  if (state === 'missing' || !page) {
    return <NotFound />;
  }

  const siteUrl = 'https://re-set.com.tr';
  const url = `${siteUrl}/${page.slug}`;
  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${url}#service`,
      name: page.title,
      description: page.description,
      url,
      provider: { '@id': 'https://re-set.com.tr/#safakozkan' },
      areaServed: [
        { '@type': 'City', name: 'İstanbul' },
        { '@type': 'Country', name: 'Türkiye' },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: `${siteUrl}/` },
        { '@type': 'ListItem', position: 2, name: page.title, item: url },
      ],
    },
  ];

  return (
    <>
      <SEO
        title={`${page.title} | Şafak Özkan — RE-SET`}
        description={page.description}
        canonical={`/${page.slug}`}
        schema={schema}
        lastModified={page.updatedAt}
      />
      <section className="py-10 md:py-14 bg-gradient-to-br from-[#F5F5F5] to-white">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#D4AF37] mb-6 transition-colors"
          >
            <i className="ri-arrow-left-line"></i>
            Ana Sayfa
          </Link>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif text-[#1A1A1A]">{page.title}</h1>
        </div>
      </section>

      <section className="py-6 pb-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <div
            className="prose prose-lg max-w-none text-gray-700 leading-relaxed
              prose-headings:font-serif prose-headings:text-[#1A1A1A]
              prose-a:text-[#D4AF37] prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(mdToHtml(page.content)) }}
          />
        </div>
      </section>
    </>
  );
}
