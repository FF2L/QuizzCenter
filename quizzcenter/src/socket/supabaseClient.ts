import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

console.log(process.env)
console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Anon Key:", supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export const updateThoiGianSuDung = async (
  idBaiLamSinhVien: number,
  thoiGianSuDung: number
) => {
  // elapsed = tổng số giây đã dùng tính ở FE
  const { data, error } = await supabase
    .from('bai_lam_sinh_vien')
    .update({ thoiGianSuDung })   // <-- GHI ĐÈ trực tiếp
    .eq('id', idBaiLamSinhVien)
    .select();

  if (error) {
    console.error('Error updating time:', error);
    return null;
  }

  return data;
};
