import { ChiTietCauHoiBaiKiemTra } from "src/bai-kiem-tra/entities/chi-tiet-cau-hoi-bai-kiem-tra";
import { ChuDe } from "src/chu-de/entities/chu-de.entity";
import { BaseEntity } from "src/common/enitty/base.entity";
import { DoKho } from "src/common/enum/dokho.enum";
import { LoaiCauHoi } from "src/common/enum/loaicauhoi.enum";
import { DapAn } from "src/dap-an/entities/dap-an.entity";
import { FileDinhKem } from "src/file-dinh-kem/entities/file-dinh-kem.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";

@Entity()
export class CauHoi extends BaseEntity{

    @Column()
    tenHienThi: string

    @Column()
    noiDungCauHoi: string

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

    @Column({
        default: 1
    })
    tileDiem: number

    @ManyToOne(() => ChuDe, (chuDe) => chuDe.cauHoi, {lazy: true})
    @JoinColumn({name: 'idChuDe'})
    idChuDe: Promise<ChuDe>

    @OneToMany(() => DapAn, (dapAn) => dapAn.idCauHoi, {cascade:true, lazy: true})
    dapAn: Promise<DapAn[]>

    @OneToMany(() => FileDinhKem, (fileDinhKem) => fileDinhKem.idCauHoi, {cascade: true, lazy:true})
    fileDinhKem: Promise<FileDinhKem[]>

    @OneToMany(() => ChiTietCauHoiBaiKiemTra, (chiTietCauHoiBaiKiemTra) => chiTietCauHoiBaiKiemTra.idCauHoi, {cascade: true, lazy:true})
    chiTietCauHoiBaiKiemTra: Promise<ChiTietCauHoiBaiKiemTra[]>

}
