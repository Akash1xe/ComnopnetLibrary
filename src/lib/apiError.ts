import axios from "axios";
import type { ValidationError } from "../types";

function isValidationArray(detail: unknown): detail is ValidationError[] {
  return Array.isArray(detail) && detail.every((item) => typeof item === "object" && item !== null && "msg" in item);
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;

    if (typeof detail === "string" && detail.trim()) {
      return detail;
    }

    if (isValidationArray(detail)) {
      return detail
        .slice(0, 3)
        .map((item) => item.msg)
        .join(", ");
    }

    if (typeof error.message === "string" && error.message.trim()) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}
