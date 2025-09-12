import { BaseEntity } from "src/common/enitty/base.entity";
import { ThongBaoNguoiDung } from "src/thong-bao/entities/thong-bao_nguoi-dung.entity";
import { Column, Entity, OneToMany } from "typeorm";

@Entity()
export class ThongBao extends BaseEntity{
    @Column()
    noiDung: string

    @OneToMany(() => ThongBaoNguoiDung, (thongBaoNguoiDung) => thongBaoNguoiDung.idThongBao, {lazy: true, cascade: true})
    thongBaoNguoiDung: Promise<ThongBaoNguoiDung[]>

}
