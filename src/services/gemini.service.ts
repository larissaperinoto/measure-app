import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";
import { getMimiType } from "../utils/generateImageUrl";

export interface IGeminiService {
  getMeasureFromImage: (
    base64Image: string
  ) => Promise<{ value: string; measure_unit: string }>;
}

export class GeminiService implements IGeminiService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor(genAI: GoogleGenerativeAI) {
    this.genAI = genAI;
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  public async getMeasureFromImage(
    base64Image: string
  ): Promise<{ value: string; measure_unit: string }> {
    const prompt = `Return the value and the measure unit like { "value": measured value as a integer, "measure_unit": measure unit }.`;

    const mimeType = await getMimiType(base64Image);

    const image = {
      inlineData: {
        data: base64Image,
        mimeType,
      },
    };

    const result = await this.model.generateContent([prompt, image]);

    return JSON.parse(result.response.text());
  }
}
