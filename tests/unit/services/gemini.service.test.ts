import GeminiService from "../../../src/services/gemini.service";
import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { getMimiType } from "../../../src/utils/generateImageUrl";

jest.mock("@google/generative-ai");
jest.mock("../../../src/utils/generateImageUrl");

describe("GeminiService", () => {
  let geminiService: GeminiService;
  let generateContentMock: jest.Mock;
  let getMimiTypeMock: jest.Mock;

  beforeEach(() => {
    generateContentMock = jest.fn();
    (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
      getGenerativeModel: () =>
        ({
          generateContent: generateContentMock,
        } as unknown as GenerativeModel),
    }));

    getMimiTypeMock = getMimiType as jest.Mock;

    geminiService = GeminiService.getInstance();
  });

  describe("getMeasureFromImage", () => {
    it("should return value and measure_unit", async () => {
      const base64Image = "base64string";
      const mimeType = "image/jpeg";
      const mockResponse = {
        response: {
          text: jest
            .fn()
            .mockReturnValue(
              JSON.stringify({ value: "100", measure_unit: "m3" })
            ),
        },
      };

      getMimiTypeMock.mockResolvedValue(mimeType);
      generateContentMock.mockResolvedValue(mockResponse);

      const result = await geminiService.getMeasureFromImage(base64Image);

      expect(getMimiTypeMock).toHaveBeenCalledWith(base64Image);
      expect(generateContentMock).toHaveBeenCalledWith([
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
