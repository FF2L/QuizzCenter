import { ChiTietCauHoiBaiKiemTra } from "src/bai-kiem-tra/entities/chi-tiet-cau-hoi-bai-kiem-tra";

import { Chuong } from "src/chuong/entities/chuong.entity";
import { BaseEntity } from "src/common/enitty/base.entity";
import { DoKho } from "src/common/enum/dokho.enum";
import { LoaiCauHoi } from "src/common/enum/loaicauhoi.enum";
import { DapAn } from "src/dap-an/entities/dap-an.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";

@Entity()
export class CauHoi extends BaseEntity{

    @Column()
    tenHienThi: string

    @Column()
    noiDungCauHoi: string

    @Column({nullable: true})
    noiDungCauHoiHTML: string

    @Column({
        type: 'enum',
        enum: LoaiCauHoi,
        default: LoaiCauHoi.MotDung
    })
    loaiCauHoi: LoaiCauHoi

    @Column({
        type: 'enum',
        enum: DoKho,
        default: DoKho.De
    })
    doKho: DoKho

    @ManyToOne(() => Chuong, (chuong) => chuong.cauHoi, {lazy: true})
    @JoinColumn({name: 'idChuong'})
    chuong: Promise<Chuong>
    @Column({nullable: true}) idChuong: number

    @OneToMany(() => DapAn, (da) => da.cauHoi, { cascade: true, lazy: true })
    dapAn: Promise<DapAn[]>; 

    // @OneToMany(() => FileDinhKem, (fileDinhKem) => fileDinhKem.idCauHoi, {cascade: true, lazy:true})
    // fileDinhKem: Promise<FileDinhKem[]>

    @OneToMany(() => ChiTietCauHoiBaiKiemTra, (chiTietCauHoiBaiKiemTra) => chiTietCauHoiBaiKiemTra.idCauHoi, {cascade: true, lazy:true})
    chiTietCauHoiBaiKiemTra: Promise<ChiTietCauHoiBaiKiemTra[]>

}
