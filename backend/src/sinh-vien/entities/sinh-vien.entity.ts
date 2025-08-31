import { BaiLamSinhVien } from "src/bai-lam-sinh-vien/entities/bai-lam-sinh-vien.entity";
import { LopHocPhan } from "src/lop-hoc-phan/entities/lop-hoc-phan.entity";
import { NguoiDung } from "src/nguoi-dung/entities/nguoi-dung.entity";
import { Column, Entity, JoinColumn, ManyToMany, OneToMany, OneToOne, PrimaryColumn } from "typeorm";

@Entity()
export class SinhVien {

    @PrimaryColumn()
    @OneToOne(() => NguoiDung, (nguoiDung) => nguoiDung.sinhVien, {lazy:true})
    @JoinColumn({name: 'idNguoiDung'})
    idNguoiDung: Promise<NguoiDung>

    @Column()
    khoaHoc: string

    @ManyToMany(() => LopHocPhan, (lopHocPhan) => lopHocPhan.sinhVien, {lazy: true})
    lopHocPhan: Promise<LopHocPhan[]>

    @OneToMany(() => BaiLamSinhVien, (baiLamSinhVien) => baiLamSinhVien.idSinhVien, {lazy:true})
    baiKiemTra: Promise<BaiLamSinhVien[]>

}
