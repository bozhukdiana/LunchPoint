import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { StatusView } from '../../components/admin/StatusView'
import { getGeneralSettings, updateGeneralSettings } from '../../repositories/admin/settingsRepository'
import { applyZodErrors } from '../../utils/zodForm'
import { settingsSchema, type SettingsFormValues } from '../../validation/adminSchemas'

export const AdminSettingsPage = () => {
  const queryClient = useQueryClient()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const settingsQuery = useQuery({
    queryKey: ['admin-settings-general'],
    queryFn: getGeneralSettings,
  })

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormValues>({
    defaultValues: {
      schoolName: '',
      applicationName: 'LunchPoint',
      mealStartTime: '12:00',
      mealEndTime: '14:00',
    },
  })

  useEffect(() => {
    if (settingsQuery.data) {
      reset(settingsQuery.data)
    }
  }, [settingsQuery.data, reset])

  const saveMutation = useMutation({
    mutationFn: async (values: SettingsFormValues) => {
      await updateGeneralSettings({
        schoolName: values.schoolName.trim(),
        applicationName: values.applicationName.trim(),
        mealStartTime: values.mealStartTime,
        mealEndTime: values.mealEndTime,
      })
    },
    onSuccess: async () => {
      setSubmitError(null)
      await queryClient.invalidateQueries({ queryKey: ['admin-settings-general'] })
    },
    onError: () => {
      setSubmitError('Не вдалося зберегти налаштування.')
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null)
    const result = settingsSchema.safeParse(values)

    if (!result.success) {
      applyZodErrors(result.error, setError)
      return
    }

    await saveMutation.mutateAsync(result.data)
  })

  if (settingsQuery.isLoading) {
    return <StatusView title="Завантаження налаштувань..." />
  }

  if (settingsQuery.isError) {
    return <StatusView title="Не вдалося завантажити налаштування" />
  }

  return (
    <div className="admin-page-grid single-column">
      <div className="admin-card">
        <h2>Загальні налаштування</h2>
        <form onSubmit={(event) => void onSubmit(event)} className="admin-form two-columns">
          <label>
            Назва школи
            <input type="text" {...register('schoolName')} />
            {errors.schoolName ? <span className="field-error">{errors.schoolName.message}</span> : null}
          </label>
          <label>
            Назва застосунку
            <input type="text" {...register('applicationName')} />
            {errors.applicationName ? <span className="field-error">{errors.applicationName.message}</span> : null}
          </label>
          <label>
            Початок харчування
            <input type="time" {...register('mealStartTime')} />
            {errors.mealStartTime ? <span className="field-error">{errors.mealStartTime.message}</span> : null}
          </label>
          <label>
            Кінець харчування
            <input type="time" {...register('mealEndTime')} />
            {errors.mealEndTime ? <span className="field-error">{errors.mealEndTime.message}</span> : null}
          </label>
          {submitError ? <p className="error-message">{submitError}</p> : null}
          <div className="admin-form-actions full-width">
            <button type="submit" className="primary-button" disabled={isSubmitting || saveMutation.isPending}>
              Зберегти
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
