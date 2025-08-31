import { CauHoi } from "src/cau-hoi/entities/cau-hoi.entity";
import { Chuong } from "src/chuong/entities/chuong.entity";
import { BaseEntity } from "src/common/enitty/base.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";

@Entity()
export class ChuDe extends BaseEntity{
    @Column()
    tenChuDe: string

    @Column()
    thuTu: number

    @Column({
        default: 0
    })
    soLuongCauHoi: number

    @ManyToOne(() => Chuong, (chuong) => chuong.chuDe, {lazy: true})
    @JoinColumn({name: 'idChuong'})
    idChuong: Promise<Chuong>

    @OneToMany(() => CauHoi, (cauHoi) => cauHoi.idChuDe, {cascade: true, lazy:true})
    cauHoi: Promise<CauHoi[]>
}
