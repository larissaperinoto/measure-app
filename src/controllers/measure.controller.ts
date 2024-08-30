import { Request, Response } from "express";
import MeasureService from "../services/mesure.service";

export default class MeasureController {
  private service = new MeasureService();

  public async createMeasure(req: Request, res: Response) {
    const { status, message } = await this.service.createMeasure(req.body);
    res.status(status).json(message);
  }

  public async updateMeasure(req: Request, res: Response) {
    const { status, message } = await this.service.updateMeasure(req.body);
    res.status(status).json(message);
  }

  public async getMeasure(req: Request, res: Response) {
    const customer_code = req.params["customer_code"];
    const measure_type = req.query["measure_type"] as string;

    const { status, message } = await this.service.getMeasure(
      customer_code,
      measure_type
    );
    res.status(status).json(message);
  }
}
