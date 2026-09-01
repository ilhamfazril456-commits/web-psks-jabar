import { writeBatch, doc, collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db, isQuotaError } from './firebase';
import { SystemLog, UserSession } from '../types';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const STORAGE_KEY = 'psks_system_logs';

const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

/**
 * Format timestamp in Indonesian locale with Day, Date, Month, Year & Time:
 * Contoh: "Senin, 17 Agustus 2026 • 14:25:30 WIB"
 */
export function formatLogTimestamp(date: Date = new Date()): string {
  const dayName = DAYS[date.getDay()];
  const d = date.getDate().toString().padStart(2, '0');
  const m = MONTHS[date.getMonth()];
  const y = date.getFullYear();
  const hh = date.getHours().toString().padStart(2, '0');
  const mm = date.getMinutes().toString().padStart(2, '0');
  const ss = date.getSeconds().toString().padStart(2, '0');
  return `${dayName}, ${d} ${m} ${y} • ${hh}:${mm}:${ss} WIB`;
}

/**
 * Relative time calculation (e.g. "Baru saja", "5 menit yang lalu", "2 jam yang lalu")
 */
export function formatRelativeTime(timestampMs: number): string {
  const diff = Date.now() - timestampMs;
  if (diff < 10000) return 'Baru saja';
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds} dtk lalu`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} mnt lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Kemarin';
  if (days < 30) return `${days} hari lalu`;
  return `${Math.floor(days / 30)} bln lalu`;
}

/**
 * Save log locally in localStorage for fast UI rendering & offline fallback
 */
export function saveLocalLog(log: SystemLog): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: SystemLog[] = raw ? JSON.parse(raw) : [];
    // Prepend new log
    const updated = [log, ...list.filter((l) => l.id !== log.id)].slice(0, 500);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save local log:', e);
  }
}

/**
 * Check if the user is a valid authenticated Admin or Superadmin.
 * MUST NOT be guest/Tamu Publik, role 'user', or developer.
 */
export function isEligibleAdminActor(session: UserSession | null | undefined): boolean {
  if (!session) return false;
  const role = (session.role || '').toLowerCase();
  const name = (session.nama || '').toLowerCase().trim();

  // Exclude developer & guests strictly
  if (
    role === 'developer' ||
    role === 'user' ||
    session.isDeveloper === true ||
    session.statusActive !== 'SAH_TERDAFTAR' ||
    name === 'tamu publik' ||
    name === 'tamu' ||
    name.includes('developer') ||
    name.includes('ilham') ||
    name === ''
  ) {
    return false;
  }

  return role === 'admin' || role === 'superadmin';
}

export function isDeveloperActor(session: UserSession | null | undefined): boolean {
  if (!session) return false;
  const role = (session.role || '').toLowerCase();
  const name = (session.nama || '').toLowerCase();
  return (
    role === 'developer' ||
    session.isDeveloper === true ||
    name.includes('ilham') ||
    name.includes('developer')
  );
}

export const INITIAL_SAMPLE_LOGS: SystemLog[] = [
  {
    id: 'log-sample-1',
    timestamp: formatLogTimestamp(new Date(Date.now() - 15 * 60 * 1000)),
    createdAt: Date.now() - 15 * 60 * 1000,
    actorName: 'Admin Dinsos Kota Cimahi',
    actorRole: 'admin',
    actorWilayah: 'Kota Cimahi',
    category: 'PSKS',
    actionType: 'APPROVE',
    targetCollection: 'registration_submissions',
    targetId: 'sub-peksos-101',
    targetName: 'Rina Kusuma, S.Sos',
    targetPillar: 'PEKSOS PROFESIONAL',
    targetWilayah: 'Kota Cimahi',
    details: 'Admin Kota Cimahi MENERIMA "Rina Kusuma, S.Sos" sebagai anggota PEKSOS PROFESIONAL (Wilayah: Kota Cimahi)',
  },
  {
    id: 'log-sample-2',
    timestamp: formatLogTimestamp(new Date(Date.now() - 40 * 60 * 1000)),
    createdAt: Date.now() - 40 * 60 * 1000,
    actorName: 'Admin Dinsos Kota Bandung',
    actorRole: 'admin',
    actorWilayah: 'Kota Bandung',
    category: 'PSKS',
    actionType: 'REJECT',
    targetCollection: 'registration_submissions',
    targetId: 'sub-psm-102',
    targetName: 'Dodi Firmansyah',
    targetPillar: 'PSM',
    targetWilayah: 'Kota Bandung',
    details: 'Admin Kota Bandung MENOLAK pengajuan pendaftaran "Dodi Firmansyah" sebagai anggota PSM. Alasan: Berkas surat keterangan domisili belum lengkap.',
  },
  {
    id: 'log-sample-3',
    timestamp: formatLogTimestamp(new Date(Date.now() - 75 * 60 * 1000)),
    createdAt: Date.now() - 75 * 60 * 1000,
    actorName: 'Superadmin Dinsos Jabar',
    actorRole: 'superadmin',
    actorWilayah: 'Prov. Jabar',
    category: 'ADMIN_ACCOUNT',
    actionType: 'CREATE',
    targetCollection: 'admin_accounts',
    targetId: 'adm-1723869000',
    targetName: 'Budi Prasetyo (admin_garut)',
    targetWilayah: 'Kab. Garut',
    details: 'Superadmin Dinsos Jabar MENAMBAHKAN akun admin baru "Budi Prasetyo" (admin_garut) untuk wilayah Kab. Garut (Peran: Admin Wilayah)',
  },
  {
    id: 'log-sample-4',
    timestamp: formatLogTimestamp(new Date(Date.now() - 2 * 60 * 60 * 1000)),
    createdAt: Date.now() - 2 * 60 * 60 * 1000,
    actorName: 'Admin Dinsos Kab. Garut',
    actorRole: 'admin',
    actorWilayah: 'Kab. Garut',
    category: 'PSKS',
    actionType: 'CREATE',
    targetCollection: 'psks_records',
    targetId: 'peksos-1723871234',
    targetName: 'Ahmad Fauzi, S.Sos',
    targetPillar: 'PEKSOS PROFESIONAL',
    targetWilayah: 'Kab. Garut',
    details: 'Admin Kab. Garut MENAMBAHKAN anggota baru Pilar PEKSOS PROFESIONAL atas nama "Ahmad Fauzi, S.Sos" (Wilayah: Kab. Garut)',
  },
  {
    id: 'log-sample-5',
    timestamp: formatLogTimestamp(new Date(Date.now() - 4 * 60 * 60 * 1000)),
    createdAt: Date.now() - 4 * 60 * 60 * 1000,
    actorName: 'Admin Dinsos Kab. Bekasi',
    actorRole: 'admin',
    actorWilayah: 'Kab. Bekasi',
    category: 'PSKS',
    actionType: 'DELETE',
    targetCollection: 'psks_records',
    targetId: 'tksk-1723830000',
    targetName: 'Dedi Kurniawan',
    targetPillar: 'TKSK',
    targetWilayah: 'Kab. Bekasi',
    details: 'Admin Kab. Bekasi MENGHAPUS anggota Pilar TKSK atas nama "Dedi Kurniawan" (Wilayah: Kab. Bekasi)',
  },
];

/**
 * Filter out corrupt, tamu publik, or developer logs
 */
export function sanitizeLogEntries(rawLogs: SystemLog[]): SystemLog[] {
  return rawLogs.filter((l) => {
    if (!l) return false;
    const actorRole = (l.actorRole || '').toLowerCase();
    const actorName = (l.actorName || '').toLowerCase().trim();
    const details = (l.details || '').toLowerCase();

    // Strictly ban 'tamu publik', 'tamu', 'user' role, and developer
    if (
      actorRole === 'user' ||
      actorRole === 'developer' ||
      actorName === 'tamu publik' ||
      actorName === 'tamu' ||
      actorName.includes('tamu publik') ||
      actorName.includes('developer') ||
      actorName.includes('ilham') ||
      details.includes('tamu publik')
    ) {
      return false;
    }
    return true;
  });
}

/**
 * Get local logs (cleaned of invalid entries)
 */
export function getLocalLogs(): SystemLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_LOGS));
      return INITIAL_SAMPLE_LOGS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const sanitized = sanitizeLogEntries(parsed);
      if (sanitized.length === 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_LOGS));
        return INITIAL_SAMPLE_LOGS;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
      return sanitized;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_LOGS));
    return INITIAL_SAMPLE_LOGS;
  } catch (e) {
    console.error('Failed to parse local logs:', e);
    return INITIAL_SAMPLE_LOGS;
  }
}

/**
 * Record a system activity log with batch-write capability.
 * ONLY records if actor is a valid authenticated Admin or Superadmin.
 */
export async function recordSystemActivity(params: {
  session: UserSession | null | undefined;
  category: 'PSKS' | 'ADMIN_ACCOUNT' | 'SYSTEM' | string;
  actionType: 'SET' | 'DELETE' | 'CREATE' | 'UPDATE' | 'APPROVE' | 'REJECT' | 'CLEAR' | string;
  targetCollection: 'psks_records' | 'admin_accounts' | 'app_settings' | 'admin_messages' | 'registration_submissions' | string;
  targetId: string;
  targetName?: string;
  targetPillar?: string;
  targetWilayah?: string;
  details: string;
}): Promise<SystemLog | null> {
  const {
    session,
    category,
    actionType,
    targetCollection,
    targetId,
    targetName,
    targetPillar,
    targetWilayah,
    details,
  } = params;

  // STRICT GUARD: Must be authenticated Admin or Superadmin
  if (!isEligibleAdminActor(session)) {
    return null;
  }

  const currentSession = session!;
  const actorRole = currentSession.role === 'superadmin' ? 'superadmin' : 'admin';
  const now = Date.now();
  const logId = `log-${now}-${Math.random().toString(36).substring(2, 7)}`;
  const logData: SystemLog = {
    id: logId,
    timestamp: formatLogTimestamp(new Date(now)),
    createdAt: now,
    actorName: currentSession.nama || (actorRole === 'superadmin' ? 'Superadmin Pusat' : 'Admin Wilayah'),
    actorRole,
    actorWilayah: currentSession.wilayah || 'Jawa Barat',
    category,
    actionType,
    targetCollection,
    targetId,
    targetName,
    targetPillar,
    targetWilayah,
    details,
  };

  // 1. Immediately save to LocalStorage for instant UI feedback
  saveLocalLog(logData);

  // 2. Clean undefined values for Firestore compatibility
  const cleanLogData: Record<string, any> = {};
  Object.keys(logData).forEach((k) => {
    const val = (logData as Record<string, any>)[k];
    if (val !== undefined) {
      cleanLogData[k] = val;
    }
  });

  // 3. Commit to Firestore using batch write
  try {
    const batch = writeBatch(db);
    const logRef = doc(db, 'system_logs', logId);
    batch.set(logRef, cleanLogData);
    await batch.commit();
  } catch (err) {
    if (isQuotaError(err)) {
      console.warn('[Activity Log] Quota exceeded, log saved to offline local storage.');
    } else {
      console.error('[Activity Log] Error committing batch write log:', err);
    }
  }

  return logData;
}

/**
 * Instantly wipe all activity logs from both LocalStorage and Firestore database.
 */
export async function clearAllSystemLogs(): Promise<number> {
  let totalDeleted = 0;

  // 1. Clear LocalStorage immediately
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  } catch (e) {
    console.error('Failed to wipe local logs:', e);
  }

  // 2. Wipe Firestore collection `system_logs` in batches of 400
  try {
    const logsRef = collection(db, 'system_logs');
    let hasMore = true;
    while (hasMore) {
      const q = query(logsRef, limit(400));
      const snap = await getDocs(q);
      if (snap.empty) {
        hasMore = false;
        break;
      }
      const batch = writeBatch(db);
      snap.forEach((docSnap) => {
        batch.delete(docSnap.ref);
        totalDeleted++;
      });
      await batch.commit();
      if (snap.size < 400) {
        hasMore = false;
      }
    }
  } catch (err) {
    console.warn('[Clear All Logs] Firestore batch delete note:', err);
  }

  return totalDeleted;
}

/**
 * Auto-purge mechanism: deletes logs older than 30 days in Firestore & LocalStorage
 */
export async function autoPurgeOldLogs(): Promise<number> {
  const cutoffTime = Date.now() - THIRTY_DAYS_MS;
  let purgedCount = 0;

  // 1. Purge from LocalStorage
  try {
    const localLogs = getLocalLogs();
    const freshLogs = localLogs.filter((log) => (log.createdAt || 0) >= cutoffTime);
    if (freshLogs.length !== localLogs.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(freshLogs));
    }
  } catch (e) {
    console.error('Failed to purge local logs:', e);
  }

  // 2. Purge from Firestore using batch delete (limit 100 per run to minimize quota)
  try {
    const logsRef = collection(db, 'system_logs');
    const oldLogsQuery = query(
      logsRef,
      where('createdAt', '<', cutoffTime),
      limit(100)
    );

    const snapshot = await getDocs(oldLogsQuery);
    if (!snapshot.empty) {
      const batch = writeBatch(db);
      snapshot.forEach((docSnap) => {
        batch.delete(docSnap.ref);
        purgedCount++;
      });
      await batch.commit();
      console.log(`[Auto-Purge] Successfully purged ${purgedCount} expired system logs (>30 days old).`);
    }
  } catch (err) {
    // Quota or network error, fail quietly
    console.warn('[Auto-Purge] Skipped Firestore purge:', err);
  }

  return purgedCount;
}
