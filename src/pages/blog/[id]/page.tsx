import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { blogApi } from '../../../lib/api';
import SEO from '../../../components/SEO';
import type { BlogPost } from '../../../types';

export default function BlogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate('/blog');
      return;
    }
    const loadPost = async () => {
      try {
        const data = await blogApi.getById(id);
        if (!data) {
          setNotFound(true);
        } else {
          setPost(data);
        }
      } catch {
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };
    loadPost();
  }, [id, navigate]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <div className="animate-pulse">
            <div className="aspect-video rounded-xl bg-gray-200 mb-8"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (notFound || !post) {
    return (
      <>
        <SEO title="Yazı Bulunamadı | Blog" description="Bu blog yazısı mevcut değil." />
        <section className="py-20 bg-white text-center">
          <div className="max-w-3xl mx-auto px-4">
            <i className="ri-article-line text-6xl text-gray-300 mb-4 block"></i>
            <h1 className="text-2xl font-serif text-[#1A1A1A] mb-4">Yazı Bulunamadı</h1>
            <p className="text-gray-500 mb-8">Bu blog yazısı kaldırılmış ya da mevcut değil.</p>
            <Link to="/blog" className="px-6 py-3 bg-[#D4AF37] text-[#1A1A1A] font-medium hover:bg-[#C19B2E] transition-colors inline-block">
              Blog'a Dön
            </Link>
          </div>
        </section>
      </>
    );
  }

  const siteUrl = 'https://re-set.com.tr';
  const articleUrl = `${siteUrl}/blog/${post.id}`;

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': `${articleUrl}#article`,
      headline: post.title,
      description: post.excerpt,
      image: post.image
        ? [post.image]
        : ['https://re-set.com.tr/og-image.jpg'],
      datePublished: post.date,
      dateModified: post.date,
      inLanguage: 'tr-TR',
      isAccessibleForFree: true,
      articleSection: post.category || 'Demartini Metodu',
      keywords: [
        'Demartini Metodu',
        'Şafak Özkan',
        post.category || 'Kişisel Dönüşüm',
      ].join(', '),
      author: {
        '@type': 'Person',
        '@id': 'https://re-set.com.tr/#safakozkan',
        name: 'Şafak Özkan',
        url: 'https://re-set.com.tr/about',
        jobTitle: 'Sertifikalı Demartini Metodu Uygulayıcısı',
      },
      publisher: {
        '@type': 'Organization',
        '@id': 'https://re-set.com.tr/#organization',
        name: 'RE-SET — Reset Danışmanlık',
        logo: {
          '@type': 'ImageObject',
          url: 'https://re-set.com.tr/favicon.png',
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': articleUrl,
      },
      url: articleUrl,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Ana Sayfa',
          item: `${siteUrl}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Blog',
          item: `${siteUrl}/blog`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: post.title,
          item: articleUrl,
        },
      ],
    },
  ];

  return (
    <>
      <SEO
        title={`${post.title} | Blog`}
        description={post.excerpt}
        canonical={`/blog/${post.id}`}
        ogImage={post.image || undefined}
        ogType="article"
        schema={schema}
        lastModified={post.date}
      />

      <section className="py-10 md:py-14 bg-gradient-to-br from-[#F5F5F5] to-white">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#D4AF37] mb-6 transition-colors">
            <i className="ri-arrow-left-line"></i>
            Blog'a Dön
          </Link>

          {post.category && (
            <p className="text-sm font-medium text-[#D4AF37] mb-3">{post.category}</p>
          )}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif text-[#1A1A1A] mb-4">{post.title}</h1>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            {post.date && <span>{formatDate(post.date)}</span>}
            {post.readTime && (
              <>
                <span>·</span>
                <span>{post.readTime} okuma</span>
              </>
            )}
          </div>
        </div>
      </section>

      {post.image && (
        <div className="max-w-3xl mx-auto px-4 md:px-8 -mt-2 mb-8">
          <img
            src={post.image}
            alt={post.title}
            className="w-full aspect-video object-cover rounded-xl shadow-sm"
          />
        </div>
      )}

      <section className="py-6 pb-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          {post.excerpt && (
            <p className="text-lg text-gray-600 mb-8 font-medium leading-relaxed border-l-4 border-[#D4AF37] pl-4">
              {post.excerpt}
            </p>
          )}

          <div
            className="prose prose-lg max-w-none text-gray-700 leading-relaxed
              prose-headings:font-serif prose-headings:text-[#1A1A1A]
              prose-a:text-[#D4AF37] prose-a:no-underline hover:prose-a:underline
              prose-img:rounded-xl prose-img:shadow-sm
              whitespace-pre-wrap"
          >
            {post.content}
          </div>
        </div>
      </section>
    </>
  );
}
