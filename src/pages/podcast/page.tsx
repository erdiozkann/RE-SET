import { useEffect, useState } from 'react';
import SEO from '../../components/SEO';
import { podcastApi } from '../../lib/api';
import type { PodcastEpisode } from '../../types';

export default function Podcast() {
  const [podcasts, setPodcasts] = useState<PodcastEpisode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPodcasts = async () => {
      try {
        const data = await podcastApi.getAll();
        setPodcasts(data || []);
      } catch (error) {
        console.error('Podcast bölümleri yüklenirken hata:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPodcasts();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const PodcastSkeleton = () => (
    <div className="bg-white p-6 md:p-8 rounded-xl animate-pulse">
      <div className="flex gap-6">
        <div className="w-32 h-32 bg-gray-200 rounded-lg"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    </div>
  );

  const platforms = [
    { name: 'Spotify', icon: 'ri-spotify-line', url: '#' },
    { name: 'Apple Podcasts', icon: 'ri-apple-line', url: '#' },
    { name: 'Google Podcasts', icon: 'ri-google-line', url: '#' },
    { name: 'YouTube', icon: 'ri-youtube-line', url: '#' }
  ];

  const siteUrl = 'https://re-set.com.tr';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'PodcastSeries',
    name: 'Reset Podcast',
    description: 'Kişisel gelişim, yaşam koçluğu ve psikolojik danışmanlık üzerine podcast yayınları',
    url: `${siteUrl}/podcast`,
    author: {
      '@type': 'Person',
      name: 'Şafak Özkan'
    },
    episode: podcasts.map(podcast => ({
      '@type': 'PodcastEpisode',
      name: podcast.title,
      description: podcast.description,
      datePublished: podcast.date,
      duration: podcast.duration
    }))
  };

  return (
    <>
      <SEO
        title="Reset Podcast | Kişisel Gelişim ve Yaşam Koçluğu Sohbetleri"
        description="Kişisel gelişim, yaşam koçluğu ve mindfulness üzerine derin sohbetler. Her bölümde hayatınızı dönüştürecek içgörüler keşfedin. Şafak Özkan ile Reset Podcast."
        keywords="podcast, yaşam koçluğu podcast, kişisel gelişim podcast, mindfulness"
        schema={schema}
      />
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-[#F5F5F5] to-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#1A1A1A] mb-6 leading-tight">
                Reset Podcast
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                Kişisel gelişim, yaşam koçluğu ve mindfulness üzerine derin sohbetler. 
                Her bölümde hayatınızı dönüştürecek içgörüler keşfedin.
              </p>
              
              {/* Platform Links */}
              <div className="mb-8">
                <p className="text-sm font-medium text-gray-700 mb-4">Dinleyebileceğiniz Platformlar:</p>
                <div className="flex items-center gap-4">
                  {platforms.map((platform) => (
                    <a
                      key={platform.name}
                      href={platform.url}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:border-[#D4AF37] transition-colors cursor-pointer"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className={`${platform.icon} text-xl`}></i>
                      <span className="text-sm font-medium">{platform.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] flex items-center justify-center">
                <div className="text-center text-white">
                  <i className="ri-mic-line text-8xl mb-4 opacity-20"></i>
                  <h3 className="text-2xl font-serif">Reset Podcast</h3>
                  <p className="text-white/60 mt-2">Şafak Özkan ile</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Episode */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <h2 className="text-2xl md:text-3xl font-serif text-[#1A1A1A] mb-8">
            En Son Bölüm
          </h2>
          
          {isLoading ? (
            <div className="bg-[#F5F5F5] p-8 md:p-12 rounded-2xl">
              <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="aspect-video bg-gray-200 rounded-xl"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                  <div className="h-12 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            </div>
          ) : podcasts[0] ? (
            <div className="bg-[#F5F5F5] p-8 md:p-12 rounded-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="relative">
                  <div className="aspect-video rounded-xl overflow-hidden">
                    <img 
                      src={podcasts[0].image}
                      alt={podcasts[0].title}
                      className="w-full h-full object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-16 h-16 flex items-center justify-center bg-white rounded-full cursor-pointer hover:scale-110 transition-transform">
                        <i className="ri-play-fill text-3xl text-[#1A1A1A] ml-1"></i>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-sm text-[#D4AF37] font-medium">{podcasts[0].episode}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{podcasts[0].duration}</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-serif text-[#1A1A1A] mb-4">
                    {podcasts[0].title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {podcasts[0].description}
                  </p>
                  <button className="flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-[#1A1A1A] font-medium whitespace-nowrap cursor-pointer transition-all hover:bg-[#C19B2E]">
                    <i className="ri-play-fill text-xl"></i>
                    Dinle
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-[#F5F5F5] rounded-2xl">
              <i className="ri-mic-line text-5xl text-gray-300 mb-4 block"></i>
              <p className="text-gray-600">Henüz podcast bölümü yok</p>
            </div>
          )}
        </div>
      </section>

      {/* All Episodes */}
      <section className="py-16 md:py-20 bg-[#F5F5F5]">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <h2 className="text-2xl md:text-3xl font-serif text-[#1A1A1A] mb-8">
            Tüm Bölümler
          </h2>
          
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map(i => <PodcastSkeleton key={i} />)}
            </div>
          ) : podcasts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Henüz podcast bölümü eklenmemiş</p>
            </div>
          ) : (
            <div className="space-y-6">
              {podcasts.map((podcast) => (
                <div key={podcast.id} className="bg-white p-6 md:p-8 rounded-xl group cursor-pointer hover:shadow-lg transition-all">
                  <div className="flex gap-6">
                    <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden relative">
                      <img 
                        src={podcast.image}
                        alt={podcast.title}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-12 h-12 flex items-center justify-center bg-white rounded-full">
                          <i className="ri-play-fill text-2xl text-[#1A1A1A] ml-1"></i>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm text-[#D4AF37] font-medium">{podcast.episode}</span>
                        <span className="text-sm text-gray-400">•</span>
                        <span className="text-sm text-gray-500">{podcast.category}</span>
                      </div>
                      
                      <h3 className="text-xl md:text-2xl font-semibold text-[#1A1A1A] mb-3 group-hover:text-[#D4AF37] transition-colors">
                        {podcast.title}
                      </h3>
                      
                      <p className="text-gray-600 leading-relaxed mb-4">
                        {podcast.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-500 gap-3">
                          <span>{formatDate(podcast.date || '')}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <i className="ri-time-line"></i>
                            {podcast.duration}
                          </span>
                        </div>
                        
                        <button className="flex items-center gap-2 px-4 py-2 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#1A1A1A] transition-all whitespace-nowrap cursor-pointer">
                          <i className="ri-play-fill text-lg"></i>
                          Dinle
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Subscribe */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] p-8 md:p-12 rounded-2xl text-white">
            <div className="w-16 h-16 flex items-center justify-center bg-[#D4AF37] rounded-full mx-auto mb-6">
              <i className="ri-notification-line text-3xl text-[#1A1A1A]"></i>
            </div>
            <h3 className="text-2xl md:text-3xl font-serif mb-4">
              Yeni Bölümlerden Haberdar Olun
            </h3>
            <p className="text-white/80 mb-8">
              Reset Podcast'in yeni bölümlerinden ilk siz haberdar olmak için 
              favori platform üzerinden abone olun.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {platforms.map((platform) => (
                <a
                  key={platform.name}
                  href={platform.url}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-[#1A1A1A] font-medium hover:bg-[#D4AF37] transition-colors cursor-pointer whitespace-nowrap"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className={`${platform.icon} text-xl`}></i>
                  {platform.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
