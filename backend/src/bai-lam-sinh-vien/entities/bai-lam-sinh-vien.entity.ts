import { BaiKiemTra } from "src/bai-kiem-tra/entities/bai-kiem-tra.entity";
import { BaseEntity } from "src/common/enitty/base.entity";
import { TrangThaiBaiLam } from "src/common/enum/trangThaiBaiLam.enum";
import { SinhVien } from "src/sinh-vien/entities/sinh-vien.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { ChiTietBaiLam } from "./chi-tiet-bai-lam.entity";

@Entity()
export class BaiLamSinhVien extends BaseEntity{
    
    @Column({
        type: 'enum',
        enum: TrangThaiBaiLam,
        default: TrangThaiBaiLam.ChuaLam
    })
    trangThaiBaiLam: TrangThaiBaiLam

    @Column({
        nullable: true,
    })
    tongDiem: number

    @Column({
        type: 'timestamp'
    })
    thoiGianBatDau: Date

    @Column({
    type: 'timestamp'
    })
    thoiGianketThuc: Date

    @Column()
    lanLamThu:number

    @ManyToOne(()=>SinhVien, (sv) => sv.baiLamSInhVien, {lazy:true})
    @JoinColumn({name: 'idSinhVien'})
    sinhVien: Promise<SinhVien>

    @ManyToOne(() => BaiKiemTra, (baiKiemTra) => baiKiemTra.baiLamSinhVien, {lazy:true})
    @JoinColumn({name: 'idBaiKiemTra'})
    baiKiemTra: Promise<BaiKiemTra>

    @OneToMany(() => ChiTietBaiLam, (chiTietBaiLam) => chiTietBaiLam.baiLamSinhVien, {cascade:true, lazy:true})
    chiTietBaiLam: Promise<ChiTietBaiLam[]>
}
