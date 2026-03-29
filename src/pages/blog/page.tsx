import { useEffect, useState } from 'react';
import SEO from '../../components/SEO';
import { blogApi } from '../../lib/api';
import type { BlogPost } from '../../types';

export default function Blog() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Tüm Kategoriler');

  useEffect(() => {
    const loadBlogPosts = async () => {
      try {
        const data = await blogApi.getAll();
        setBlogPosts(data || []);
      } catch (error) {
        console.error('Blog yazıları yüklenirken hata:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBlogPosts();
  }, []);

  const allCategory = 'Tüm Kategoriler';
  const categories = [allCategory, ...Array.from(new Set(blogPosts.map(post => post.category).filter(Boolean)))];
 
  const filteredPosts = selectedCategory === allCategory
    ? blogPosts
    : blogPosts.filter(post => post.category === selectedCategory);

  const featuredPosts = filteredPosts.filter(post => post.featured);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const BlogSkeleton = () => (
    <div className="animate-pulse">
      <div className="aspect-video rounded-xl bg-gray-200 mb-4"></div>
      <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
    </div>
  );

  const siteUrl = 'https://re-set.com.tr';

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'Blog | Reset',
      description: 'Kişisel gelişim ve Demartini Metodu hakkında yazılar',
      url: `${siteUrl}/blog`,
      author: {
        '@type': 'Person',
        name: 'Şafak Özkan'
      }
    }
  ];

  return (
    <>
      <SEO
        title="Blog | Reset"
        description="Kişisel gelişim ve Demartini Metodu hakkında yazılar"
        keywords="blog, demartini metodu, kişisel gelişim"
        schema={schema}
      />
      <section className="py-10 md:py-14 bg-gradient-to-br from-[#F5F5F5] to-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-[#1A1A1A] mb-4">
              Blog
            </h1>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              Kişisel gelişim ve yaşam dönüşümü hakkında yazılar
            </p>
          </div>
        </div>
      </section>

      {categories.length > 1 && (
        <section className="py-8 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${category === selectedCategory
                      ? 'bg-[#D4AF37] text-[#1A1A1A]'
                      : 'bg-gray-100 text-gray-600 hover:bg-[#D4AF37] hover:text-[#1A1A1A]'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {!isLoading && featuredPosts.length > 0 && (
        <section className="py-10 md:py-14 bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <h2 className="text-xl md:text-2xl font-serif text-[#1A1A1A] mb-6">
              Öne Çıkan Yazılar
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredPosts.map((post) => (
                <article key={post.id} className="group cursor-pointer">
                  <div className="aspect-video rounded-xl overflow-hidden mb-4 bg-gray-100 flex items-center justify-center">
                    {(post as any).featured_image || post.image ? (
                      <img
                        src={(post as any).featured_image || post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <i className="ri-article-line text-4xl text-gray-300"></i>
                    )}
                  </div>

                  <p className="text-sm text-[#D4AF37] font-medium mb-2">{post.category}</p>
                  <h3 className="text-lg md:text-xl font-serif text-[#1A1A1A] mb-2 group-hover:text-[#D4AF37]">{post.title}</h3>
                  <p className="text-gray-600 mb-3 text-sm">{post.excerpt}</p>
                  <span className="text-xs text-gray-500">{formatDate(post.date)}</span>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-10 md:py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <h2 className="text-xl md:text-2xl font-serif text-[#1A1A1A] mb-6">
            {featuredPosts.length > 0 ? 'Tüm Yazılar' : 'Blog'}
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <BlogSkeleton />
              <BlogSkeleton />
              <BlogSkeleton />
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <article key={post.id} className="group cursor-pointer">
                  <div className="aspect-video rounded-xl overflow-hidden mb-4 bg-gray-100 flex items-center justify-center">
                    {(post as any).featured_image || post.image ? (
                      <img
                        src={(post as any).featured_image || post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <i className="ri-article-line text-4xl text-gray-300"></i>
                    )}
                  </div>

                  <p className="text-xs text-[#D4AF37] font-medium mb-2">{post.category}</p>
                  <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2 group-hover:text-[#D4AF37] line-clamp-2">{post.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{post.excerpt}</p>
                  <span className="text-xs text-gray-500">{formatDate(post.date)}</span>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <i className="ri-article-line text-6xl text-gray-300 mb-4 block"></i>
              <p className="text-gray-500">Henüz blog yazısı yok</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#F5F5F5]">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <div className="bg-white p-6 md:p-10 rounded-2xl">
            <div className="w-14 h-14 flex items-center justify-center bg-[#D4AF37] rounded-full mx-auto mb-4">
              <i className="ri-mail-line text-2xl text-white"></i>
            </div>
            <h3 className="text-xl md:text-2xl font-serif text-[#1A1A1A] mb-3">
              Bültenimize Katılın
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              Yeni yazılardan haberdar olun
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                name="email"
                required
                placeholder="E-posta adresiniz"
                className="flex-1 px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-[#D4AF37] text-[#1A1A1A] font-medium cursor-pointer hover:bg-[#C19B2E]"
              >
                Abone Ol
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
