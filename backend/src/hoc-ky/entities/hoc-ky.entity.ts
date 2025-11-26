import { BaseEntity } from "src/common/enitty/base.entity";
import { LopHocPhan } from "src/lop-hoc-phan/entities/lop-hoc-phan.entity";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";

@Entity()
export class HocKy extends BaseEntity{

    @OneToMany( () =>  LopHocPhan, (lopHocPhan) => lopHocPhan.hocKy, {lazy: true, onDelete: 'CASCADE'})
    lopHocPhan: Promise<any[]>

    @Column()
    tenHocKy: string

    @Column()
    thoiGianBatDau: Date

    @Column()
    thoiGianKetThuc: Date

    @Column()
    phatHanh: boolean

}
