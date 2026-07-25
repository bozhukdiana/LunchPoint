import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import type { ZodError } from 'zod'

export const applyZodErrors = <TFieldValues extends FieldValues>(
  error: ZodError<TFieldValues>,
  setError: UseFormSetError<TFieldValues>,
) => {
  for (const issue of error.issues) {
    const path = issue.path[0]

    if (typeof path === 'string') {
      setError(path as Path<TFieldValues>, { message: issue.message })
    }
  }
}
