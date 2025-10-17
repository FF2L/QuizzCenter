import { BaseEntity } from "src/common/enitty/base.entity";
import { LoaiKiemTra } from "src/common/enum/loaiKiemTra.enum";
import { LopHocPhan } from "src/lop-hoc-phan/entities/lop-hoc-phan.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { ChiTietCauHoiBaiKiemTra } from "./chi-tiet-cau-hoi-bai-kiem-tra";
import { BaiLamSinhVien } from "src/bai-lam-sinh-vien/entities/bai-lam-sinh-vien.entity";

@Entity()
export class BaiKiemTra extends BaseEntity {

    @Column()
    tenBaiKiemTra: string

    @Column({
        type: 'enum',
        enum: LoaiKiemTra,
        default: LoaiKiemTra.BaiKiemTra
    })
    loaiKiemTra: LoaiKiemTra

    @Column()
    soLanLam: number

    @Column({nullable: true,default: true})
    phatHanhBaKiemTra: boolean

    @Column()
    xemBaiLam: boolean

    @Column()
    hienThiKetQua: boolean

    @Column({type: 'timestamp'})
    thoiGianBatDau: Date

    @Column({type: 'timestamp'})
    thoiGianKetThuc: Date

    @Column()
    thoiGianLam: number

    @ManyToOne(() => LopHocPhan, (lopHocPhan) => lopHocPhan.baiKiemTra, {lazy: true})
    @JoinColumn({name: 'idLopHocPhan'})
    lopHocPhan: Promise<LopHocPhan>
    @Column() idLopHocPhan:number

    @OneToMany(() => ChiTietCauHoiBaiKiemTra, (chiTietCauHoiBaiKiem) => chiTietCauHoiBaiKiem.baiKiemTra, {cascade: true, lazy:true})
    chiTietCauHoiBaiKiemTra: Promise<ChiTietCauHoiBaiKiemTra[]>

    @OneToMany(() => BaiLamSinhVien, (baiLamSinhVien) => baiLamSinhVien.baiKiemTra, {cascade:true,lazy: true})
    baiLamSinhVien: Promise<BaiLamSinhVien[]>

}
