import { CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"


export abstract class BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @CreateDateColumn()
    create_at: Date

    @UpdateDateColumn()
    update_at: Date
    
    @DeleteDateColumn()
    delete_at: Date
}