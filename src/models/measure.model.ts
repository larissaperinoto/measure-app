import DataSourceConnection from "../database/data-source";
import Measure from "../database/entities/Measure.entity";

export default class MeasureModel {
  private repository =
    DataSourceConnection.getInstance().getRepository<Measure>("Measure");

  public async insert(measure: Measure): Promise<string> {
    const result = await this.repository.insert(measure);
    return result["generatedMaps"][0]["measure_uuid"];
  }

  public async findOne(
    where: Record<string, string>,
    select?: Record<string, boolean>
  ): Promise<Measure | undefined> {
    return await this.repository.findOne({ where, select });
  }

  public async find(
    where: Record<string, string>,
    select?: Record<string, boolean>
  ): Promise<Measure[]> {
    return await this.repository.find({ where, select });
  }

  public async update(
    where: Record<string, string>,
    partialEntity: Partial<Measure>
  ) {
    return await this.repository.update(where, partialEntity);
  }

  public async findMeasureInMonth(
    startOfMonth: Date,
    endOfMonth: Date,
    measure_type: string,
    customer_code: string
  ): Promise<Measure | undefined> {
    return await this.repository
      .createQueryBuilder("measure")
      .where("measure.measure_datetime BETWEEN :start AND :end", {
        start: startOfMonth,
        end: endOfMonth,
      })
      .andWhere("measure.measure_type = :measure_type", {
        measure_type,
      })
      .andWhere("measure.customer_code = :customer_code", { customer_code })
      .getOne();
  }
}
