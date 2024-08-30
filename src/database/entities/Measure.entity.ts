import { MeasureTypes } from "../../utils/types/measure";
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("measures")
export default class Measure {
  @PrimaryGeneratedColumn("uuid")
  measure_uuid?: string;

  @Column({ type: "varchar", nullable: false })
  customer_code: string;

  @Column({ type: "timestamp", nullable: false })
  measure_datetime: Date;

  @Column({ type: "varchar", nullable: false })
  measure_type: MeasureTypes;

  @Column({ type: "varchar", nullable: false })
  image_base64: string;

  @Column({ type: "integer", nullable: false })
  measure_value: number;

  @Column({ type: "varchar", nullable: false })
  measure_unit: string;

  @Column({ type: "boolean", nullable: false, default: false })
  has_confirmed?: boolean;
}
