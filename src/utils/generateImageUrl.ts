import * as fileType from "file-type";

export async function getMimiType(base64Image: string): Promise<string> {
  const buffer = Buffer.from(base64Image, "base64");
  const type = await fileType.fromBuffer(buffer);
  return type ? type.mime : "";
}

export async function generateImageUrl(
  image_base64: string,
  uuid: string
): Promise<string> {
  const type = (await getMimiType(image_base64)).split("/")[1];

  return `${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/public/${uuid}.${type}`;
}
