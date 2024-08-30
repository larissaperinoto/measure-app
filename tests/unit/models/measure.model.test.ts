import MeasureModel from "../../../src/models/measure.model";
import DataSourceConnection from "../../../src/database/data-source";
import Measure from "../../../src/database/entities/Measure.entity";

jest.mock("../../../src/database/data-source");

const mockRepository = {
  insert: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  getOne: jest.fn(),
};

describe("MeasureModel", () => {
  let measureModel: MeasureModel;

  beforeEach(() => {
    (DataSourceConnection.getInstance as jest.Mock).mockReturnValue({
      getRepository: jest.fn().mockReturnValue(mockRepository),
    });

    measureModel = new MeasureModel();
  });

  describe("insert", () => {
    it("should return measure_uuid", async () => {
      const measure = { measure_uuid: "uuid123" } as Measure;
      mockRepository.insert.mockResolvedValue({
        generatedMaps: [{ measure_uuid: "uuid123" }],
      });

      const result = await measureModel.insert(measure);

      expect(result).toBe("uuid123");
      expect(mockRepository.insert).toHaveBeenCalledWith(measure);
    });
  });

  describe("findOne", () => {
    it("should return a measure when found", async () => {
      const where = { measure_uuid: "uuid123" };
      const measure = { measure_uuid: "uuid123" } as Measure;
      mockRepository.findOne.mockResolvedValue(measure);

      const result = await measureModel.findOne(where);

      expect(result).toBe(measure);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where });
    });
  });

  describe("find", () => {
    it("should return an array of measures", async () => {
      const where = { customer_code: "customer1" };
      const measures = [{ measure_uuid: "uuid123" }] as Measure[];
      mockRepository.find.mockResolvedValue(measures);

      const result = await measureModel.find(where);

      expect(result).toEqual(measures);
      expect(mockRepository.find).toHaveBeenCalledWith({ where });
    });
  });

  describe("update", () => {
    it("should update and return the result", async () => {
      const where = { measure_uuid: "uuid123" };
      const partialEntity = { measure_value: 100 };
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await measureModel.update(where, partialEntity);

      expect(result).toEqual({ affected: 1 });
      expect(mockRepository.update).toHaveBeenCalledWith(where, partialEntity);
    });
  });

  describe("findMeasureInMonth", () => {
    it("should return a measure if found", async () => {
      const startOfMonth = new Date();
      const endOfMonth = new Date();
      const measure_type = "type1";
      const customer_code = "customer1";
      const measure = { measure_uuid: "uuid123" } as Measure;
      mockRepository.getOne.mockResolvedValue(measure);

      const result = await measureModel.findMeasureInMonth(
        startOfMonth,
        endOfMonth,
        measure_type,
        customer_code
      );

      expect(result).toBe(measure);
      expect(mockRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockRepository.where).toHaveBeenCalledWith(
        "measure.measure_datetime BETWEEN :start AND :end",
        {
          start: startOfMonth,
          end: endOfMonth,
        }
      );
      expect(mockRepository.andWhere).toHaveBeenCalledWith(
        "measure.measure_type = :measure_type",
        {
          measure_type,
        }
      );
      expect(mockRepository.andWhere).toHaveBeenCalledWith(
        "measure.customer_code = :customer_code",
        { customer_code }
      );
    });
  });
});
