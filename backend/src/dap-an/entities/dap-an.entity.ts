import { ChiTietBaiLam } from "src/bai-lam-sinh-vien/entities/chi-tiet-bai-lam.entity";
import { CauHoi } from "src/cau-hoi/entities/cau-hoi.entity";
import { BaseEntity } from "src/common/enitty/base.entity";
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, RelationId } from "typeorm";

@Entity()
export class DapAn  extends BaseEntity{
    @Column()
    noiDung: string

    @Column({nullable: true})
    noiDungHTML: string

    @Column({default : false})
    dapAnDung: boolean


    @ManyToOne(() => CauHoi, (qh) => qh.dapAn, {
    onDelete: 'CASCADE',
    lazy: true,
    })
    @JoinColumn({ name: 'idCauHoi' })
    cauHoi: Promise<CauHoi>;         
    @Column()
    idCauHoi: number; 

    @OneToMany(() => ChiTietBaiLam, (chiTietBaiLam) => chiTietBaiLam.dapAn,{lazy:true, cascade:true})
    chiTietBaiLam: Promise<ChiTietBaiLam[]>

}
