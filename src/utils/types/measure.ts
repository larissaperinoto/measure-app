export enum MeasureTypes {
  WATER = "WATER",
  GAS = "GAS",
}

export type Measure = {
  image: string;
  customer_code: string;
  measure_datetime: Date;
  measure_type: MeasureTypes;
};

export type MeasureConfirm = {
  measure_uuid: "string";
  confirmed_value: number;
};
