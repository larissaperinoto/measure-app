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

  public async getImage(req: Request, res: Response) {
    const [measure_uuid, type] = req.params["measure_uuid"].split(".");

    const { status, message, image } = await this.service.getImage(
      measure_uuid
    );

    if (message) {
      res.status(status).json(message);
    }

    res.contentType(`image/${type}`);

    res.status(status).send(image);
  }
}
