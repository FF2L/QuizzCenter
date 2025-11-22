import { BaseEntity } from "src/common/enitty/base.entity";
import { Column, Entity } from "typeorm";

@Entity()
export class HocKy extends BaseEntity{
    @Column()
    tenHocKy: string

    @Column()
    thoiGianBatDau: Date

    @Column()
    thoiGianKetThuc: Date

    @Column()
    phatHanh: boolean

}
