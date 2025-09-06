import { CauHoi } from "src/cau-hoi/entities/cau-hoi.entity";
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

    @Column({
    default: 0
    })
    soLuongCauHoi: number

    @ManyToOne(() => GiangVien, (gv) => gv.chuong, { lazy: true, nullable: false })
    @JoinColumn({ name: 'idGiangVien' })          
    giangVien: Promise<GiangVien>;   

    @ManyToOne(() => MonHoc, (monHoc) => monHoc.chuong, {lazy:true})
    @JoinColumn({name: 'idMonHoc'})
    idMonHoc: Promise<MonHoc>

    @OneToMany(() => CauHoi, (cauHoi) => cauHoi.idChuong, {cascade: true, lazy:true})
    cauHoi: Promise<CauHoi[]>


}
