import { BaseEntity } from "src/common/enitty/base.entity";
import { Role } from "src/common/enum/role.enum";
import { GiangVien } from "src/giang-vien/entities/giang-vien.entity";
import { SinhVien } from "src/sinh-vien/entities/sinh-vien.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";
import * as bcrypt from "bcrypt"

@Entity()
export class NguoiDung  extends BaseEntity{
    
    @Column({unique: true})
    @Index()
    maNguoiDung: string;

    @Column()
    hoTen: string

    @Column({unique: true})
    @Index()
    email: string

    @Column()
    @Index()
    soDienThoai: string

    @Column({default: '12312345'})
    matKhau: string

    @Column({nullable: true})
    hashRefeshToken: string

    @Column({default: 'https://inkythuatso.com/uploads/thumbnails/800/2023/03/8-anh-dai-dien-trang-inkythuatso-03-15-26-54.jpg'})
    anhDaiDien: string

    @Column()
    ngaySinh: Date

    @Column({nullable: true})
    gioiTinh: string

    @Column({type: 'enum',
        enum: Role,
        default : Role.SinhVien
    })
    vaiTro: Role

    @OneToOne(() => GiangVien, (giangVien) => giangVien.nguoiDung, {cascade: true, lazy:true})
    giangVien: Promise<GiangVien>

    @OneToOne(() => SinhVien, (sinhVien) => sinhVien.nguoiDung, {cascade: true, lazy: true})
    sinhVien: Promise<SinhVien>


    // @BeforeInsert()
    // @BeforeUpdate()
    // async hashMatKhau(){
    //     this.matKhau = await bcrypt.hash(this.matKhau, 10)
    // }
    
    
}
