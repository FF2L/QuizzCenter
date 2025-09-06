import { ChiTietBaiLam } from "src/bai-lam-sinh-vien/entities/chi-tiet-bai-lam.entity";
import { CauHoi } from "src/cau-hoi/entities/cau-hoi.entity";
import { BaseEntity } from "src/common/enitty/base.entity";
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany } from "typeorm";

@Entity()
export class DapAn  extends BaseEntity{
    @Column()
    noiDung: string

    @Column()
    dapAnDung: boolean

    @ManyToOne(() => CauHoi, (cauHoi) => cauHoi.dapAn ,{ lazy: true})
    @JoinColumn({name: 'idCauHoi'})
    idCauHoi: Promise<CauHoi>

    @OneToMany(() => ChiTietBaiLam, (chiTietBaiLam) => chiTietBaiLam.dapAn,{lazy:true, cascade:true})
    chiTietBaiLam: Promise<ChiTietBaiLam[]>

}
