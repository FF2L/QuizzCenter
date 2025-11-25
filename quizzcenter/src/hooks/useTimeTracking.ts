import { useEffect, useRef, useState, useCallback } from "react";
import { updateThoiGianSuDung } from "../socket/supabaseClient";

interface UseTimeTrackingProps {
  idBaiLamSinhVien: number | null;
  loaiKiemTra: string;
  thoiGianLam?: number;
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

  // ===================== INIT - Chạy mỗi khi có sự thay đổi ==========================
  useEffect(() => {
    console.log('🎬 INIT/UPDATE useTimeTracking:', {
      loaiKiemTra,
      thoiGianLam,
      initialUsedSeconds,
      storageKey,
      idBaiLamSinhVien
    });

    if (loaiKiemTra === "BaiKiemTra") {
      // COUNTDOWN - Bài kiểm tra
      const totalSeconds = thoiGianLam ?? 0;
      let baseRemain = totalSeconds;

      if (storageKey) {
        const fromLS = localStorage.getItem(storageKey);
        console.log('📦 localStorage remain:', fromLS);
        
        if (fromLS !== null) {
          const parsed = Number(fromLS);
          if (!isNaN(parsed) && parsed >= 0 && parsed <= totalSeconds) {
            baseRemain = parsed;
            console.log('✅ Dùng remain từ localStorage:', baseRemain);
          } else {
            console.log('⚠️ localStorage không hợp lệ, tính từ backend');
            baseRemain = Math.max(0, totalSeconds - initialUsedSeconds);
          }
        } else {
          console.log('⚠️ Không có localStorage, tính từ backend');
          baseRemain = Math.max(0, totalSeconds - initialUsedSeconds);
        }
      } else {
        console.log('⚠️ Không có storageKey');
        baseRemain = Math.max(0, totalSeconds - initialUsedSeconds);
      }

      const usedSeconds = totalSeconds - baseRemain;
      
      console.log('🔵 Bài kiểm tra INIT/UPDATE:', {
        total: totalSeconds,
        used: usedSeconds,
        remain: baseRemain
      });

      setRemain(baseRemain);
      setElapsed(usedSeconds);

    } else {
      // COUNTUP - Luyện tập
      let baseElapsed = 0;

      if (storageKey) {
        const fromLS = localStorage.getItem(storageKey);
        console.log('📦 localStorage elapsed:', fromLS);
        
        if (fromLS !== null) {
          const parsed = Number(fromLS);
          if (!isNaN(parsed) && parsed >= 0) {
            baseElapsed = parsed;
            console.log('✅ Dùng elapsed từ localStorage:', baseElapsed);
          } else {
            console.log('⚠️ localStorage không hợp lệ, dùng backend');
            baseElapsed = initialUsedSeconds;
          }
        } else {
          console.log('⚠️ Không có localStorage, dùng backend');
          baseElapsed = initialUsedSeconds;
        }
      } else {
        baseElapsed = initialUsedSeconds;
      }

      console.log('🟢 Luyện tập INIT/UPDATE:', {
        elapsed: baseElapsed
      });

      setElapsed(baseElapsed);
      setRemain(0);
    }
  }, [loaiKiemTra, thoiGianLam, initialUsedSeconds, storageKey, idBaiLamSinhVien]);

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

          // Lưu remain vào localStorage
          if (storageKey) {
            localStorage.setItem(storageKey, String(next));
          }

          // Update DB mỗi giây để chính xác tuyệt đối
          void syncToSupabase(used);

          // Kiểm tra hết giờ
          const expired = next <= 0;
          const expiredWindow = thoiGianKetThucCuaSo
            ? Date.now() >= new Date(thoiGianKetThucCuaSo).getTime()
            : false;

          if ((expired || expiredWindow) && onTimeUp) {
            console.log('⏰ HẾT GIỜ! Auto submit...');
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

          // Lưu elapsed vào localStorage
          if (storageKey) {
            localStorage.setItem(storageKey, String(next));
          }

          // Update DB mỗi giây để chính xác tuyệt đối
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
    if (!storageKey || !idBaiLamSinhVien) return;

    if (loaiKiemTra === "BaiKiemTra") {
      const currentUsed = (thoiGianLam ?? 0) - remain;
      
      // Lưu localStorage
      localStorage.setItem(storageKey, String(remain));
      
      // Lưu backend với thời gian HIỆN TẠI (không phải thời gian đã mod 5)
      await syncToSupabase(currentUsed);
      
      console.log('💾 Force save (BaiKiemTra):', {
        remain,
        used: currentUsed,
        timestamp: new Date().toLocaleTimeString()
      });
    } else {
      // Luyện tập - lưu elapsed hiện tại
      localStorage.setItem(storageKey, String(elapsed));
      await syncToSupabase(elapsed);
      
      console.log('💾 Force save (LuyenTap):', {
        elapsed,
        timestamp: new Date().toLocaleTimeString()
      });
    }
  }, [loaiKiemTra, elapsed, remain, storageKey, syncToSupabase, thoiGianLam, idBaiLamSinhVien]);

  const fmt = (sec: number) =>
    new Date(sec * 1000).toISOString().substring(11, 19);

  return {
    timeElapsed: elapsed,
    timeRemaining: remain,
    timeElapsedFormatted: fmt(elapsed),
    timeRemainingFormatted: fmt(remain),
    forceSave,
  };
};