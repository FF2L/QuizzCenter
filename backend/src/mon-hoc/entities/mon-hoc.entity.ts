import { Chuong } from "src/chuong/entities/chuong.entity";
import { BaseEntity } from "src/common/enitty/base.entity";
import { GiangVien } from "src/giang-vien/entities/giang-vien.entity";
import { LopHocPhan } from "src/lop-hoc-phan/entities/lop-hoc-phan.entity";
import { Column, Entity, Index, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany } from "typeorm";

@Entity()
export class MonHoc extends BaseEntity{
    @Column()
    @Index()
    maMonHoc: string

    @Column()
    tenMonHoc: string

    @OneToMany(() => Chuong, (chuong) => chuong.monHoc, {lazy: true})
    chuong: Promise<Chuong[]>

    @OneToMany(() => LopHocPhan, (lopHocPhan) => lopHocPhan.monHoc, {cascade: true, lazy:true})
    lopHocPhan: Promise<LopHocPhan[]>
 
    @ManyToMany(() => GiangVien, (giangVien) => giangVien.monHoc, {cascade: true, lazy:true})
    @JoinTable({name: 'MonHoc_GiangVien'})
    giangVien: Promise<GiangVien[]>
}
