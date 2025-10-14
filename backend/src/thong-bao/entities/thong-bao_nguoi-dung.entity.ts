import { BaseEntity } from "src/common/enitty/base.entity";
import { NguoiDung } from "src/nguoi-dung/entities/nguoi-dung.entity";
import { ThongBao } from "src/thong-bao/entities/thong-bao.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ThongBaoNguoiDung{
    @PrimaryGeneratedColumn()
    id:number
    
    @Column()
    daDoc: boolean

    @ManyToOne(() => NguoiDung, (idNguoiDung) => idNguoiDung.thongBaoNguoiDung,{lazy: true})
    @JoinColumn({name: 'idNguoiDung'})
    nguoiDung:  Promise<NguoiDung>;
    @Column() idNguoiDung: number

    @ManyToOne(() => ThongBao, (thongBao) => thongBao.thongBaoNguoiDung, {lazy: true} )
    @JoinColumn({name: 'idThongBao'})
    thongBao: Promise<ThongBao>
    @Column() idThongBao: number

}
