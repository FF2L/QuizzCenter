import { BaiLamSinhVien } from "src/bai-lam-sinh-vien/entities/bai-lam-sinh-vien.entity";
import { LopHocPhan } from "src/lop-hoc-phan/entities/lop-hoc-phan.entity";
import { NguoiDung } from "src/nguoi-dung/entities/nguoi-dung.entity";
import { Column, Entity, JoinColumn, ManyToMany, OneToMany, OneToOne, PrimaryColumn } from "typeorm";

@Entity()
export class SinhVien {

    @PrimaryColumn({ name: 'idNguoiDung', type: 'int' })
    idNguoiDung: number;

    @OneToOne(() => NguoiDung, (nd) => nd.giangVien, { lazy: true })
    @JoinColumn({ name: 'idNguoiDung', referencedColumnName: 'id' })
    nguoiDung: Promise<NguoiDung>;

    @Column()
    khoaHoc: string

    @ManyToMany(() => LopHocPhan, (lopHocPhan) => lopHocPhan.sinhVien, {lazy: true})
    lopHocPhan: Promise<LopHocPhan[]>

    @OneToMany(() => BaiLamSinhVien, (baiLamSV) => baiLamSV.sinhVien, {lazy:true})
    baiLamSInhVien: Promise<BaiLamSinhVien[]>

}
