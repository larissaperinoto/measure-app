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
      error_code: "INVALID_DATA",
      error_description: "measure_type deve ter um dos valores: WATER ou GAS.",
    });
  }

  next();
}
