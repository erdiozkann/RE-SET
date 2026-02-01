import { useEffect, useState, useRef } from 'react';
import { podcastApi } from '../../lib/api';
import SEO from '../../components/SEO';
import type { PodcastEpisode as Podcast } from '../../types';

export default function PodcastPage() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);

  const [currentPodcast, setCurrentPodcast] = useState<Podcast | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetchPodcasts();
  }, []);

  const fetchPodcasts = async () => {
    try {
      const data = await podcastApi.getAll();
      setPodcasts(data || []);
      if (data && data.length > 0) {
        setCurrentPodcast(data[0]);
      }
    } catch (err) {
      console.error('Podcast yuklenemedi:', err);
      // Loading removed
    }
  };

  const selectPodcast = (podcast: Podcast) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setCurrentPodcast(podcast);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 10, audioRef.current.duration || 0);
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins + ':' + secs.toString().padStart(2, '0');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const months = ['Ocak', 'Subat', 'Mart', 'Nisan', 'Mayis', 'Haziran', 'Temmuz', 'Agustos', 'Eylul', 'Ekim', 'Kasim', 'Aralik'];
    return date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();
  };



  return (
    <>
      <SEO
        title="Podcast | Demartini Metodu Yayinlari"
        description="Demartini Metodu, deger belirleme ve yasam dengeleme uzerine podcast yayinlari."
        keywords="demartini metodu podcast, kisisel gelisim podcast, safak ozkan podcast"
      />

      <section className="py-10 md:py-14 bg-gradient-to-br from-[#F5F5F5] to-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-[#1A1A1A] mb-4">Podcast</h1>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              Demartini Metodu ile kisisel gelisim yolculugunuzda size eslik ediyoruz
            </p>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="text-xl md:text-2xl font-serif text-[#1A1A1A] mb-6">Bolumler</h2>

          {podcasts.length === 0 ? (
            <div className="text-center py-12">
              <i className="ri-mic-line text-6xl text-gray-300 mb-4 block"></i>
              <p className="text-gray-500">Henuz podcast yuklenmemis.</p>
            </div>
          ) : (
            <div className="space-y-4 pb-32">
              {podcasts.map((podcast) => (
                <div
                  key={podcast.id}
                  onClick={() => selectPodcast(podcast)}
                  className={'p-5 rounded-xl cursor-pointer transition-all border ' + (currentPodcast?.id === podcast.id ? 'bg-[#D4AF37]/10 border-[#D4AF37]' : 'bg-white border-gray-200 hover:border-[#D4AF37] hover:shadow-md')}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
                      <i className="ri-play-circle-line text-2xl text-[#D4AF37]"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-[#1A1A1A] truncate">{podcast.title}</h3>
                      {podcast.description && <p className="text-gray-600 text-sm mt-1 line-clamp-2">{podcast.description}</p>}
                      {podcast.date && <p className="text-xs text-gray-400 mt-2">{formatDate(podcast.date)}</p>}
                    </div>
                    {currentPodcast?.id === podcast.id && isPlaying && (
                      <div className="flex gap-1">
                        <span className="w-1 h-3 bg-[#D4AF37] rounded-full animate-pulse"></span>
                        <span className="w-1 h-5 bg-[#D4AF37] rounded-full animate-pulse"></span>
                        <span className="w-1 h-4 bg-[#D4AF37] rounded-full animate-pulse"></span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {currentPodcast && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          <audio
            ref={audioRef}
            src={currentPodcast.audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs text-gray-500 w-10 text-right">{formatTime(currentTime)}</span>
              <input type="range" min={0} max={duration || 100} value={currentTime} onChange={handleSeek} className="flex-1 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[#D4AF37]" />
              <span className="text-xs text-gray-500 w-10">{formatTime(duration)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
                  <i className="ri-music-2-line text-lg text-[#D4AF37]"></i>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#1A1A1A] truncate">{currentPodcast.title}</p>
                  <p className="text-xs text-gray-500">Demartini Metodu</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={skipBackward} className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors" title="10 saniye geri">
                  <i className="ri-replay-10-line text-xl text-gray-600"></i>
                </button>
                <button onClick={togglePlay} className="w-12 h-12 rounded-full bg-[#D4AF37] hover:bg-[#C19B2E] flex items-center justify-center transition-all shadow-md">
                  {isPlaying ? <i className="ri-pause-fill text-2xl text-white"></i> : <i className="ri-play-fill text-2xl text-white ml-0.5"></i>}
                </button>
                <button onClick={skipForward} className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors" title="10 saniye ileri">
                  <i className="ri-forward-10-line text-xl text-gray-600"></i>
                </button>
              </div>
              <div className="flex-1 hidden sm:block"></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
