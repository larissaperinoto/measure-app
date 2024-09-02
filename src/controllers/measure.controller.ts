import { Request, Response } from "express";
import { IMeasureService } from "../services/mesure.service";

export default class MeasureController {
  private service: IMeasureService;

  constructor(service: IMeasureService) {
    this.service = service;
  }

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

  public async getImage(req: Request, res: Response) {
    const [measure_uuid, type] = req.params["measure_uuid"].split(".");

    const { status, message } = await this.service.getImage(measure_uuid);

    if (!message["image"]) {
      res.status(status).json(message);
    }

    res.contentType(`image/${type}`);

    res.status(status).send(message["image"]);
  }
}
