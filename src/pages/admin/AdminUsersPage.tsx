import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { StatusView } from '../../components/admin/StatusView'
import {
  createUser,
  listTeacherUsers,
  listUsers,
  setUserActiveState,
  updateUser,
} from '../../repositories/admin/usersRepository'
import { listClassFilterOptions } from '../../repositories/admin/classesRepository'
import type { AdminUser } from '../../types/admin'
import type { UserRole } from '../../types/auth'
import { applyZodErrors } from '../../utils/zodForm'
import { userSchema, type UserFormValues } from '../../validation/adminSchemas'

const USER_ROLES: UserRole[] = ['admin', 'teacher', 'student']

type UserRoleFilter = UserRole | 'all'

const formatDate = (date: Date | null) => (date ? date.toLocaleString('uk-UA') : '—')

export const AdminUsersPage = () => {
  const queryClient = useQueryClient()

  const [roleFilter, setRoleFilter] = useState<UserRoleFilter>('all')
  const [classFilter, setClassFilter] = useState<string>('all')
  const [searchText, setSearchText] = useState('')
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const usersQuery = useQuery({
    queryKey: ['admin-users', roleFilter, classFilter, searchText],
    queryFn: () => listUsers({ role: roleFilter, classId: classFilter, search: searchText }),
  })

  const classesQuery = useQuery({
    queryKey: ['admin-class-filters'],
    queryFn: listClassFilterOptions,
  })

  const teachersQuery = useQuery({
    queryKey: ['admin-teachers-options'],
    queryFn: listTeacherUsers,
  })

  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: 'student',
      classId: '',
    },
  })

  const roleValue = watch('role')

  const resetForm = () => {
    setEditingUser(null)
    setSubmitError(null)
    reset({
      firstName: '',
      lastName: '',
      email: '',
      role: 'student',
      classId: '',
    })
  }

  const saveMutation = useMutation({
    mutationFn: async (values: UserFormValues) => {
      const classId = values.classId?.trim() ? values.classId.trim() : null

      if (editingUser) {
        await updateUser(editingUser.id, {
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          email: values.email.trim().toLowerCase(),
          role: values.role,
          classId,
        })
      } else {
        await createUser({
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          email: values.email.trim().toLowerCase(),
          role: values.role,
          classId,
        })
      }
    },
    onSuccess: async () => {
      resetForm()
      await queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      await queryClient.invalidateQueries({ queryKey: ['admin-teachers-options'] })
    },
    onError: () => {
      setSubmitError('Не вдалося зберегти користувача. Спробуйте ще раз.')
    },
  })

  const activationMutation = useMutation({
    mutationFn: async ({ userId, active }: { userId: string; active: boolean }) => {
      await setUserActiveState(userId, active)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      await queryClient.invalidateQueries({ queryKey: ['admin-teachers-options'] })
    },
  })

  const teachersById = useMemo(() => {
    const map = new Map<string, string>()

    for (const teacher of teachersQuery.data ?? []) {
      map.set(teacher.id, teacher.name)
    }

    return map
  }, [teachersQuery.data])

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null)
    const result = userSchema.safeParse(values)

    if (!result.success) {
      applyZodErrors(result.error, setError)
      return
    }

    await saveMutation.mutateAsync(result.data)
  })

  return (
    <div className="admin-page-grid">
      <div className="admin-card">
        <h2>{editingUser ? 'Редагування користувача' : 'Новий користувач'}</h2>
        <form onSubmit={(event) => void onSubmit(event)} className="admin-form">
          <label>
            Імʼя
            <input type="text" {...register('firstName')} />
            {errors.firstName ? <span className="field-error">{errors.firstName.message}</span> : null}
          </label>
          <label>
            Прізвище
            <input type="text" {...register('lastName')} />
            {errors.lastName ? <span className="field-error">{errors.lastName.message}</span> : null}
          </label>
          <label>
            Email
            <input type="email" {...register('email')} />
            {errors.email ? <span className="field-error">{errors.email.message}</span> : null}
          </label>
          <label>
            Роль
            <select {...register('role')}>
              {USER_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            {errors.role ? <span className="field-error">{errors.role.message}</span> : null}
          </label>
          <label>
            Клас
            <select {...register('classId')} disabled={classesQuery.isLoading || roleValue !== 'student'}>
              <option value="">Не вказано</option>
              {(classesQuery.data ?? []).map((classItem) => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.title}
                </option>
              ))}
            </select>
            {errors.classId ? <span className="field-error">{errors.classId.message}</span> : null}
          </label>
          {submitError ? <p className="error-message">{submitError}</p> : null}
          <div className="admin-form-actions">
            <button type="submit" className="primary-button" disabled={isSubmitting || saveMutation.isPending}>
              {editingUser ? 'Оновити' : 'Створити'}
            </button>
            <button type="button" className="secondary-button" onClick={resetForm}>
              Очистити
            </button>
          </div>
        </form>
      </div>

      <div className="admin-card">
        <h2>Користувачі</h2>
        <div className="admin-filters">
          <label>
            Пошук
            <input
              type="search"
              value={searchText}
              onChange={(event) => {
                setSearchText(event.target.value)
              }}
              placeholder="Імʼя або email"
            />
          </label>
          <label>
            Роль
            <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as UserRoleFilter)}>
              <option value="all">Усі</option>
              {USER_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>
          <label>
            Клас
            <select value={classFilter} onChange={(event) => setClassFilter(event.target.value)}>
              <option value="all">Усі</option>
              {(classesQuery.data ?? []).map((classItem) => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.title}
                </option>
              ))}
            </select>
          </label>
        </div>

        {usersQuery.isLoading ? <StatusView title="Завантаження користувачів..." /> : null}
        {usersQuery.isError ? <StatusView title="Не вдалося завантажити користувачів" /> : null}
        {!usersQuery.isLoading && !usersQuery.isError && (usersQuery.data?.length ?? 0) === 0 ? (
          <StatusView title="Користувачів не знайдено" description="Змініть фільтри або створіть нового користувача." />
        ) : null}

        {!usersQuery.isLoading && !usersQuery.isError && (usersQuery.data?.length ?? 0) > 0 ? (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Користувач</th>
                  <th>Роль</th>
                  <th>Клас</th>
                  <th>Стан</th>
                  <th>Оновлено</th>
                  <th>Дії</th>
                </tr>
              </thead>
              <tbody>
                {(usersQuery.data ?? []).map((user) => (
                  <tr key={user.id}>
                    <td>
                      <strong>{`${user.lastName} ${user.firstName}`.trim()}</strong>
                      <div>{user.email}</div>
                    </td>
                    <td>{user.role}</td>
                    <td>
                      {user.classId ? (classesQuery.data ?? []).find((item) => item.id === user.classId)?.title ?? user.classId : '—'}
                    </td>
                    <td>{user.active ? 'Активний' : 'Неактивний'}</td>
                    <td>{formatDate(user.updatedAt)}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => {
                            setSubmitError(null)
                            setEditingUser(user)
                            reset({
                              firstName: user.firstName,
                              lastName: user.lastName,
                              email: user.email,
                              role: user.role,
                              classId: user.classId ?? '',
                            })
                          }}
                        >
                          Редагувати
                        </button>
                        <button
                          type="button"
                          className="secondary-button"
                          disabled={activationMutation.isPending}
                          onClick={() =>
                            void activationMutation.mutateAsync({
                              userId: user.id,
                              active: !user.active,
                            })
                          }
                        >
                          {user.active ? 'Деактивувати' : 'Активувати'}
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
      <div className="admin-card admin-card-small">
        <h3>Доступні класні керівники</h3>
        {(teachersQuery.data ?? []).length === 0 ? (
          <StatusView title="Вчителів не знайдено" />
        ) : (
          <ul className="compact-list">
            {(teachersQuery.data ?? []).map((teacher) => (
              <li key={teacher.id}>{teacher.name}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
