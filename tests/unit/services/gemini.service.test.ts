import {
  GeminiService,
  IGeminiService,
} from "../../../src/services/gemini.service";
import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import * as generateImage from "../../../src/utils/generateImageUrl";

jest.mock("@google/generative-ai");

const mockGenerateContent = jest.fn();

describe("GeminiService", () => {
  let service: IGeminiService;
  let mockModel: GenerativeModel;
  let mockGenAI: GoogleGenerativeAI;
  const apiKey = "mock-api-key";

  beforeEach(() => {
    mockGenAI = new GoogleGenerativeAI(
      apiKey
    ) as jest.Mocked<GoogleGenerativeAI>;
    mockModel = {
      generateContent: mockGenerateContent,
    } as unknown as jest.Mocked<GenerativeModel>;
    mockGenAI.getGenerativeModel = jest.fn().mockReturnValue(mockModel);
    service = new GeminiService(mockGenAI);
  });

  describe("getMeasureFromImage", () => {
    it("should return value and measure_unit", async () => {
      const base64Image = "base64string";
      const mimeType = "image/jpeg";
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => JSON.stringify({ value: "100", measure_unit: "m3" }),
        },
      });
      jest.spyOn(generateImage, "getMimiType").mockResolvedValue(mimeType);

      const result = await service.getMeasureFromImage(base64Image);

      expect(generateImage.getMimiType).toHaveBeenCalledWith(base64Image);
      expect(mockGenerateContent).toHaveBeenCalledWith([
        `Return the value and the measure unit like { "value": measured value as a integer, "measure_unit": measure unit }.`,
        {
          inlineData: {
            data: base64Image,
            mimeType,
          },
        },
      ]);
      expect(result).toEqual({ value: "100", measure_unit: "m3" });
    });
  });
});
