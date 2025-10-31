import { VaiTro } from "./gobal.type";

    export const roles: {value: VaiTro; label: string}[] = [
        { value: "Admin", label: "Admin" },
        { value: "GiaoVien", label: "Giảng viên" },
        { value: "SinhVien", label: "Sinh viên" },
    ];

    export const phone10 = /^[0-9]{10}$/;
    export const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // giữ nguyên ngày theo local, không bị shift
export const toDateInput = (v: string | Date) => {
  const d = new Date(v);
  const off = d.getTimezoneOffset();            // phút lệch so với UTC
  const dLocal = new Date(d.getTime() - off * 60 * 1000);
  return dLocal.toISOString().slice(0, 10);     // YYYY-MM-DD
};
export const isValidDate = (v: any) => {
  const d = new Date(v);
  return !Number.isNaN(d.getTime());
};

export const toDateDisplay = (v: string | Date) => {
  const d = new Date(v);
  const off = d.getTimezoneOffset();
  const dLocal = new Date(d.getTime() - off * 60 * 1000);
  const [yyyy, mm, dd] = dLocal.toISOString().slice(0, 10).split("-");
  return `${dd}-${mm}-${yyyy}`;
};

