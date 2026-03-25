import { useEffect, useState } from 'react';
import SEO from '../../components/SEO';
import { youtubeApi } from '../../lib/api';
import type { YouTubeVideo } from '../../types';

export default function YouTube() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [filter, setFilter] = useState<string>('Tümü');

  useEffect(() => {
    const loadVideos = async () => {
      try {
        const data = await youtubeApi.getAll();
        setVideos(data || []);
      } catch (error) {
        console.error('YouTube videoları yüklenirken hata:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadVideos();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  };

  const categories = ['Tümü', ...new Set(videos.map(v => v.category))].filter(Boolean);
  const filteredVideos = filter === 'Tümü' ? videos : videos.filter(v => v.category === filter);

  const VideoSkeleton = () => (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100/50">
      <div className="aspect-video bg-gray-100/50 animate-pulse"></div>
      <div className="p-5">
        <div className="h-5 bg-gray-100 rounded w-3/4 mb-3 animate-pulse"></div>
        <div className="h-4 bg-gray-100 rounded w-full mb-2 animate-pulse"></div>
        <div className="h-3 bg-gray-100 rounded w-1/3 animate-pulse"></div>
      </div>
    </div>
  );

  const siteUrl = 'https://re-set.com.tr';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'VideoGallery',
    name: 'Reset YouTube Kanalı',
    description: 'Demartini Metodu, değer belirleme ve Breakthrough Experience üzerine video içerikler',
    url: `${siteUrl}/youtube`,
    author: {
      '@type': 'Person',
      name: 'Şafak Özkan'
    }
  };

  return (
    <>
      <SEO
        title="YouTube Yayınlarım | Demartini Metodu & Dönüşüm Videoları"
        description="Demartini Metodu, değer belirleme ve Breakthrough Experience üzerine derinlemesine video içerikler. Şafak Özkan ile yaşam dönüşümü."
        keywords="demartini metodu, video, kişisel gelişim, değer belirleme, breakthrough experience, şafak özkan"
        schema={schema}
      />

      {/* Hero Section */}
      <section className="relative pt-16 pb-12 overflow-hidden bg-[#fafafa]">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="max-w-3xl">
            <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-[#D4AF37] uppercase bg-[#D4AF37]/10 rounded-full">
              Video Kütüphanesi
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-[#111111] mb-6 tracking-tight font-serif leading-tight">
              Dönüşüm Yolculuğunuz İçin <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#111111] to-[#444]">Görsel Rehberlik</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-2xl">
              Demartini Metodu, değer belirleme ve yaşam dengeleme üzerine özel içerikler.
              Her videoda kendinizden bir parça bulacak ve dönüşüm için yeni bir adım atacaksınız.
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href="https://www.youtube.com/@SafakOzkan-y6i"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-[#111111] text-white rounded-full text-sm font-medium hover:bg-black hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <i className="ri-youtube-fill text-xl mr-2 text-red-500"></i>
                Kanala Abone Ol
              </a>
            </div>
          </div>

          {/* Filters */}
          {categories.length > 1 && (
            <div className="flex flex-wrap gap-2 mt-12 border-t border-gray-200/60 pt-8">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setFilter(category)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${filter === category
                    ? 'bg-[#111111] text-white shadow-md transform scale-105'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Videos Grid */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <VideoSkeleton key={i} />
              ))}
            </div>
          ) : filteredVideos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {filteredVideos.map((video) => (
                <div
                  key={video.id}
                  className="group cursor-pointer bg-white rounded-2xl transition-all duration-300 hover:-translate-y-2"
                  onClick={() => setSelectedVideo(video)}
                >
                  {/* Thumbnail Container */}
                  <div className="relative aspect-video rounded-xl overflow-hidden shadow-sm group-hover:shadow-2xl transition-all duration-300 mb-5">
                    <img
                      src={video.thumbnail || `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                      alt={video.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
                      }}
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>

                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100">
                      <div className="w-16 h-16 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                        <i className="ri-play-fill text-3xl text-[#111111] ml-1"></i>
                      </div>
                    </div>

                    {video.duration && (
                      <span className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white/90 text-[11px] px-2 py-1 rounded font-medium tracking-wide">
                        {video.duration}
                      </span>
                    )}
                    {video.category && (
                      <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-[#111111] text-[11px] px-3 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm">
                        {video.category}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="px-1">
                    <div className="flex items-center text-xs font-medium text-gray-400 mb-3">
                      <i className="ri-calendar-line mr-1.5 opacity-70"></i>
                      <span>{formatDate(video.publishedAt)}</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#111111] mb-2 line-clamp-2 leading-snug group-hover:text-[#D4AF37] transition-colors duration-300 font-serif">
                      {video.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                      {video.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <i className="ri-youtube-line text-4xl text-gray-300"></i>
              </div>
              <h3 className="text-xl font-medium text-[#1A1A1A] mb-2">Bu kategoride video bulunamadı</h3>
              <p className="text-gray-500 font-light">Başka bir filtre seçmeyi deneyin.</p>
            </div>
          )}
        </div>
      </section>

      {/* Video Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedVideo(null)}
        >
          <div className="absolute inset-0 bg-[#000000]/95 backdrop-blur-sm transition-opacity duration-300" />

          <div
            className="relative w-full max-w-5xl bg-black rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 right-0 p-4 z-10">
              <button
                onClick={() => setSelectedVideo(null)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white/70 hover:text-white hover:bg-black/80 transition-all backdrop-blur-sm"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <div className="aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                title={selectedVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>

            <div className="p-6 md:p-8 bg-[#111111] border-t border-white/10">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-3 font-serif">{selectedVideo.title}</h3>
              <p className="text-gray-400 leading-relaxed text-sm md:text-base max-w-3xl">
                {selectedVideo.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-[#111111] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center relative z-10">
          <i className="ri-youtube-fill text-5xl text-red-600 mb-6 inline-block"></i>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-serif">
            Daha Fazla İçerik İçin Abone Olun
          </h2>
          <p className="text-gray-400 mb-10 text-lg font-light leading-relaxed max-w-2xl mx-auto">
            YouTube kanalımda her hafta yeni bir video ile hayatınızı dönüştürecek bilgiler paylaşıyorum.
            Kaçırmamak için abone olun.
          </p>
          <a
            href="https://www.youtube.com/@SafakOzkan-y6i"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-8 py-4 bg-white text-[#111111] rounded-full font-bold hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
          >
            <span className="mr-2">YouTube Kanalına Git</span>
            <i className="ri-arrow-right-line"></i>
          </a>
        </div>
      </section>
    </>
  );
}

