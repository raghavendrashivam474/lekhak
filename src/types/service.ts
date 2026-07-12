// src/types/service.ts
// Shared discriminated union for all service layer returns.

export type ServiceResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

/**
 * Type guard: narrows a ServiceResult<T> to the success branch.
 * Use in callers: `if (isOk(result)) { result.data }`
 */
export function isOk<T>(
  result: ServiceResult<T>
): result is { data: T; error: null } {
  return result.error === null;
}

/**
 * Type guard: narrows to the error branch.
 */
export function isErr<T>(
  result: ServiceResult<T>
): result is { data: null; error: string } {
  return result.error !== null;
}