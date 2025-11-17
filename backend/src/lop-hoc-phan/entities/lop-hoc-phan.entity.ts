import { BaiKiemTra } from "src/bai-kiem-tra/entities/bai-kiem-tra.entity";
import { BaseEntity } from "src/common/enitty/base.entity";
import { GiangVien } from "src/giang-vien/entities/giang-vien.entity";
import { MonHoc } from "src/mon-hoc/entities/mon-hoc.entity";
import { SinhVien } from "src/sinh-vien/entities/sinh-vien.entity";
import { Column, Entity, Index, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany } from "typeorm";

@Entity()
export class LopHocPhan extends BaseEntity{
    @Column({nullable: true})
    @Index()
    maLopHoc: string

    @Column()
    tenLopHoc: string

    @Column({nullable: true})
    hocKy: string

    @Column()
    thoiGianBatDau: Date

    @Column()
    thoiGianKetThuc: Date

    @ManyToOne(() => MonHoc, (monHoc) => monHoc.lopHocPhan, {lazy: true,  onDelete: 'CASCADE'})
    @JoinColumn({name: 'idMonHoc'})
    monHoc: Promise<MonHoc>
    @Column() idMonHoc: number

    @ManyToOne(() => GiangVien, (giangVien) => giangVien.lopHocPhan, {lazy: true,  onDelete: 'CASCADE'})
    @JoinColumn({name: 'idGiangVien'})
    giangVien: Promise<GiangVien>
    @Column() idGiangVien: number

    @ManyToMany(() => SinhVien, (sinhVien) => sinhVien.lopHocPhan, {cascade:true, lazy: true, onDelete: 'CASCADE'})
    @JoinTable({name: 'chiTietLopHoc'})
    sinhVien: Promise<SinhVien[]>

    @OneToMany(() => BaiKiemTra, (baiKiemTra) => baiKiemTra.lopHocPhan, {cascade: true, lazy:true, onDelete: 'CASCADE'})
    baiKiemTra: Promise<BaiKiemTra[]>
}
