import { Chuong } from "src/chuong/entities/chuong.entity";
import { BaseEntity } from "src/common/enitty/base.entity";
import { GiangVien } from "src/giang-vien/entities/giang-vien.entity";
import { Khoa } from "src/khoa/entities/khoa.entity";
import { LopHocPhan } from "src/lop-hoc-phan/entities/lop-hoc-phan.entity";
import { Column, Entity, Index, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany } from "typeorm";

@Entity()
export class MonHoc extends BaseEntity{
    @Column({unique: true})
    @Index()
    maMonHoc: string

    @Column()
    tenMonHoc: string

    @ManyToOne(() => Khoa, (khoa) => khoa.MonHoc, {lazy: true})
    @JoinColumn({name: 'idKhoa'})
    khoa: Promise<Khoa>
    @Column() idKhoa: number;

    @OneToMany(() => Chuong, (chuong) => chuong.monHoc, {lazy: true})
    chuong: Promise<Chuong[]>

    @OneToMany(() => LopHocPhan, (lopHocPhan) => lopHocPhan.idMonHoc, {cascade: true, lazy:true})
    lopHocPhan: Promise<LopHocPhan[]>

    // @ManyToMany(() => GiangVien, (giangVien) => giangVien.monHoc, {cascade: true, lazy:true})
    // @JoinTable({name: 'MonHoc_GiangVien'})
    // giangVien: Promise<GiangVien[]>
}
