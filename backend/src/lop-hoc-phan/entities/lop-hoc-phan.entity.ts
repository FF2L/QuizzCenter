import { BaiKiemTra } from "src/bai-kiem-tra/entities/bai-kiem-tra.entity";
import { BaseEntity } from "src/common/enitty/base.entity";
import { GiangVien } from "src/giang-vien/entities/giang-vien.entity";
import { MonHoc } from "src/mon-hoc/entities/mon-hoc.entity";
import { SinhVien } from "src/sinh-vien/entities/sinh-vien.entity";
import { Column, Entity, Index, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany } from "typeorm";

@Entity()
export class LopHocPhan extends BaseEntity{
    @Column({unique:true})
    @Index()
    maLopHoc: string

    @Column()
    tenLopHoc: string

    @Column()
    thoiGianBatDau: Date

    @Column()
    thoiGianKetThuc: Date

    @ManyToOne(() => MonHoc, (monHoc) => monHoc.lopHocPhan, {lazy: true})
    @JoinColumn({name: 'idMonHoc'})
    idMonHoc: Promise<MonHoc>

    @ManyToOne(() => GiangVien, (giangVien) => giangVien.lopHocPhan, {lazy: true})
    @JoinColumn({name: 'idGiangVien'})
    idGiangVien: Promise<GiangVien>

    @ManyToMany(() => SinhVien, (sinhVien) => sinhVien.lopHocPhan, {cascade:true, lazy: true})
    @JoinTable({name: 'chiTietLopHoc'})
    sinhVien: Promise<SinhVien[]>

    @OneToMany(() => BaiKiemTra, (baiKiemTra) => baiKiemTra.idLopHocPhan, {cascade: true, lazy:true})
    baiKiemTra: Promise<BaiKiemTra[]>
}
