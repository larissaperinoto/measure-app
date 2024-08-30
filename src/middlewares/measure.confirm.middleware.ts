import { NextFunction, Request, Response } from "express";
import { validateOrReject } from "class-validator";
import { ConfirmMeasureValidatorSchema } from "../utils/validators/measure.validator";
import { httpStatus } from "../utils/httpStatus";

export async function confirmMeasureValidator(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const measure = new ConfirmMeasureValidatorSchema();
    measure.measure_uuid = req.body.measure_uuid;
    measure.confirmed_value = req.body.confirmed_value;

    await validateOrReject(measure);

    next();
  } catch (e: any) {
    const description = Object.values(e[0].constraints)[0];
    res.status(httpStatus.BadRequest).send({
      error_code: "INVALID_DATA",
      error_description: description,
    });
  }
}
