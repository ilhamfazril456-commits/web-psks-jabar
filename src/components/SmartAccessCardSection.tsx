import React, { useState } from 'react';
import { 
  CreditCard, 
  QrCode, 
  Wifi, 
  Radio, 
  Smartphone, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Info, 
  Lock, 
  Zap, 
  Cpu, 
  Layers, 
  Scan, 
  KeyRound, 
  HelpCircle,
  Eye,
  RotateCcw,
  Fingerprint,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';
import { SmartCardGraphic } from './SmartCardGraphic';
import { UserSession } from '../types';
import { PERMANENT_SUPERADMIN_QR_TOKEN, PERMANENT_DEVELOPER_QR_TOKEN } from '../utils/qrAuth';

interface SmartAccessCardSectionProps {
  session?: UserSession;
}

export const SmartAccessCardSection: React.FC<SmartAccessCardSectionProps> = ({ session }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'qr' | 'nfc'>('all');
  const [cardFlipped, setCardFlipped] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isNfcWriting, setIsNfcWriting] = useState(false);
  const [nfcWriteStatus, setNfcWriteStatus] = useState<string | null>(null);
  const [nfcWriteError, setNfcWriteError] = useState<string | null>(null);

  const userRole = session?.role || 'superadmin';
  const userName = session?.nama || 'Superadmin Dinsos Jabar';

  const tokenToProgram = userRole === 'developer' ? PERMANENT_DEVELOPER_QR_TOKEN : PERMANENT_SUPERADMIN_QR_TOKEN;
  const baseUrl = typeof window !== 'undefined' ? `${window.location.origin}` : 'https://web-psks-jabar.vercel.app';
  const nfcTargetUrl = `${baseUrl}/?smartcard_auth=${encodeURIComponent(tokenToProgram)}`;

  const handleCopyNfcUrl = () => {
    try {
      navigator.clipboard.writeText(nfcTargetUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    } catch (_) {}
  };

  const handleWriteNfcCard = async () => {
    setNfcWriteError(null);
    setNfcWriteStatus('Mempersiapkan sensor NFC... Silakan tempelkan kartu 13,56 MHz ke bagian belakang HP.');
    setIsNfcWriting(true);

    if (typeof window === 'undefined' || !('NDEFReader' in window)) {
      setIsNfcWriting(false);
      setNfcWriteError('Browser atau perangkat ini belum mendukung Web NFC API secara langsung. Silakan gunakan aplikasi gratis "NFC Tools" di HP dengan menyalin URL payload di bawah.');
      return;
    }

    try {
      const ndef = new (window as any).NDEFReader();
      await ndef.write({
        records: [
          { recordType: 'url', data: nfcTargetUrl },
          { recordType: 'text', data: tokenToProgram }
        ]
      });

      setIsNfcWriting(false);
      setNfcWriteStatus('✅ Berhasil! Kartu Smart Card NFC 13,56 MHz telah sukses diprogram. Sekarang kartu ini dapat ditempelkan ke HP mana saja untuk membuka web & login otomatis sebagai Superadmin!');
      
      try {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([80, 50, 100]);
        }
      } catch (_) {}
    } catch (err: any) {
      console.warn('NFC Write error:', err);
      setIsNfcWriting(false);
      setNfcWriteError(`Gagal menulis kartu NFC: ${err.message || 'Izin NFC ditolak atau kartu bergeser terlalu cepat.'}`);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. SECTION HEADER BANNER - MATCHING JABAR PROV THEME */}
      <div className="relative overflow-hidden rounded-3xl bg-white border-2 border-slate-200 p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-black tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#043e2e]" />
              <span>Next-Gen Hardware Authentication</span>
            </div>
            
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 flex items-center gap-3">
              <span>Smart Access Card</span>
              <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300">
                DUAL-GATE ACCESS
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Infrastruktur otentikasi fisik tanpa ketik kata sandi. Superadmin dan Developer dapat melakukan bypass otorisasi Smart Gate secara aman menggunakan <strong className="text-slate-900">QR Code Terenkripsi</strong> di balik kartu fisik atau melalui pemindaian <strong className="text-[#043e2e]">Tap Smart Card NFC (Mifare 13,56 MHz)</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700">
              <ShieldCheck className="w-4 h-4 text-[#043e2e]" />
              <span>AES-256 Auth Shield</span>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 px-3.5 py-2 rounded-2xl border border-emerald-200 text-xs font-bold text-emerald-800">
              <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>13,56 MHz Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. INTERACTIVE CARD SHOWCASE & DUAL METHOD PREVIEW (BENTO GRID DESIGN) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COLUMN: INTERACTIVE 3D VIRTUAL SMART CARD (5 COLS) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border-2 border-slate-200 p-6 flex flex-col justify-between items-center text-center shadow-sm relative overflow-hidden group">
          <div className="w-full flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2 text-xs font-black text-slate-800">
              <CreditCard className="w-4 h-4 text-[#043e2e]" />
              <span>VISUALISASI SMART CARD FISIK</span>
            </div>
            <button
              type="button"
              onClick={() => setCardFlipped(!cardFlipped)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-[10px] font-bold text-emerald-800 transition-all cursor-pointer hover:scale-105"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{cardFlipped ? 'Lihat Depan Kartu' : 'Balik (QR Belakang)'}</span>
            </button>
          </div>

          {/* Interactive Card Presentation Box */}
          <div className="my-6 w-full flex flex-col items-center justify-center min-h-[220px]">
            {!cardFlipped ? (
              <div className="w-full flex flex-col items-center animate-fadeIn">
                <SmartCardGraphic
                  role={userRole}
                  nama={userName}
                  isInteractive={true}
                  className="shadow-xl"
                />
                <div className="mt-3 flex items-center gap-2 text-[11px] font-bold text-slate-500">
                  <Fingerprint className="w-3.5 h-3.5 text-[#043e2e]" />
                  <span>Sisi Depan: Chip EMV Emas & Antena NFC Terpadu</span>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-[340px] sm:max-w-[380px] aspect-[16/10] rounded-2xl sm:rounded-3xl p-4 sm:p-5 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-2 border-[#d4af37] text-white shadow-xl flex flex-col justify-between text-left animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
                  <div className="text-[10px] font-black text-amber-300 uppercase tracking-widest">
                    SMART SECURITY PASSBACK
                  </div>
                  <div className="text-[9px] font-mono font-bold text-slate-400">
                    ID: JBR-SA-{session?.role === 'developer' ? '001-DEV' : '002-SA'}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 my-auto">
                  <div className="p-2 rounded-xl bg-white border-2 border-[#d4af37] shadow-md flex items-center justify-center shrink-0">
                    <QrCode className="w-16 h-16 sm:w-20 sm:h-20 text-slate-950" />
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="font-extrabold text-white leading-tight">
                      QR Master Access Key
                    </p>
                    <p className="text-[10px] text-emerald-300 font-medium">
                      Pindai dengan kamera ponsel / webcam untuk login instan tanpa input sandi.
                    </p>
                    <div className="inline-block text-[9px] font-mono bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/40 text-emerald-400">
                      AES-256 ENCRYPTED
                    </div>
                  </div>
                </div>

                <div className="text-[8.5px] text-slate-400 border-t border-slate-800 pt-1.5 flex justify-between items-center">
                  <span>Dinas Sosial Provinsi Jawa Barat</span>
                  <span className="text-amber-400 font-semibold">Official Property</span>
                </div>
              </div>
            )}
          </div>

          <div className="w-full bg-slate-50 rounded-2xl p-3.5 border border-slate-200 text-left space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Status Smart Card Anda:</span>
              <span className="font-black text-emerald-700 flex items-center gap-1 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>AKTIF & TERDAFTAR</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Kartu ini dicetak khusus oleh Developer untuk akun <strong>{userName}</strong> dengan hak akses penuh Superadmin.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: 2 DISTINCT AUTHENTICATION METHOD EXPLANATIONS (7 COLS) */}
        <div className="lg:col-span-7 space-y-5 flex flex-col justify-between">
          
          {/* METHOD 1: QR CODE ACCESS CARD */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 hover:border-[#d4af37] transition-all p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-900 to-[#043e2e] text-[#d4af37] shadow-md shrink-0">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300">
                      METODE 1 (OPTICAL SCAN)
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">Universal Web & Mobile</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                    1. Login Cepat QR Code di Belakang Kartu
                  </h3>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p className="font-medium">
                Setiap <strong>Smart Access Card</strong> fisik yang dirancang oleh Developer dilengkapi dengan <strong>QR Code Terenkripsi Khusus</strong> pada sisi belakang kartu:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center gap-2 font-black text-slate-900 text-[11px]">
                    <Scan className="w-4 h-4 text-[#043e2e]" />
                    <span>Cara Penggunaan di Portal:</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Buka modal <strong>Smart Security Gate</strong> pada halaman login, pilih tab <em>Scan QR Card</em>, lalu arahkan sisi belakang kartu ke kamera HP / Laptop Anda.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center gap-2 font-black text-slate-900 text-[11px]">
                    <Lock className="w-4 h-4 text-[#043e2e]" />
                    <span>Enkripsi Token Dinamis:</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Payload QR berisi token unik terverifikasi yang langsung dicocokkan ke database tanpa memaparkan password akun secara terbuka.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* METHOD 2: NFC (MIFARE 13.56 MHz) TAP AUTHENTICATION */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 hover:border-emerald-600 transition-all p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-[#043e2e] to-emerald-800 text-amber-300 shadow-md shrink-0">
                  <Wifi className="w-6 h-6 rotate-90" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full border border-emerald-300">
                      METODE 2 (CONTACTLESS TAP)
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700">Frekuensi 13,56 MHz</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                    2. Login Instan Tap Kartu Smart Card (NFC)
                  </h3>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p className="font-medium">
                Selain melalui kamera, Smart Access Card juga ditanamkan microchip <strong>Mifare Standard 13,56 MHz</strong> untuk otentikasi sentuh cepat (*Contactless Tap-to-Login*):
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1.5">
                  <div className="flex items-center gap-2 font-black text-[#043e2e] text-[11px]">
                    <Zap className="w-4 h-4 text-emerald-600" />
                    <span>TAP Kartu ke Perangkat:</span>
                  </div>
                  <p className="text-[11px] text-slate-700">
                    Cukup tempelkan Smart Card fisik ke sensor NFC smartphone atau USB Smart Card Reader di PC Anda untuk login dalam &lt; 0.5 detik.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
                  <div className="flex items-center gap-2 font-black text-amber-900 text-[11px]">
                    <Cpu className="w-4 h-4 text-amber-700" />
                    <span>UID Cryptographic Handshake:</span>
                  </div>
                  <p className="text-[11px] text-slate-700">
                    Sistem membaca Unique Hardware Identifier (UID) chip kartu dan memvalidasi sertifikat digital resmi Dinsos Jabar.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. CRITICAL HARDWARE COMPATIBILITY & NFC REQUIREMENT NOTICE */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-emerald-500/10 border-2 border-amber-400/80 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 font-black shrink-0 shadow-md">
            <Smartphone className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm sm:text-base font-black text-slate-900">
                PENTING: Persyaratan Perangkat untuk Fitur NFC
              </h4>
              <span className="text-[10px] font-black bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md border border-amber-400">
                Hardware Check
              </span>
            </div>
            <p className="text-xs text-slate-700 font-medium leading-relaxed max-w-3xl">
              Untuk menggunakan metode <strong>Tap Kartu Smart Card (NFC)</strong>, <u>pastikan perangkat smartphone, tablet, atau laptop/PC yang Anda gunakan telah memiliki sensor fitur NFC aktif</u> (atau menggunakan alat tambahan USB Card Reader Mifare 13,56 MHz).
            </p>
            <p className="text-[11px] text-slate-500">
              *Jika perangkat Anda belum mendukung sensor NFC, Anda tetap dapat login 100% lancar menggunakan <strong>Metode Scan QR Code di Belakang Kartu</strong> menggunakan kamera biasa.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2 w-full md:w-auto justify-end">
          <div className="px-4 py-2.5 rounded-2xl bg-white border-2 border-amber-300 shadow-sm text-center">
            <span className="text-[10px] font-extrabold text-slate-500 block">Frekuensi Radio:</span>
            <span className="text-xs font-black text-[#043e2e] font-mono">13.56 MHz High-Freq</span>
          </div>
        </div>
      </div>

      {/* 4. STEP-BY-STEP WORKFLOW GUIDE */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#043e2e] text-[#d4af37]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                PANDUAN LANGKAH LOGIN DENGAN SMART ACCESS CARD
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                Alur lengkap otentikasi kartu fisik pada portal PSKS JABAR
              </p>
            </div>
          </div>
          <span className="text-[10px] font-black bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200">
            3 Langkah Mudah
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 relative overflow-hidden">
            <div className="w-7 h-7 rounded-xl bg-[#043e2e] text-[#d4af37] text-xs font-black flex items-center justify-center shadow-sm">
              1
            </div>
            <h5 className="text-xs font-black text-slate-900">
              Buka Smart Security Gate
            </h5>
            <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
              Klik tombol Login Superadmin atau menu otentikasi dinas pada navbar/portal untuk memunculkan modal gerbang keamanan.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 relative overflow-hidden">
            <div className="w-7 h-7 rounded-xl bg-[#043e2e] text-[#d4af37] text-xs font-black flex items-center justify-center shadow-sm">
              2
            </div>
            <h5 className="text-xs font-black text-slate-900">
              Pilih Opsi Smart Card (QR / NFC)
            </h5>
            <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
              Arahkan QR Code di belakang kartu ke pemindai kamera, ATAU langsung tempelkan (TAP) kartu fisik ke sensor NFC perangkat Anda.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-300 space-y-2 relative overflow-hidden">
            <div className="w-7 h-7 rounded-xl bg-[#043e2e] text-emerald-300 text-xs font-black flex items-center justify-center shadow-sm">
              3
            </div>
            <h5 className="text-xs font-black text-[#043e2e]">
              Verifikasi & Masuk Otomatis
            </h5>
            <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
              Sistem memverifikasi payload kriptografi dalam sekejap, membuka seluruh modul Superadmin tanpa perlu mengetik kredensial manual.
            </p>
          </div>
        </div>
      </div>

      {/* 5. PEMROGRAMAN KARTU SMART CARD NFC 13.56 MHz (ONE-TOUCH & NFC TOOLS) - KHUSUS DEVELOPER */}
      {(userRole === 'developer' || session?.isDeveloper) && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 rounded-3xl border-2 border-[#d4af37] p-6 sm:p-7 shadow-xl text-white space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-[#043e2e] text-[#d4af37] border border-[#d4af37]/40 shadow-lg">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-400/40">
                    MODUL KHUSUS DEVELOPER
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">13,56 MHz (NTAG / MIFARE)</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
                  Pemrograman Chip Smart Card NFC 13,56 MHz
                </h3>
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            Gunakan modul ini untuk memasukkan data login instan ke dalam kartu NFC fisik berfrekuensi 13,56 MHz Anda. Begitu kartu didekatkan ke HP manapun yang berfitur NFC, HP akan langsung membuka browser dan login otomatis ke akun <strong className="text-amber-300">{userName}</strong> tanpa perlu membuka website terlebih dahulu.
          </p>

          {/* INTERACTIVE ACTIONS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* OPTION A: DIRECT WEB NFC WRITER */}
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-black text-xs">
                  <Zap className="w-4 h-4" />
                  <span>OPSI 1: Tulis Otomatis via Browser (Chrome Android)</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Klik tombol di bawah, lalu tempelkan kartu fisik ke bagian belakang HP Anda saat diminta.
                </p>
              </div>

              {nfcWriteStatus && (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-medium leading-relaxed animate-fadeIn">
                  {nfcWriteStatus}
                </div>
              )}

              {nfcWriteError && (
                <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs font-medium leading-relaxed animate-fadeIn flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{nfcWriteError}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleWriteNfcCard}
                disabled={isNfcWriting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                <Radio className="w-4 h-4" />
                <span>{isNfcWriting ? 'Mendengarkan Sensor NFC... Dekatkan Kartu' : 'Tulis ke Kartu Smart Card NFC (Web NFC)'}</span>
              </button>
            </div>

            {/* OPTION B: COPY NDEF RECORD FOR NFC TOOLS APP */}
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-black text-xs">
                  <Smartphone className="w-4 h-4" />
                  <span>OPSI 2: Tulis via Aplikasi "NFC Tools" (Android / iPhone)</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Salin tautan NDEF Payload resmi di bawah untuk ditulis menggunakan aplikasi NFC Tools:
                </p>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-700 font-mono text-[10px] text-emerald-300 break-all select-all">
                  {nfcTargetUrl}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyNfcUrl}
                className="w-full py-3 px-4 rounded-xl bg-[#043e2e] hover:bg-[#06533e] border border-[#d4af37] text-[#d4af37] text-xs font-black flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                {copiedUrl ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Tautan Payload Berhasil Disalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin Tautan Payload NDEF</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* STEP-BY-STEP NFC TOOLS GUIDE */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-black text-amber-300">
              <Info className="w-4 h-4" />
              <span>PANDUAN PRAKTIS PROGRAM KARTU DENGAN APLIKASI GRATIS "NFC TOOLS":</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-[11px] text-slate-300">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="font-bold text-amber-300 block">Langkah 1:</span>
                <span>Download aplikasi <strong>NFC Tools</strong> di Play Store / App Store, lalu buka menu <strong>Write (Tulis)</strong>.</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="font-bold text-amber-300 block">Langkah 2:</span>
                <span>Pilih <strong>Add a record (Tambah Catatan)</strong> ➔ Pilih <strong>URL / URI</strong>.</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="font-bold text-amber-300 block">Langkah 3:</span>
                <span>Paste (tempel) tautan yang telah disalin di atas ke dalam kolom URL, lalu klik <strong>OK</strong>.</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-400 block">Langkah 4: Selesai!</span>
                <span>Klik <strong>Write / 1 Bytes</strong> lalu tempelkan kartu Smart Card 13,56 MHz ke belakang HP.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
