import React, { useRef, useEffect, useState } from 'react';
import { ArrowDownCircle } from 'lucide-react';
import { AppSettings } from '../types';
import { OFFICIAL_ECOOFFICE_VIDEO } from '../assets/officialEcoOfficeVideo';

import dinsosBuildingPhoto from '../assets/images/dinsos_jabar_hero_bg_1785640712371.jpg';

interface HeroSectionProps {
  onScrollToGrid: () => void;
  appSettings?: AppSettings;
}

const MAIN_HERO_BG_PHOTO = dinsosBuildingPhoto;

export const HeroSection: React.FC<HeroSectionProps> = ({ onScrollToGrid, appSettings }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);

  // Determine active video URL (Firestore as primary authority)
  const getActiveVideoUrl = () => {
    const firestore = appSettings?.bgVideoUrl;
    const local = typeof window !== 'undefined' ? (localStorage.getItem('dinsos_bg_video_url') || localStorage.getItem('dinsos_eco_video_url')) : null;

    const raw = (firestore && firestore !== 'LOCAL_STORAGE_SAVED_VIDEO') ? firestore : (local || '');
    
    // Filter out invalid local OS file paths (e.g. C:\Users\...) which browser security blocks
    if (!raw || raw === 'LOCAL_STORAGE_SAVED_VIDEO' || raw.startsWith('C:') || raw.startsWith('file:') || raw.includes('Users\\')) {
      return '';
    }

    return raw;
  };

  const activeVideo = getActiveVideoUrl();

  const getActivePhotoUrl = () => {
    const firestore = appSettings?.bgPhotoUrl;
    const local = typeof window !== 'undefined' ? localStorage.getItem('dinsos_bg_photo_url') : null;
    const raw = (firestore && firestore !== 'LOCAL_STORAGE_SAVED_PHOTO') ? firestore : local;
    return raw || MAIN_HERO_BG_PHOTO;
  };

  const activePhoto = getActivePhotoUrl();

  const getActiveBgMode = () => {
    const firestoreMode = appSettings?.bgMode;
    const localMode = typeof window !== 'undefined' ? localStorage.getItem('dinsos_bg_mode') : null;
    return (firestoreMode || localMode || 'photo') as 'photo' | 'video';
  };

  const bgMode = getActiveBgMode();
  const isVideoActive = bgMode === 'video' && !!activeVideo && !videoError;

  useEffect(() => {
    if (isVideoActive && activeVideo) {
      setVideoError(false);
      if (videoRef.current) {
        videoRef.current.playbackRate = 1.0;
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn('Video autoplay info:', err);
          });
        }
      }
    }
  }, [isVideoActive, activeVideo]);

  const handleVideoError = () => {
    setVideoError(true);
  };

  return (
    <section className="relative w-full h-[65vh] sm:h-[78vh] min-h-[360px] sm:min-h-[520px] md:-mt-[70px] md:pt-[70px] py-8 sm:py-0 flex items-center justify-center overflow-hidden bg-slate-950">
      {/* Photo Background Layer (Active when bgMode is 'photo' or when video is unavailable) */}
      {!isVideoActive && (
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center z-0 transition-all duration-700 transform scale-105"
          style={{ backgroundImage: `url(${activePhoto})` }}
        />
      )}

      {/* Video Background Layer (Active ONLY when bgMode is 'video' and video is ready) */}
      {isVideoActive && (
        <video
          key={activeVideo}
          ref={videoRef}
          src={activeVideo}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          onError={handleVideoError}
          onCanPlay={(e) => {
            e.currentTarget.play().catch(() => {});
          }}
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-100 transition-opacity duration-700 brightness-[1.08] contrast-[1.10] saturate-[1.12]"
          style={{
            willChange: 'transform',
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)',
            WebkitTransform: 'translateZ(0)',
          }}
        />
      )}

      {/* Subtle overlay to enhance text readability without obscuring video */}
      <div 
        className="absolute inset-0 z-[1] pointer-events-none transition-all duration-500" 
        style={{
          background: 'radial-gradient(circle at center, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%)'
        }}
      />

      {/* Main Content with Text Drop Shadows (Video is completely visible behind) */}
      <div className="relative z-10 text-center max-w-4xl px-4 sm:px-6 mx-auto flex flex-col items-center">
        <h1 
          className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-3 sm:mb-4 drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)]"
          style={{ textShadow: '0 2px 16px rgba(0,0,0,0.95)' }}
        >
          Potensi dan Sumber Kesejahteraan Sosial (PSKS)
        </h1>

        <p 
          className="text-xs sm:text-base md:text-lg text-white max-w-3xl mb-6 sm:mb-8 leading-relaxed font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]"
          style={{ textShadow: '0 2px 10px rgba(0,0,0,0.95)' }}
        >
          Sistem Pemantauan Terintegrasi dan Pengelolaan Data Pilar-Pilar Kesejahteraan Sosial Dinas Sosial Provinsi Jawa Barat
        </p>

        <div className="flex items-center justify-center">
          <button
            onClick={onScrollToGrid}
            className="group inline-flex items-center gap-2 bg-[#b8901c] hover:bg-[#d4af37] text-[#043e2e] font-extrabold text-xs sm:text-base px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl shadow-2xl hover:shadow-2xl transition-all transform hover:-translate-y-1 active:scale-95 cursor-pointer"
          >
            <span>Lihat Data Dashboard</span>
            <ArrowDownCircle className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-y-0.5" />
          </button>
        </div>
      </div>
    </section>
  );
};







