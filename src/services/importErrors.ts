import { ApiClientError } from './apiClient'

export interface ImportFailureDescription {
  status: number | null
  title: string
  message: string
  canCorrectRows: boolean
}

export function describeImportFailure(error: unknown): ImportFailureDescription {
  if (error instanceof ApiClientError) {
    if (error.status === 400) {
      return {
        status: 400,
        title: 'La API rechazó el formato o una unidad',
        message: error.detail || error.message,
        canCorrectRows: true,
      }
    }
    if (error.status === 409) {
      return {
        status: 409,
        title: 'La importación entra en conflicto con un registro existente',
        message: error.detail || error.message,
        canCorrectRows: true,
      }
    }
    if (error.status === 422) {
      return {
        status: 422,
        title: 'La API no aceptó el esquema enviado',
        message: error.detail || error.message,
        canCorrectRows: true,
      }
    }
    return {
      status: error.status,
      title: 'No fue posible registrar las observaciones',
      message: error.message,
      canCorrectRows: false,
    }
  }

  return {
    status: null,
    title: 'No fue posible registrar las observaciones',
    message: error instanceof Error ? error.message : 'Ocurrió un error inesperado durante la importación.',
    canCorrectRows: false,
  }
}
