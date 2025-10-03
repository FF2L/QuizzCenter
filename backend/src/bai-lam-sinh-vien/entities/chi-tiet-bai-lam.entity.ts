import { ChiTietCauHoiBaiKiemTra } from "src/bai-kiem-tra/entities/chi-tiet-cau-hoi-bai-kiem-tra";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { BaiLamSinhVien } from "./bai-lam-sinh-vien.entity";
import { DapAn } from "src/dap-an/entities/dap-an.entity";

@Entity()
@Unique(['idBaiLamSinhVien', 'idCauHoiBaiKiemTra', 'dapAn'])
export class ChiTietBaiLam {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    diemDat: number

    @ManyToOne(()=>ChiTietCauHoiBaiKiemTra, (chiTietCauHoiBaiKiemTra)=> chiTietCauHoiBaiKiemTra.chiTietBaiLam, {lazy:true})
    @JoinColumn({name: 'idCauHoiBaiKiemTra'})
    cauHoiBaiKiemTra: Promise<ChiTietCauHoiBaiKiemTra>
    @Column() idCauHoiBaiKiemTra: number

    @ManyToOne(() => BaiLamSinhVien, (baiLamSinhVien) => baiLamSinhVien.chiTietBaiLam, {lazy:true})
    @JoinColumn({name: 'idBaiLamSinhVien'})
    baiLamSinhVien: Promise<BaiLamSinhVien>
    @Column() idBaiLamSinhVien: number

    @ManyToOne(() => DapAn, (dapAn) => dapAn.chiTietBaiLam, {lazy:true})
    @JoinColumn({name: 'idDapAn'})
    dapAn:Promise<DapAn[]>

}