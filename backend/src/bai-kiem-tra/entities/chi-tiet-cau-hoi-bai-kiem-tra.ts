import { CauHoi } from "src/cau-hoi/entities/cau-hoi.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { BaiKiemTra } from "./bai-kiem-tra.entity";
import { ChiTietBaiLam } from "src/bai-lam-sinh-vien/entities/chi-tiet-bai-lam.entity";
import { BaseEntity } from "src/common/enitty/base.entity";

@Entity()
export class ChiTietCauHoiBaiKiemTra extends BaseEntity{

    @ManyToOne(() => CauHoi, (cauHoi) => cauHoi.chiTietCauHoiBaiKiemTra, {lazy: true, onDelete: 'CASCADE'})
    @JoinColumn({name: 'idCauHoi'})
    cauHoi: Promise<CauHoi>
    @Column() idCauHoi: number

    @ManyToOne(()=> BaiKiemTra, (baiKiemTra) => baiKiemTra.chiTietCauHoiBaiKiemTra, {lazy:true, onDelete: 'CASCADE'})
    @JoinColumn({name: 'idBaiKiemTra'})
    baiKiemTra: Promise<BaiKiemTra>
    @Column() idBaiKiemTra: number

    @OneToMany(()=>ChiTietBaiLam, (chiTietBaiLam) => chiTietBaiLam.cauHoiBaiKiemTra, {cascade:true, lazy: true,  onDelete: 'CASCADE'})
    chiTietBaiLam: Promise<ChiTietBaiLam[]>
}