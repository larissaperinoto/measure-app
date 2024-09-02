import MeasureService from "src/services/mesure.service";
import { httpStatus } from "src/utils/httpStatus";
import * as generateImage from "src/utils/generateImageUrl";
import { Measure, MeasureConfirm, MeasureTypes } from "src/utils/types/measure";
import { mockGeminiService } from "../mocks/gemini.service.mock";
import { mockMeasureModel } from "../mocks/measure.model.mock";

jest.mock("../../../src/utils/generateImageUrl");

describe("MeasureService", () => {
  let measureService: MeasureService;

  beforeEach(() => {
    measureService = new MeasureService(mockGeminiService, mockMeasureModel);
  });

  describe("createMeasure", () => {
    it("should return 409 if measure already exists in the month", async () => {
      mockMeasureModel.findMeasureInMonth.mockResolvedValue(true);

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
      mockMeasureModel.findMeasureInMonth.mockResolvedValue(null);
      mockGeminiService.getMeasureFromImage.mockResolvedValue({
        value: 100,
        measure_unit: "m3",
      });

      mockMeasureModel.insert.mockResolvedValue("uuid123");
      jest
        .spyOn(generateImage, "generateImageUrl")
        .mockResolvedValue("http://example.com/image.jpg");

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
      mockMeasureModel.findMeasureInMonth.mockRejectedValue(
        new Error("Database error")
      );

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
      mockMeasureModel.findOne.mockResolvedValue(null);

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
      mockMeasureModel.findOne.mockResolvedValue({ has_confirmed: true });

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
      mockMeasureModel.findOne.mockResolvedValue({ has_confirmed: false });
      mockMeasureModel.update.mockResolvedValue(true);

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
      mockMeasureModel.findOne.mockRejectedValue(new Error("Database error"));

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
      mockMeasureModel.find.mockResolvedValue([]);

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
      mockMeasureModel.find.mockResolvedValue([
        {
          measure_uuid: "uuid123",
          measure_datetime: date,
          measure_type: MeasureTypes.GAS,
          has_confirmed: true,
          image_base64: "base64string",
        },
      ]);
      jest
        .spyOn(generateImage, "generateImageUrl")
        .mockResolvedValue("http://example.com/image.jpg");

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
      mockMeasureModel.find.mockRejectedValue(new Error("Database error"));

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
