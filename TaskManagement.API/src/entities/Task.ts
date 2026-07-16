import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";

@Entity()
export class Task {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column("varchar")
    title!: string;

    @Column("varchar") // e.g., 'procurement' or 'development'
    type!: string;

    @Column("integer", { default: 1 })
    status!: number; // Represents ascending statuses (1, 2, 3...)

    @Column("boolean", { default: false })
    isClosed!: boolean;

    // Store all type-specific fields here (e.g. { specification: "..." })
    @Column("simple-json", { nullable: true })
    customData!: Record<string, any>;

    @ManyToOne(() => User, (user) => user.tasks, { eager: true })
    assignedUser!: User;
}