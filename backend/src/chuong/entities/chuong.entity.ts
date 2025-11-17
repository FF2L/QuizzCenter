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

    @Column({
    default: 0
    })
    soLuongCauHoi: number

    @ManyToOne(() => GiangVien, (gv) => gv.chuong, { lazy: true, nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'idGiangVien' })          
    giangVien: Promise<GiangVien>; 
    @Column() idGiangVien: number; 

    @ManyToOne(() => MonHoc, (monHoc) => monHoc.chuong, {lazy:true, onDelete: 'CASCADE'})
    @JoinColumn({name: 'idMonHoc'})
    monHoc: Promise<MonHoc>
    @Column() idMonHoc: number;

    @OneToMany(() => CauHoi, (cauHoi) => cauHoi.chuong, {cascade: true, lazy:true, onDelete: 'CASCADE', nullable:true})
    cauHoi: Promise<CauHoi[]>


}
