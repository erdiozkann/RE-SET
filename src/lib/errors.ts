/**
 * Custom error classes for better error handling
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
    };
  }
}

export class AuthError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'AuthError';
    Object.setPrototypeOf(this, AuthError.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
    };
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      field: this.field,
    };
  }
}

export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} bulunamadı`);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
    };
  }
}

/**
 * Helper function to handle Supabase errors
 */
export function handleSupabaseError(error: any): never {
  console.error('Supabase Error:', error);

  if (error.code === '23505') {
    throw new ApiError('Bu kayıt zaten mevcut', 'DUPLICATE_ENTRY', 409);
  }

  if (error.code === '23503') {
    throw new ApiError('İlişkili kayıt bulunamadı', 'FOREIGN_KEY_VIOLATION', 400);
  }

  if (error.code === 'PGRST116') {
    throw new NotFoundError('Kayıt');
  }

  if (error.message?.includes('JWT')) {
    throw new AuthError('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.', 'JWT_EXPIRED');
  }

  throw new ApiError(
    error.message || 'Bir hata oluştu',
    error.code,
    error.status || 500
  );
}

/**
 * User-friendly error messages
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (error instanceof AuthError) {
    return error.message;
  }

  if (error instanceof ValidationError) {
    return `Geçersiz ${error.field || 'değer'}: ${error.message}`;
  }

  if (error instanceof NotFoundError) {
    return error.message;
  }

  if (error instanceof ApiError) {
    switch (error.code) {
      case 'DUPLICATE_ENTRY':
        return 'Bu kayıt zaten mevcut';
      case 'FOREIGN_KEY_VIOLATION':
        return 'İlişkili kayıt bulunamadı';
      default:
        return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Beklenmeyen bir hata oluştu';
}
