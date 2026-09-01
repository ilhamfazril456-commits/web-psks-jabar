import React from 'react';
import officialLogoImg from '../assets/images/psks_jabar_logo_1787709115486.jpg';

interface OfficialPsksLogoProps {
  className?: string;
  sizeClassName?: string;
  showRing?: boolean;
  logoUrl?: string;
}

export const OfficialPsksLogo: React.FC<OfficialPsksLogoProps> = ({
  className = '',
  sizeClassName = 'w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12',
  showRing = true,
  logoUrl,
}) => {
  const activeLogo = logoUrl && logoUrl.trim() !== '' ? logoUrl : officialLogoImg;

  return (
    <div
      className={`relative select-none aspect-square shrink-0 rounded-full flex items-center justify-center overflow-hidden bg-transparent ${
        showRing
          ? 'border-2 border-[#d4af37] ring-1 ring-amber-400/50 shadow-md shadow-black/40'
          : 'border border-[#d4af37]/60'
      } ${sizeClassName} ${className}`}
      style={{
        borderRadius: '50%',
        clipPath: 'circle(50% at 50% 50%)',
      }}
    >
      <img
        src={activeLogo}
        alt="Logo Resmi PSKS Jawa Barat - Dinas Sosial Provinsi Jawa Barat"
        className="w-full h-full aspect-square rounded-full object-cover object-center scale-[1.14] transition-transform duration-300 group-hover:scale-[1.20]"
        loading="eager"
        decoding="async"
        style={{
          borderRadius: '50%',
          imageRendering: '-webkit-optimize-contrast',
        }}
      />
    </div>
  );
};

export default OfficialPsksLogo;
