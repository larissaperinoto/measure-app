import { NextFunction, Request, Response } from "express";
import { httpStatus } from "../utils/httpStatus";
import { MeasureTypes } from "../utils/types/measure";

export async function getMeasureValidator(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const query = req.query["measure_type"] as string;

  const validType = MeasureTypes[query];

  if (query && !validType) {
    res.status(httpStatus.BadRequest).send({
      error_code: "INVALID_TYPE",
      error_description: "Tipo de medição não permitida",
    });
  }

  next();
}
