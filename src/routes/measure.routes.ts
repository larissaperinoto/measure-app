import { Router } from "express";
import MeasureController from "../controllers/measure.controller";
import { createMeasureValidator } from "../middlewares/measure.create.middleware";
import { confirmMeasureValidator } from "../middlewares/measure.confirm.middleware";
import { getMeasureValidator } from "../middlewares/measure.get.middleware";

const router = Router();

const controller = new MeasureController();

router.get(
  "/:customer_code/list",
  getMeasureValidator,
  controller.getMeasure.bind(controller)
);

router.get("/public/:measure_uuid", controller.getImage.bind(controller));

router.post(
  "/upload",
  createMeasureValidator,
  controller.createMeasure.bind(controller)
);

router.patch(
  "/confirm",
  confirmMeasureValidator,
  controller.updateMeasure.bind(controller)
);

export default router;
