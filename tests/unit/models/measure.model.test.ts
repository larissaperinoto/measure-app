import { MeasureModel } from "../../../src/models/measure.model";
import Measure from "../../../src/database/entities/Measure.entity";
import { mockMeasureRepository } from "../mocks/measure.repository.mock";
import { Repository } from "typeorm";

describe("MeasureModel", () => {
  let measureModel: MeasureModel;

  beforeEach(() => {
    measureModel = new MeasureModel(
      mockMeasureRepository as unknown as Repository<Measure>
    );
  });

  describe("insert", () => {
    it("should return measure_uuid", async () => {
      const measure = { measure_uuid: "uuid123" } as Measure;
      mockMeasureRepository.insert.mockResolvedValue({
        generatedMaps: [{ measure_uuid: "uuid123" }],
      });

      const result = await measureModel.insert(measure);

      expect(result).toBe("uuid123");
      expect(mockMeasureRepository.insert).toHaveBeenCalledWith(measure);
    });
  });

  describe("findOne", () => {
    it("should return a measure when found", async () => {
      const where = { measure_uuid: "uuid123" };
      const measure = { measure_uuid: "uuid123" } as Measure;
      mockMeasureRepository.findOne.mockResolvedValue(measure);

      const result = await measureModel.findOne(where);

      expect(result).toBe(measure);
      expect(mockMeasureRepository.findOne).toHaveBeenCalledWith({ where });
    });
  });

  describe("find", () => {
    it("should return an array of measures", async () => {
      const where = { customer_code: "customer1" };
      const measures = [{ measure_uuid: "uuid123" }] as Measure[];
      mockMeasureRepository.find.mockResolvedValue(measures);

      const result = await measureModel.find(where);

      expect(result).toEqual(measures);
      expect(mockMeasureRepository.find).toHaveBeenCalledWith({ where });
    });
  });

  describe("update", () => {
    it("should update and return the result", async () => {
      const where = { measure_uuid: "uuid123" };
      const partialEntity = { measure_value: 100 };
      mockMeasureRepository.update.mockResolvedValue({ affected: 1 });

      const result = await measureModel.update(where, partialEntity);

      expect(result).toEqual({ affected: 1 });
      expect(mockMeasureRepository.update).toHaveBeenCalledWith(
        where,
        partialEntity
      );
    });
  });

  describe("findMeasureInMonth", () => {
    it("should return a measure if found", async () => {
      const startOfMonth = new Date();
      const endOfMonth = new Date();
      const measure_type = "type1";
      const customer_code = "customer1";
      const measure = { measure_uuid: "uuid123" } as Measure;
      mockMeasureRepository.getOne.mockResolvedValue(measure);

      const result = await measureModel.findMeasureInMonth(
        startOfMonth,
        endOfMonth,
        measure_type,
        customer_code
      );

      expect(result).toBe(measure);
      expect(mockMeasureRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockMeasureRepository.where).toHaveBeenCalledWith(
        "measure.measure_datetime BETWEEN :start AND :end",
        {
          start: startOfMonth,
          end: endOfMonth,
        }
      );
      expect(mockMeasureRepository.andWhere).toHaveBeenCalledWith(
        "measure.measure_type = :measure_type",
        {
          measure_type,
        }
      );
      expect(mockMeasureRepository.andWhere).toHaveBeenCalledWith(
        "measure.customer_code = :customer_code",
        { customer_code }
      );
    });
  });
});
