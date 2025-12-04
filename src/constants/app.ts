export const USER_ROLE = {
  ADMIN: 'ADMIN',
  CLIENT: 'CLIENT',
} as const;

export const APPOINTMENT_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export const RESOURCE_TYPE = {
  PDF: 'PDF',
  VIDEO: 'VIDEO',
  DOCUMENT: 'DOCUMENT',
  AUDIO: 'AUDIO',
} as const;

export type UserRole = typeof USER_ROLE[keyof typeof USER_ROLE];
export type AppointmentStatus = typeof APPOINTMENT_STATUS[keyof typeof APPOINTMENT_STATUS];
export type ResourceType = typeof RESOURCE_TYPE[keyof typeof RESOURCE_TYPE];
