import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

import { getUserToken } from "@/lib/auth/getUserToken";

type RequestMethod = "get" | "post" | "put" | "patch" | "delete";

type SevendaysApiSuccess<T> = {
  data: T;
  error: null;
  statusCode: number;
};

type SevendaysApiFailure = {
  data: null;
  error: unknown;
  statusCode: number;
};

export type SevendaysApiResponse<T> = SevendaysApiSuccess<T> | SevendaysApiFailure;

function buildApiBaseUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const trimmedUrl = configuredUrl.replace(/\/$/, "");

  return trimmedUrl.endsWith("/api") ? `${trimmedUrl}/` : `${trimmedUrl}/api/`;
}

export class SevendaysApiRequest {
  private static createInstance(options?: AxiosRequestConfig): AxiosInstance {
    const { headers, ...rest } = options || {};
    const token = getUserToken();

    return axios.create({
      baseURL: buildApiBaseUrl(),
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: token } : {}),
        ...headers,
      },
      ...rest,
    });
  }

  private static handleError(error: unknown): SevendaysApiFailure {
    if (axios.isAxiosError(error)) {
      return {
        data: null,
        error: error.response?.data ?? error.message,
        statusCode: error.response?.status ?? -1,
      };
    }

    return {
      data: null,
      error: "Erro inesperado na requisicao.",
      statusCode: -1,
    };
  }

  private static async request<T, U = unknown>(
    method: RequestMethod,
    url: string,
    payload?: U,
    options?: AxiosRequestConfig
  ): Promise<SevendaysApiResponse<T>> {
    try {
      const instance = SevendaysApiRequest.createInstance(options);
      const response = await instance.request<T>({
        method,
        url,
        data: payload,
      });

      return {
        data: response.data,
        error: null,
        statusCode: response.status,
      };
    } catch (error) {
      return SevendaysApiRequest.handleError(error);
    }
  }

  static post<T, U = unknown>(url: string, payload?: U, options?: AxiosRequestConfig) {
    return SevendaysApiRequest.request<T, U>("post", url, payload, options);
  }

  static get<T>(url: string, options?: AxiosRequestConfig) {
    return SevendaysApiRequest.request<T>("get", url, undefined, options);
  }

  static patch<T, U = unknown>(url: string, payload?: U, options?: AxiosRequestConfig) {
    return SevendaysApiRequest.request<T, U>("patch", url, payload, options);
  }

  static delete<T, U = unknown>(url: string, payload?: U, options?: AxiosRequestConfig) {
    return SevendaysApiRequest.request<T, U>("delete", url, payload, options);
  }

  static put<T, U = unknown>(url: string, payload?: U, options?: AxiosRequestConfig) {
    return SevendaysApiRequest.request<T, U>("put", url, payload, options);
  }
}

export const sevendaysapi = SevendaysApiRequest;
