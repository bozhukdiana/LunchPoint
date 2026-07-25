import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { StatusView } from '../../components/admin/StatusView'
import {
  activateSchoolYear,
  archiveSchoolYear,
  createSchoolYear,
  listSchoolYears,
  restoreSchoolYear,
} from '../../repositories/admin/schoolYearsRepository'
import { applyZodErrors } from '../../utils/zodForm'
import { schoolYearSchema, type SchoolYearFormValues } from '../../validation/adminSchemas'

const formatDate = (date: Date | null) => (date ? date.toLocaleDateString('uk-UA') : '—')

export const AdminSchoolYearsPage = () => {
  const queryClient = useQueryClient()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const schoolYearsQuery = useQuery({
    queryKey: ['admin-school-years'],
    queryFn: listSchoolYears,
  })

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SchoolYearFormValues>({
    defaultValues: { title: '' },
  })

  const createMutation = useMutation({
    mutationFn: async (title: string) => createSchoolYear(title),
    onSuccess: async () => {
      reset({ title: '' })
      await queryClient.invalidateQueries({ queryKey: ['admin-school-years'] })
    },
    onError: () => {
      setSubmitError('Не вдалося створити навчальний рік.')
    },
  })

  const statusMutation = useMutation({
    mutationFn: async ({ schoolYearId, action }: { schoolYearId: string; action: 'activate' | 'archive' | 'restore' }) => {
      if (action === 'activate') {
        await activateSchoolYear(schoolYearId)
        return
      }

      if (action === 'archive') {
        await archiveSchoolYear(schoolYearId)
        return
      }

      await restoreSchoolYear(schoolYearId)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-school-years'] })
      await queryClient.invalidateQueries({ queryKey: ['admin-class-filters'] })
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null)
    const result = schoolYearSchema.safeParse(values)

    if (!result.success) {
      applyZodErrors(result.error, setError)
      return
    }

    await createMutation.mutateAsync(result.data.title.trim())
  })

  return (
    <div className="admin-page-grid single-column">
      <div className="admin-card">
        <h2>Новий навчальний рік</h2>
        <form onSubmit={(event) => void onSubmit(event)} className="admin-form form-inline">
          <label>
            Назва
            <input type="text" {...register('title')} placeholder="2026/2027" />
            {errors.title ? <span className="field-error">{errors.title.message}</span> : null}
          </label>
          <button type="submit" className="primary-button" disabled={isSubmitting || createMutation.isPending}>
            Створити
          </button>
        </form>
        {submitError ? <p className="error-message">{submitError}</p> : null}
      </div>

      <div className="admin-card">
        <h2>Навчальні роки</h2>
        {schoolYearsQuery.isLoading ? <StatusView title="Завантаження..." /> : null}
        {schoolYearsQuery.isError ? <StatusView title="Не вдалося завантажити навчальні роки" /> : null}
        {!schoolYearsQuery.isLoading && !schoolYearsQuery.isError && (schoolYearsQuery.data?.length ?? 0) === 0 ? (
          <StatusView title="Навчальні роки відсутні" />
        ) : null}
        {!schoolYearsQuery.isLoading && !schoolYearsQuery.isError && (schoolYearsQuery.data?.length ?? 0) > 0 ? (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Назва</th>
                  <th>Статус</th>
                  <th>Архів</th>
                  <th>Створено</th>
                  <th>Дії</th>
                </tr>
              </thead>
              <tbody>
                {(schoolYearsQuery.data ?? []).map((year) => (
                  <tr key={year.id}>
                    <td>{year.title}</td>
                    <td>{year.active ? 'Активний' : 'Неактивний'}</td>
                    <td>{year.archived ? 'Так' : 'Ні'}</td>
                    <td>{formatDate(year.createdAt)}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="secondary-button"
                          disabled={year.active || statusMutation.isPending}
                          onClick={() => void statusMutation.mutateAsync({ schoolYearId: year.id, action: 'activate' })}
                        >
                          Активувати
                        </button>
                        {!year.archived ? (
                          <button
                            type="button"
                            className="secondary-button"
                            disabled={statusMutation.isPending}
                            onClick={() => void statusMutation.mutateAsync({ schoolYearId: year.id, action: 'archive' })}
                          >
                            Архівувати
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="secondary-button"
                            disabled={statusMutation.isPending}
                            onClick={() => void statusMutation.mutateAsync({ schoolYearId: year.id, action: 'restore' })}
                          >
                            Відновити
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  )
}
