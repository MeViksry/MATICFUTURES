// backend/src/utils/apiResponse.ts
import { Response } from 'express'

export interface ApiResponseData<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = 200,
  meta?: ApiResponseData['meta']
): Response => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
    meta
  })
}

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 400,
  error?: string
): Response => {
  return res.status(statusCode).json({
    success: false,
    message,
    error
  })
}

export const sendPaginated = <T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number
): Response => {
  return res.status(200).json({
    success: true,
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  })
}