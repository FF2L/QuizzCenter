import { useEffect, useRef, useState, useCallback } from "react";
import { updateThoiGianSuDung } from "../socket/supabaseClient";


interface UseTimeTrackingProps {
  idBaiLamSinhVien: number | null;
  loaiKiemTra: string; // BaiKiemTra / LuyenTap
  thoiGianLam?: number; // tổng thời gian cho phép (giây)
  thoiGianKetThucCuaSo?: string;
  isActive: boolean;
  onTimeUp?: () => void;
  initialUsedSeconds?: number;
  storageKey?: string;
}

export const useTimeTracking = ({
  idBaiLamSinhVien,
  loaiKiemTra,
  thoiGianLam,
  thoiGianKetThucCuaSo,
  isActive,
  onTimeUp,
  initialUsedSeconds = 0,
  storageKey,
}: UseTimeTrackingProps) => {
  const [elapsed, setElapsed] = useState(0);
  const [remain, setRemain] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ===================== INIT ==========================
  useEffect(() => {
    if (loaiKiemTra === "BaiKiemTra") {
      // COUNTDOWN
      let baseRemain = thoiGianLam ?? 0;

      if (storageKey) {
        const fromLS = Number(localStorage.getItem(storageKey));
        if (!isNaN(fromLS) && fromLS >= 0 && fromLS <= baseRemain) {
          baseRemain = fromLS;
        } else {
          // từ BE
          baseRemain = Math.max(0, (thoiGianLam ?? 0) - initialUsedSeconds);
        }
      }

      setRemain(baseRemain);
      setElapsed((thoiGianLam ?? 0) - baseRemain);
    } else {
      // LUYENTAP → COUNTUP
      let baseElapsed = 0;

      if (storageKey) {
        const fromLS = Number(localStorage.getItem(storageKey));
        if (!isNaN(fromLS) && fromLS >= 0) {
          baseElapsed = fromLS;
        } else {
          baseElapsed = initialUsedSeconds;
        }
      }

      setElapsed(baseElapsed);
      setRemain(0);
    }
  }, [loaiKiemTra, thoiGianLam, storageKey, initialUsedSeconds]);


  // =============== UPDATE SUPABASE ======================
  const syncToSupabase = useCallback(
    async (usedSeconds: number) => {
      if (!idBaiLamSinhVien) return;
      try {
        await updateThoiGianSuDung(idBaiLamSinhVien, usedSeconds);
      } catch (err) {
        console.error("Supabase update error:", err);
      }
    },
    [idBaiLamSinhVien]
  );

  // =============== TIMER LOOP ==========================
  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (loaiKiemTra === "BaiKiemTra") {
      // COUNTDOWN
      timerRef.current = setInterval(() => {
        setRemain((prev) => {
          const next = Math.max(0, prev - 1);
          const used = (thoiGianLam ?? 0) - next;

          // lưu LS
          if (storageKey) localStorage.setItem(storageKey, String(next));

          // update DB
          void syncToSupabase(used);

          // hết giờ
          const expired = next <= 0;
          const expiredWindow = thoiGianKetThucCuaSo
            ? Date.now() >= new Date(thoiGianKetThucCuaSo).getTime()
            : false;

          if ((expired || expiredWindow) && onTimeUp) {
            clearInterval(timerRef.current!);
            onTimeUp();
          }

          setElapsed(used);

          return next;
        });
      }, 1000);
    } else {
      // COUNTUP — Luyện tập
      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 1;

          if (storageKey) localStorage.setItem(storageKey, String(next));

          // update DB
          void syncToSupabase(next);

          return next;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [
    isActive,
    loaiKiemTra,
    thoiGianLam,
    onTimeUp,
    storageKey,
    syncToSupabase,
    thoiGianKetThucCuaSo,
  ]);

  const forceSave = useCallback(async () => {
    if (!storageKey) return;

    if (loaiKiemTra === "BaiKiemTra") {
      localStorage.setItem(storageKey, String(remain));
      await syncToSupabase((thoiGianLam ?? 0) - remain);
    } else {
      localStorage.setItem(storageKey, String(elapsed));
      await syncToSupabase(elapsed);
    }
  }, [loaiKiemTra, elapsed, remain, storageKey, syncToSupabase, thoiGianLam]);

  const fmt = (sec: number) =>
    new Date(sec * 1000).toISOString().substring(11, 19);

  return {
    timeElapsed: elapsed, // luyện tập dùng cái này
    timeRemaining: remain, // bài kiểm tra dùng cái này
    timeElapsedFormatted: fmt(elapsed),
    timeRemainingFormatted: fmt(remain),
    forceSave,
  };
};
