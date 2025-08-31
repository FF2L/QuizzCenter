import { ChiTietCauHoiBaiKiemTra } from "src/bai-kiem-tra/entities/chi-tiet-cau-hoi-bai-kiem-tra";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { BaiLamSinhVien } from "./bai-lam-sinh-vien.entity";
import { DapAn } from "src/dap-an/entities/dap-an.entity";

@Entity()
export class ChiTietBaiLam {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    diemDat: number

    @ManyToOne(()=>ChiTietCauHoiBaiKiemTra, (chiTietCauHoiBaiKiemTra)=> chiTietCauHoiBaiKiemTra.chiTietBaiLam, {lazy:true})
    @JoinColumn({name: 'idCauHoiBaiKieTra'})
    idCauHoiBaiKiemTra: Promise<ChiTietCauHoiBaiKiemTra>

    @ManyToOne(() => BaiLamSinhVien, (baiLamSinhVien) => baiLamSinhVien.chiTietBaiLam, {lazy:true})
    @JoinColumn({name: 'idBaiLamSinhVien'})
    idBaiLamSinhVien: Promise<BaiLamSinhVien>

    @ManyToMany(() => DapAn, (dapAn) => dapAn.chiTietBaiLam, {cascade:true, lazy:true})
    @JoinTable({name: 'ChiTietBaiLam_DapAn'})
    dapAn:Promise<DapAn[]>

}