import { CauHoi } from "src/cau-hoi/entities/cau-hoi.entity";
import { BaseEntity } from "src/common/enitty/base.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

@Entity()
export class FileDinhKem extends BaseEntity{
    @Column()
    tenFile: string
    
    @Column()
    duongDan: string

    @Column()
    loaiFile: string

    @Column()
    publicId: string

    @ManyToOne(() => CauHoi, (cauHoi) => cauHoi.fileDinhKem, {lazy: true})
    @JoinColumn({name: 'idCauHoi'})
    cauHoi: Promise<CauHoi>
    @Column() idCauHoi: number
}
