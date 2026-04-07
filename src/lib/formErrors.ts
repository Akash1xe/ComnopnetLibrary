import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import type { ValidationError } from "../types";

export function applyServerErrors<TFieldValues extends FieldValues>(
  errors: ValidationError[],
  setError: UseFormSetError<TFieldValues>,
) {
  for (const error of errors) {
    const path = error.loc.filter((segment) => segment !== "body").join(".");
    if (!path) {
      continue;
    }

    setError(path as Path<TFieldValues>, {
      type: "server",
      message: error.msg,
    });
  }
}
