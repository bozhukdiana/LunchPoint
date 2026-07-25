import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { StatusView } from '../../components/admin/StatusView'
import { createClass, listClasses, setClassArchivedState, updateClass } from '../../repositories/admin/classesRepository'
import { listSchoolYears } from '../../repositories/admin/schoolYearsRepository'
import { listTeacherUsers } from '../../repositories/admin/usersRepository'
import type { SchoolClass } from '../../types/admin'
import { applyZodErrors } from '../../utils/zodForm'
import { classSchema, type ClassFormValues } from '../../validation/adminSchemas'

export const AdminClassesPage = () => {
  const queryClient = useQueryClient()

  const [selectedSchoolYear, setSelectedSchoolYear] = useState<string>('')
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const schoolYearsQuery = useQuery({
    queryKey: ['admin-school-years'],
    queryFn: listSchoolYears,
  })

  useEffect(() => {
    if (selectedSchoolYear) {
      return
    }

    const firstAvailable = schoolYearsQuery.data?.find((item) => !item.archived)

    if (firstAvailable) {
      setSelectedSchoolYear(firstAvailable.id)
    }
  }, [schoolYearsQuery.data, selectedSchoolYear])

  const teachersQuery = useQuery({
    queryKey: ['admin-teachers-options'],
    queryFn: listTeacherUsers,
  })

  const classesQuery = useQuery({
    queryKey: ['admin-classes', selectedSchoolYear],
    queryFn: () => listClasses(selectedSchoolYear),
    enabled: selectedSchoolYear.length > 0,
  })

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ClassFormValues>({
    defaultValues: {
      name: '',
      classTeacherId: '',
    },
  })

  const saveMutation = useMutation({
    mutationFn: async (values: ClassFormValues) => {
      if (!selectedSchoolYear) {
        throw new Error('School year must be selected.')
      }

      const payload = {
        name: values.name.trim(),
        classTeacherId: values.classTeacherId?.trim() ? values.classTeacherId.trim() : null,
      }

      if (editingClass) {
        await updateClass(selectedSchoolYear, editingClass.id, payload)
      } else {
        await createClass(selectedSchoolYear, payload)
      }
    },
    onSuccess: async () => {
      reset({ name: '', classTeacherId: '' })
      setEditingClass(null)
      setSubmitError(null)
      await queryClient.invalidateQueries({ queryKey: ['admin-classes', selectedSchoolYear] })
      await queryClient.invalidateQueries({ queryKey: ['admin-class-filters'] })
    },
    onError: () => {
      setSubmitError('Не вдалося зберегти клас.')
    },
  })

  const archiveMutation = useMutation({
    mutationFn: async ({ classId, archived }: { classId: string; archived: boolean }) => {
      await setClassArchivedState(selectedSchoolYear, classId, archived)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-classes', selectedSchoolYear] })
      await queryClient.invalidateQueries({ queryKey: ['admin-class-filters'] })
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null)
    const result = classSchema.safeParse(values)

    if (!result.success) {
      applyZodErrors(result.error, setError)
      return
    }

    await saveMutation.mutateAsync(result.data)
  })

  const selectedYear = useMemo(
    () => schoolYearsQuery.data?.find((item) => item.id === selectedSchoolYear) ?? null,
    [schoolYearsQuery.data, selectedSchoolYear],
  )

  const teacherNames = useMemo(() => {
    const map = new Map<string, string>()

    for (const teacher of teachersQuery.data ?? []) {
      map.set(teacher.id, teacher.name)
    }

    return map
  }, [teachersQuery.data])

  return (
    <div className="admin-page-grid">
      <div className="admin-card">
        <h2>{editingClass ? 'Редагування класу' : 'Новий клас'}</h2>
        <label>
          Навчальний рік
          <select value={selectedSchoolYear} onChange={(event) => setSelectedSchoolYear(event.target.value)}>
            <option value="">Оберіть навчальний рік</option>
            {(schoolYearsQuery.data ?? [])
              .filter((item) => !item.archived)
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
          </select>
        </label>

        <form onSubmit={(event) => void onSubmit(event)} className="admin-form">
          <label>
            Назва класу
            <input type="text" {...register('name')} />
            {errors.name ? <span className="field-error">{errors.name.message}</span> : null}
          </label>
          <label>
            Класний керівник
            <select {...register('classTeacherId')}>
              <option value="">Не призначено</option>
              {(teachersQuery.data ?? []).map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </label>
          {submitError ? <p className="error-message">{submitError}</p> : null}
          <div className="admin-form-actions">
            <button type="submit" className="primary-button" disabled={isSubmitting || saveMutation.isPending || !selectedSchoolYear}>
              {editingClass ? 'Оновити' : 'Створити'}
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setEditingClass(null)
                reset({ name: '', classTeacherId: '' })
              }}
            >
              Очистити
            </button>
          </div>
        </form>
      </div>

      <div className="admin-card">
        <h2>Класи {selectedYear ? `(${selectedYear.title})` : ''}</h2>
        {classesQuery.isLoading ? <StatusView title="Завантаження класів..." /> : null}
        {classesQuery.isError ? <StatusView title="Не вдалося завантажити класи" /> : null}
        {!classesQuery.isLoading && !classesQuery.isError && !selectedSchoolYear ? (
          <StatusView title="Оберіть навчальний рік" />
        ) : null}
        {!classesQuery.isLoading && !classesQuery.isError && (classesQuery.data?.length ?? 0) === 0 && selectedSchoolYear ? (
          <StatusView title="Класи відсутні" />
        ) : null}

        {!classesQuery.isLoading && !classesQuery.isError && (classesQuery.data?.length ?? 0) > 0 ? (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Назва</th>
                  <th>Класний керівник</th>
                  <th>Статус</th>
                  <th>Дії</th>
                </tr>
              </thead>
              <tbody>
                {(classesQuery.data ?? []).map((classItem) => (
                  <tr key={classItem.id}>
                    <td>{classItem.name}</td>
                    <td>{classItem.classTeacherId ? teacherNames.get(classItem.classTeacherId) ?? '—' : '—'}</td>
                    <td>{classItem.archived ? 'Архівний' : 'Активний'}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => {
                            setEditingClass(classItem)
                            setSubmitError(null)
                            reset({
                              name: classItem.name,
                              classTeacherId: classItem.classTeacherId ?? '',
                            })
                          }}
                        >
                          Редагувати
                        </button>
                        <button
                          type="button"
                          className="secondary-button"
                          disabled={archiveMutation.isPending}
                          onClick={() =>
                            void archiveMutation.mutateAsync({
                              classId: classItem.id,
                              archived: !classItem.archived,
                            })
                          }
                        >
                          {classItem.archived ? 'Відновити' : 'Архівувати'}
                        </button>
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
