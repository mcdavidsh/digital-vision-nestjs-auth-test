import { HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
export type ResponseInterface<T> = {
  success: boolean;
  status: number;
  message: string;
  data?: T;
};
export const handleError = async (
  message: string,
  status: number = HttpStatus.BAD_REQUEST,
): Promise<ResponseInterface<any>> => {
  return {
    message,
    status,
    success: false,
    data: null,
  };
};

export const handleSuccess = async (
  message: string,
  status: number = HttpStatus.OK,
  data,
): Promise<ResponseInterface<any>> => {
  return {
    message,
    status,
    success: true,
    data,
  };
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};
