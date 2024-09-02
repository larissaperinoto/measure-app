export type ErrorResponse = {
  error_code: string;
  error_description: string;
};

export type ServiceResponse = {
  status: number;
  message: Record<string, any>;
};
