import axios from "axios"

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || "Something went wrong"
  }
  return "Something went wrong"
}
