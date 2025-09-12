import { CauHoi } from "src/cau-hoi/entities/cau-hoi.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { BaiKiemTra } from "./bai-kiem-tra.entity";
import { ChiTietBaiLam } from "src/bai-lam-sinh-vien/entities/chi-tiet-bai-lam.entity";

@Entity()
export class ChiTietCauHoiBaiKiemTra {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    diem:number

    @ManyToOne(() => CauHoi, (cauHoi) => cauHoi.chiTietCauHoiBaiKiemTra, {lazy: true})
    @JoinColumn({name: 'idCauHoi'})
    idCauHoi: Promise<CauHoi>

    @ManyToOne(()=> BaiKiemTra, (baiKiemTra) => baiKiemTra.chiTietCauHoiBaiKiemTra, {lazy:true})
    @JoinColumn({name: 'idBaiKiemTra'})
    idBaiKiemTra: Promise<BaiKiemTra>

    @OneToMany(()=>ChiTietBaiLam, (chiTietBaiLam) => chiTietBaiLam.idCauHoiBaiKiemTra, {cascade:true, lazy: true})
    chiTietBaiLam: Promise<ChiTietBaiLam[]>
}