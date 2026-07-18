import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";

@Entity()
export class Task {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column("varchar")
    title!: string;

    @Column("varchar") 
    type!: string;

    @Column("integer", { default: 1 })
    status!: number; 

    @Column("boolean", { default: false })
    isClosed!: boolean;

    @Column("jsonb", { default: {} })
    customData!: Record<string, any>;

    @ManyToOne(() => User, (user) => user.tasks, { eager: true })
    assignedUser!: User;
}