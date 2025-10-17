import { ChiTietCauHoiBaiKiemTra } from "src/bai-kiem-tra/entities/chi-tiet-cau-hoi-bai-kiem-tra";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { BaiLamSinhVien } from "./bai-lam-sinh-vien.entity";
import { DapAn } from "src/dap-an/entities/dap-an.entity";

@Entity()
@Unique(['idBaiLamSinhVien', 'idCauHoiBaiKiemTra'])
export class ChiTietBaiLam {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ default: 0 })
    diemDat: number

    @ManyToOne(() => ChiTietCauHoiBaiKiemTra, (chiTietCauHoiBaiKiemTra) => chiTietCauHoiBaiKiemTra.chiTietBaiLam, {lazy: true, onDelete: 'CASCADE'})
    @JoinColumn({name: 'idCauHoiBaiKiemTra'})
    cauHoiBaiKiemTra: Promise<ChiTietCauHoiBaiKiemTra>
    @Column() idCauHoiBaiKiemTra: number

    @ManyToOne(() => BaiLamSinhVien, (baiLamSinhVien) => baiLamSinhVien.chiTietBaiLam, {lazy: true, onDelete: 'CASCADE'})
    @JoinColumn({name: 'idBaiLamSinhVien'})
    baiLamSinhVien: Promise<BaiLamSinhVien>
    @Column() idBaiLamSinhVien: number

    // @ManyToOne(() => DapAn, (dapAn) => dapAn.chiTietBaiLam, {lazy: true, nullable: true, onDelete: 'SET NULL'})
    // @JoinColumn({name: 'idDapAn'})
    // dapAn: Promise<DapAn | null>
    @Column({ nullable: true, array: true,type: 'int' }) mangIdDapAn: number[] | null
}