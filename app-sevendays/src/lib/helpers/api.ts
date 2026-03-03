export function extractApiErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }

  if (error && typeof error === "object") {
    const candidate = error as {
      error?: {
        message?: string;
      };
      message?: string;
    };

    if (
      typeof candidate.error?.message === "string" &&
      candidate.error.message.trim().length > 0
    ) {
      return candidate.error.message;
    }

    if (
      typeof candidate.message === "string" &&
      candidate.message.trim().length > 0
    ) {
      return candidate.message;
    }
  }

  return fallback;
}
