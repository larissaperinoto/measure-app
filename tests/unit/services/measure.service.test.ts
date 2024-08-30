import MeasureService from "src/services/mesure.service";
import MeasureModel from "src/models/measure.model";
import GeminiService from "../../../src/services/gemini.service";
import { httpStatus } from "src/utils/httpStatus";
import { generateImageUrl } from "src/utils/generateImageUrl";
import { Measure, MeasureConfirm, MeasureTypes } from "src/utils/types/measure";

jest.mock("../../../src/models/measure.model");
jest.mock("../../../src/utils/generateImageUrl");
jest.mock("../../../src/services/gemini.service", () => {
  return {
    default: {
      getInstance: jest.fn().mockReturnValue({
        getMeasureFromImage: jest.fn(),
      }),
    },
  };
});

describe("MeasureService", () => {
  let measureService: MeasureService;
  let findMeasureInMonthMock: jest.Mock;
  let getMeasureFromImageMock: jest.Mock;
  let insertMock: jest.Mock;
  let findOneMock: jest.Mock;
  let updateMock: jest.Mock;
  let findMock: jest.Mock;
  let generateImageUrlMock: jest.Mock;

  beforeEach(() => {
    measureService = new MeasureService();

    getMeasureFromImageMock = GeminiService.getInstance()
      .getMeasureFromImage as jest.Mock;

    findMeasureInMonthMock = MeasureModel.prototype
      .findMeasureInMonth as jest.Mock;
    insertMock = MeasureModel.prototype.insert as jest.Mock;
    findOneMock = MeasureModel.prototype.findOne as jest.Mock;
    updateMock = MeasureModel.prototype.update as jest.Mock;
    findMock = MeasureModel.prototype.find as jest.Mock;
    generateImageUrlMock = generateImageUrl as jest.Mock;
  });

  describe("createMeasure", () => {
    it("should return 409 if measure already exists in the month", async () => {
      findMeasureInMonthMock.mockResolvedValue(true);

      const payload: Measure = {
        image: "base64string",
        customer_code: "customer1",
        measure_datetime: new Date(),
        measure_type: MeasureTypes.GAS,
      };

      const result = await measureService.createMeasure(payload);

      expect(result).toEqual({
        status: httpStatus.Conflict,
        message: {
          error_code: "DOUBLE_REPORT",
          error_description: "Leitura do mês já realizada",
        },
      });
    });

    it("should return 200 if measure is created successfully", async () => {
      findMeasureInMonthMock.mockResolvedValue(null);
      getMeasureFromImageMock.mockResolvedValue({
        value: 100,
        measure_unit: "m3",
      });

      insertMock.mockResolvedValue("uuid123");
      generateImageUrlMock.mockReturnValue("http://example.com/image.jpg");

      const payload: Measure = {
        image: "base64string",
        customer_code: "customer1",
        measure_datetime: new Date(),
        measure_type: MeasureTypes.WATER,
      };

      const result = await measureService.createMeasure(payload);

      expect(result).toEqual({
        status: httpStatus.OK,
        message: {
          image_url: "http://example.com/image.jpg",
          measure_value: 100,
          measure_uuid: "uuid123",
        },
      });
    });

    it("should handle errors and return internal server error", async () => {
      findMeasureInMonthMock.mockRejectedValue(new Error("Database error"));

      const payload: Measure = {
        image: "base64string",
        customer_code: "customer1",
        measure_datetime: new Date(),
        measure_type: MeasureTypes.GAS,
      };

      const result = await measureService.createMeasure(payload);

      expect(result).toEqual({
        status: httpStatus.InternalSeverError,
        message: {
          error_code: "INTERNAL_SERVER_ERROR",
          error_description: expect.stringContaining(
            "Não foi possível completar a operação. ERROR:"
          ),
        },
      });
    });
  });

  describe("updateMeasure", () => {
    it("should return 404 if measure does not exist", async () => {
      findOneMock.mockResolvedValue(null);

      const payload: MeasureConfirm = {
        measure_uuid: "uuid123",
        confirmed_value: 100,
      };

      const result = await measureService.updateMeasure(payload);

      expect(result).toEqual({
        status: httpStatus.NotFound,
        message: {
          error_code: "MEASURE_NOT_FOUND",
          error_description: "Leitura do mês já realizada",
        },
      });
    });

    it("should return 409 if measure has already been confirmed", async () => {
      findOneMock.mockResolvedValue({ has_confirmed: true });

      const payload: MeasureConfirm = {
        measure_uuid: "uuid123",
        confirmed_value: 100,
      };

      const result = await measureService.updateMeasure(payload);

      expect(result).toEqual({
        status: httpStatus.Conflict,
        message: {
          error_code: "CONFIRMATION_DUPLICATE",
          error_description: "Leitura do mês já realizada",
        },
      });
    });

    it("should return 200 if measure is updated successfully", async () => {
      findOneMock.mockResolvedValue({ has_confirmed: false });
      updateMock.mockResolvedValue(true);

      const payload: MeasureConfirm = {
        measure_uuid: "uuid123",
        confirmed_value: 100,
      };

      const result = await measureService.updateMeasure(payload);

      expect(result).toEqual({
        status: httpStatus.OK,
        message: {
          success: true,
        },
      });
    });

    it("should handle errors and return internal server error", async () => {
      findOneMock.mockRejectedValue(new Error("Database error"));

      const payload: MeasureConfirm = {
        measure_uuid: "uuid123",
        confirmed_value: 100,
      };

      const result = await measureService.updateMeasure(payload);

      expect(result).toEqual({
        status: httpStatus.InternalSeverError,
        message: {
          error_code: "INTERNAL_SERVER_ERROR",
          error_description: expect.stringContaining(
            "Não foi possível completar a operação. ERROR:"
          ),
        },
      });
    });
  });

  describe("getMeasure", () => {
    it("should return 404 status if no measures are found", async () => {
      findMock.mockResolvedValue([]);

      const result = await measureService.getMeasure("customer1");

      expect(result).toEqual({
        status: httpStatus.NotFound,
        message: {
          error_code: "MEASURES_NOT_FOUND",
          error_description: "Nenhuma leitura encontrada",
        },
      });
    });

    it("should return 200 with measures", async () => {
      const date = new Date();
      findMock.mockResolvedValue([
        {
          measure_uuid: "uuid123",
          measure_datetime: date,
          measure_type: MeasureTypes.GAS,
          has_confirmed: true,
          image_base64: "base64string",
        },
      ]);
      generateImageUrlMock.mockReturnValue("http://example.com/image.jpg");

      const result = await measureService.getMeasure("customer1");

      expect(result).toEqual({
        status: httpStatus.OK,
        message: {
          customer_code: "customer1",
          measures: [
            {
              measure_uuid: "uuid123",
              measure_datetime: date,
              measure_type: MeasureTypes.GAS,
              has_confirmed: true,
              image_url: "http://example.com/image.jpg",
            },
          ],
        },
      });
    });

    it("should handle errors and return internal server error", async () => {
      findMock.mockRejectedValue(new Error("Database error"));

      const result = await measureService.getMeasure("customer1");

      expect(result).toEqual({
        status: httpStatus.InternalSeverError,
        message: {
          error_code: "INTERNAL_SERVER_ERROR",
          error_description: expect.stringContaining(
            "Não foi possível completar a operação. ERROR:"
          ),
        },
      });
    });
  });
});
