import { BaseEntity } from "src/common/enitty/base.entity";
import { MonHoc } from "src/mon-hoc/entities/mon-hoc.entity";
import { NguoiDung } from "src/nguoi-dung/entities/nguoi-dung.entity";
import { Column, Entity, Index, OneToMany } from "typeorm";

@Entity()
export class Khoa extends BaseEntity{
    @Column({unique : true})
    @Index()
    maKhoa: string
    
    @Column()
    tenKhoa: string

    @OneToMany(() => MonHoc, (monHoc) => monHoc.idKhoa, {cascade: true, lazy:true})
    MonHoc: Promise<MonHoc[]>

    @OneToMany(() => NguoiDung, (nguoiDung) => nguoiDung.idKhoa, {cascade: true, lazy :true})
    nguoiDung: Promise<NguoiDung[]>
}
