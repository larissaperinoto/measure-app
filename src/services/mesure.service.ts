import { Measure, MeasureConfirm } from "../utils/types/measure";
import { IGeminiService } from "./gemini.service";
import { IMeasureModel } from "../models/measure.model";
import { httpStatus } from "../utils/httpStatus";
import { generateImageUrl } from "../utils/generateImageUrl";
import { ServiceResponse } from "src/utils/types/responses";

export interface IMeasureService {
  createMeasure: (payload: Measure) => Promise<ServiceResponse>;
  updateMeasure: (payload: MeasureConfirm) => Promise<ServiceResponse>;
  getMeasure: (
    customer_code: string,
    measure_type?: string
  ) => Promise<ServiceResponse>;
  getImage: (measure_uuid: string) => Promise<ServiceResponse>;
}

export default class MeasureService implements IMeasureService {
  private geminiService: IGeminiService;
  private model: IMeasureModel;

  constructor(geminiService: IGeminiService, model: IMeasureModel) {
    this.geminiService = geminiService;
    this.model = model;
  }

  public async createMeasure(payload: Measure): Promise<ServiceResponse> {
    const { image, customer_code, measure_datetime, measure_type } = payload;

    try {
      const date = new Date(measure_datetime);
      const year = date.getFullYear();
      const month = date.getMonth();

      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0);

      const data = await this.model.findMeasureInMonth(
        startOfMonth,
        endOfMonth,
        measure_type,
        customer_code
      );

      if (data) {
        return {
          status: httpStatus.Conflict,
          message: {
            error_code: "DOUBLE_REPORT",
            error_description: "Leitura do mês já realizada",
          },
        };
      }

      const { value, measure_unit } =
        await this.geminiService.getMeasureFromImage(image);

      const measure_value = Number(value);

      const uuid = await this.model.insert({
        customer_code,
        measure_datetime,
        measure_type,
        measure_value,
        measure_unit,
        image_base64: image,
      });

      const image_url = await generateImageUrl(image, uuid);

      return {
        status: httpStatus.OK,
        message: {
          image_url,
          measure_value,
          measure_uuid: uuid,
        },
      };
    } catch (e) {
      // console.error(e);
      return {
        status: httpStatus.InternalSeverError,
        message: {
          error_code: "INTERNAL_SERVER_ERROR",
          error_description: `Não foi possível completar a operação. ERROR: ${e}`,
        },
      };
    }
  }

  public async updateMeasure(
    payload: MeasureConfirm
  ): Promise<ServiceResponse> {
    const { measure_uuid, confirmed_value } = payload;

    try {
      const measure = await this.model.findOne({ measure_uuid });

      if (!measure) {
        return {
          status: httpStatus.NotFound,
          message: {
            error_code: "MEASURE_NOT_FOUND",
            error_description: "Leitura do mês já realizada", // fix: no pdf está essa mensagem, mas não parece coerente
          },
        };
      }

      if (measure.has_confirmed) {
        return {
          status: httpStatus.Conflict,
          message: {
            error_code: "CONFIRMATION_DUPLICATE",
            error_description: "Leitura do mês já realizada",
          },
        };
      }

      await this.model.update(
        { measure_uuid },
        { measure_value: confirmed_value, has_confirmed: true }
      );

      return {
        status: httpStatus.OK,
        message: {
          success: true,
        },
      };
    } catch (e) {
      //console.error(e);
      return {
        status: httpStatus.InternalSeverError,
        message: {
          error_code: "INTERNAL_SERVER_ERROR",
          error_description: `Não foi possível completar a operação. ERROR: ${e}`,
        },
      };
    }
  }

  public async getMeasure(customer_code: string, measure_type?: string) {
    try {
      const measures = await this.model.find(
        { customer_code, measure_type },
        {
          measure_uuid: true,
          measure_datetime: true,
          measure_type: true,
          has_confirmed: true,
          image_base64: true,
        }
      );

      if (!measures.length) {
        return {
          status: httpStatus.NotFound,
          message: {
            error_code: "MEASURES_NOT_FOUND",
            error_description: "Nenhuma leitura encontrada",
          },
        };
      }

      const measuresListPromise = measures.map(async (measure) => {
        measure["image_url"] = await generateImageUrl(
          measure.image_base64,
          measure.measure_uuid
        );

        delete measure["image_base64"];

        return measure;
      });

      const measureList = await Promise.all(measuresListPromise);

      return {
        status: httpStatus.OK,
        message: {
          customer_code,
          measures: measureList,
        },
      };
    } catch (e) {
      // console.error(e);
      return {
        status: httpStatus.InternalSeverError,
        message: {
          error_code: "INTERNAL_SERVER_ERROR",
          error_description: `Não foi possível completar a operação. ERROR: ${e}`,
        },
      };
    }
  }

  public async getImage(measure_uuid: string): Promise<ServiceResponse> {
    try {
      const data = await this.model.findOne(
        { measure_uuid },
        { image_base64: true }
      );

      return {
        status: httpStatus.OK,
        message: {
          image: Buffer.from(data.image_base64, "base64"),
        },
      };
    } catch (e) {
      console.error(e);
      return {
        status: httpStatus.InternalSeverError,
        message: {
          error_code: "INTERNAL_SERVER_ERROR",
          error_description: `Não foi possível completar a operação. ERROR: ${e}`,
        },
      };
    }
  }
}
