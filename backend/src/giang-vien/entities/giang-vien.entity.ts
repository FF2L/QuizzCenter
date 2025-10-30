import { Chuong } from "src/chuong/entities/chuong.entity";
import { LopHocPhan } from "src/lop-hoc-phan/entities/lop-hoc-phan.entity";
import { MonHoc } from "src/mon-hoc/entities/mon-hoc.entity";
import { NguoiDung } from "src/nguoi-dung/entities/nguoi-dung.entity";
import { Column, Entity, JoinColumn, ManyToMany, OneToMany, OneToOne, PrimaryColumn } from "typeorm";

@Entity()
export class GiangVien {

    @PrimaryColumn({ name: 'idNguoiDung', type: 'int' })
    idNguoiDung: number;

    @OneToOne(() => NguoiDung, (nd) => nd.giangVien, { lazy: true })
    @JoinColumn({ name: 'idNguoiDung', referencedColumnName: 'id' })
    nguoiDung: Promise<NguoiDung>;

    @OneToMany(() => Chuong, (chuong) => chuong.giangVien, { cascade: true, lazy:true })
    chuong: Promise<Chuong[]>;

    @OneToMany(() => LopHocPhan, (lopHocPhan) => lopHocPhan.giangVien, {cascade: true, lazy: true})
    lopHocPhan: Promise<LopHocPhan []>

    @ManyToMany(() => MonHoc, (monHoc) => monHoc.giangVien, {lazy: true})
    monHoc: Promise<MonHoc[]>
}
