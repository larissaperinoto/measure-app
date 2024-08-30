import { NextFunction, Request, Response } from "express";
import { validateOrReject } from "class-validator";
import { CreateMeasureValidatorSchema } from "../utils/validators/measure.validator";
import { httpStatus } from "../utils/httpStatus";

export async function createMeasureValidator(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const measure = new CreateMeasureValidatorSchema();
    measure.image = req.body.image;
    measure.customer_code = req.body.customer_code;
    measure.measure_datetime = req.body.measure_datetime;
    measure.measure_type = req.body.measure_type;

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
