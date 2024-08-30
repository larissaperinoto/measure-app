import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";
import { getMimiType } from "../utils/generateImageUrl";

export default class GeminiService {
  private genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
  private model: GenerativeModel;
  public static instance: GeminiService;

  constructor() {
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new GeminiService();
    }

    return this.instance;
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
