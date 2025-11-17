import { BaiKiemTra } from "src/bai-kiem-tra/entities/bai-kiem-tra.entity";
import { BaseEntity } from "src/common/enitty/base.entity";
import { SinhVien } from "src/sinh-vien/entities/sinh-vien.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, Unique } from "typeorm";
import { ChiTietBaiLam } from "./chi-tiet-bai-lam.entity";

@Entity()
export class BaiLamSinhVien extends BaseEntity{
    
    // @Column({
    //     type: 'enum',
    //     enum: TrangThaiBaiLam,
    //     default: TrangThaiBaiLam.ChuaLam
    // })
    // trangThaiBaiLam: TrangThaiBaiLam

    @Column({
        nullable: true,
        type: 'float',
    })
    tongDiem: number

    @Column({
        type: 'timestamp',
        nullable: true
    })
    thoiGianBatDau: Date

    @Column({
        type: 'timestamp',
        nullable: true
    })
    thoiGianketThuc: Date

    // @Column()
    // lanLamThu: number

    @ManyToOne(() => SinhVien, (sv) => sv.baiLamSInhVien, {lazy: true,  onDelete: 'CASCADE'})
    @JoinColumn({name: 'idSinhVien'})
    sinhVien: Promise<SinhVien>
    @Column() idSinhVien: number

    @ManyToOne(() => BaiKiemTra, (baiKiemTra) => baiKiemTra.baiLamSinhVien, {lazy: true, onDelete: 'CASCADE'})
    @JoinColumn({name: 'idBaiKiemTra'})
    baiKiemTra: Promise<BaiKiemTra>
    @Column() idBaiKiemTra: number

    @OneToMany(() => ChiTietBaiLam, (chiTietBaiLam) => chiTietBaiLam.baiLamSinhVien, {cascade: true, lazy: true, onDelete: 'CASCADE'})
    chiTietBaiLam: Promise<ChiTietBaiLam[]>
}
