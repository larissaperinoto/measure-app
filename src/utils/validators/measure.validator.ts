import {
  IsBase64,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
} from "class-validator";
import { MeasureTypes } from "../../types/measure";

export class CreateMeasureValidatorSchema {
  @IsBase64({ urlSafe: true }, { message: "image deve ser um base64 válido." })
  @IsNotEmpty({ message: "image não deve ser null." })
  image: string;

  @IsString({ message: "customer_code deve ser uma string." })
  @IsNotEmpty({ message: "customer_code não deve ser null." })
  customer_code: string;

  @IsDateString(
    {},
    { message: "measure_datetime deve ser um datetime válido." }
  )
  @IsNotEmpty({ message: "measure_datetime não deve ser null." })
  measure_datetime: Date;

  @IsEnum(MeasureTypes, {
    message: "measure_type deve ter um dos valores: WATER ou GAS.",
  })
  @IsNotEmpty({ message: "measure_type não deve ser null." })
  measure_type: MeasureTypes;
}

export class ConfirmMeasureValidatorSchema {
  @IsUUID(null, { message: "measure_uuid deve ser um UUID válido." })
  @IsNotEmpty({ message: "measure_uuid não deve ser null." })
  measure_uuid: string;

  @IsNumber({}, { message: "confirmed_value deve ser um número." })
  @IsNotEmpty({ message: "confirmed_value não deve ser null." })
  confirmed_value: number;
}
