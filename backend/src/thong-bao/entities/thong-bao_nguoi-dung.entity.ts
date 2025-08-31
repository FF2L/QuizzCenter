import { BaseEntity } from "src/common/enitty/base.entity";
import { NguoiDung } from "src/nguoi-dung/entities/nguoi-dung.entity";
import { ThongBao } from "src/thong-bao/entities/thong-bao.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

@Entity()
export class ThongBaoNguoiDung extends BaseEntity{
    @Column()
    daDoc: boolean

    @ManyToOne(() => NguoiDung, (idNguoiDung) => idNguoiDung.thongBaoNguoiDung,{lazy: true})
    @JoinColumn({name: 'idNguoiDung'})
    idNguoiDung:  Promise<NguoiDung>;

    @ManyToOne(() => ThongBao, (thongBao) => thongBao.thongBaoNguoiDung, {lazy: true} )
    @JoinColumn({name: 'idThongBao'})
    idThongBao: Promise<ThongBao>
}
