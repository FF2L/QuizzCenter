import { CauHoi } from "src/cau-hoi/entities/cau-hoi.entity";
import { BaseEntity } from "src/common/enitty/base.entity";
import { GiangVien } from "src/giang-vien/entities/giang-vien.entity";
import { MonHoc } from "src/mon-hoc/entities/mon-hoc.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, RelationId, Unique } from "typeorm";

@Entity()
// @Unique(['monHoc', 'thuTu'])  // unique theo cặp monHoc + thuTu
export class Chuong extends BaseEntity{
    
    @Column()
    tenChuong: string

    @Column()
    thuTu: number

    @Column({
    default: 0
    })
    soLuongCauHoi: number

    @ManyToOne(() => GiangVien, (gv) => gv.chuong, { lazy: true, nullable: false })
    @JoinColumn({ name: 'idGiangVien' })          
    giangVien: Promise<GiangVien>; 
    @Column() idGiangVien: number; 

    @ManyToOne(() => MonHoc, (monHoc) => monHoc.chuong, {lazy:true})
    @JoinColumn({name: 'idMonHoc'})
    monHoc: Promise<MonHoc>
    @Column() idMonHoc: number;

    @OneToMany(() => CauHoi, (cauHoi) => cauHoi.idChuong, {cascade: true, lazy:true, nullable:true})
    cauHoi: Promise<CauHoi[]>


}
