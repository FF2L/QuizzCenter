import { BaseEntity } from "src/common/enitty/base.entity";
import { Role } from "src/common/enum/role.enum";
import { GiangVien } from "src/giang-vien/entities/giang-vien.entity";
import { Khoa } from "src/khoa/entities/khoa.entity";
import { SinhVien } from "src/sinh-vien/entities/sinh-vien.entity";
import { ThongBaoNguoiDung } from "src/thong-bao/entities/thong-bao_nguoi-dung.entity";
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

    @Column()
    gioiTinh: boolean

    //Otp

    // @Column({nullable: true})
    // otp: string

    // @Column({nullable: true})
    // thoiGianTaoOtp: Date
    
    // @Column({nullable: true})
    // thoiGIanHetHanOtp: Date

      //Otp


    @Column()
    anhDaiDien: string

    @Column()
    ngaySinh: Date

    @Column({
        nullable: true
    })
    ngayVao: Date

    @Column({type: 'enum',
        enum: Role,
        default : Role.SinhVien
    })
    vaiTro: Role

    @OneToOne(() => GiangVien, (giangVien) => giangVien.idNguoiDung, {cascade: true, lazy:true})
    giangVien: Promise<GiangVien>

    @OneToOne(() => SinhVien, (sinhVien) => sinhVien.idNguoiDung, {cascade: true, lazy: true})
    sinhVien: Promise<SinhVien>


    @OneToMany(() => ThongBaoNguoiDung, (thongBaoNguoiDung) => thongBaoNguoiDung.idNguoiDung, {cascade: true, lazy: true})
    thongBaoNguoiDung:  Promise<ThongBaoNguoiDung[]>

    @ManyToOne(() => Khoa, (idKhoa) => idKhoa.nguoiDung, {lazy: true})
    @JoinColumn({name: 'idKhoa'})
    idKhoa: Promise<Khoa>

    @BeforeInsert()
    @BeforeUpdate()
    async hashMatKhau(){
        this.matKhau = await bcrypt.hash(this.matKhau, 10)
    }
    
    
}
