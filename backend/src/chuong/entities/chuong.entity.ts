import { ChuDe } from "src/chu-de/entities/chu-de.entity";
import { BaseEntity } from "src/common/enitty/base.entity";
import { GiangVien } from "src/giang-vien/entities/giang-vien.entity";
import { MonHoc } from "src/mon-hoc/entities/mon-hoc.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, RelationId } from "typeorm";

@Entity()
export class Chuong extends BaseEntity{
    
    @Column()
    tenChuong: string

    @Column()
    thuTu: number

    @ManyToOne(() => GiangVien, (gv) => gv.chuong, { lazy: true, nullable: false })
    @JoinColumn({ name: 'idGiangVien' })          
    giangVien: Promise<GiangVien>;   

    @ManyToOne(() => MonHoc, (monHoc) => monHoc.chuong, {lazy:true})
    @JoinColumn({name: 'idMonHoc'})
    idMonHoc: Promise<MonHoc>

    @OneToMany(() => ChuDe, (chuDe) => chuDe.idChuong, {cascade: true, lazy: true})
    chuDe: Promise<ChuDe[]>


}
