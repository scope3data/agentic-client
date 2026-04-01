import { type ZodSchema, type ZodError } from 'zod';
import { Scope3ApiError } from './adapters/base';

export type ValidateMode = boolean | 'input' | 'response';

export function shouldValidateInput(mode: ValidateMode | undefined): boolean {
  return mode === true || mode === 'input';
}

export function shouldValidateResponse(mode: ValidateMode | undefined): boolean {
  return mode === true || mode === 'response';
}

export function validateInput<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Scope3ApiError(400, `Input validation failed: ${formatZodError(result.error)}`, {
      validationErrors: result.error.issues,
    });
  }
  return result.data;
}

export function validateResponse<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Scope3ApiError(502, `Response validation failed: ${formatZodError(result.error)}`, {
      validationErrors: result.error.issues,
    });
  }
  return result.data;
}

function formatZodError(error: ZodError): string {
  return error.issues
    .map((i) => `${i.path.length ? i.path.join('.') : '(root)'}: ${i.message}`)
    .join('; ');
}
