'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import api from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type CreateUserFormData = z.infer<typeof createUserSchema>

interface User {
  id: string
  email: string
  isAdmin: boolean
  createdAt: string
}

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/admin/login')
      return
    }

    fetchUsers()
  }, [router])

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users')
      setUsers(response.data)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: CreateUserFormData) => {
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      await api.post('/users', data)
      setSubmitStatus({
        type: 'success',
        message: 'Admin user created successfully!',
      })
      reset()
      fetchUsers()
    } catch (error: any) {
      setSubmitStatus({
        type: 'error',
        message: error.response?.data?.message || 'Failed to create user',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
            <p className="text-gray-600 mt-1">Create and manage admin users</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/admin/dashboard')}>
            Back to Dashboard
          </Button>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Create New Admin User</CardTitle>
              <CardDescription>
                Add a new admin user to the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="admin@example.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    {...register('password')}
                    placeholder="Minimum 6 characters"
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {submitStatus.type && (
                  <div
                    className={`p-4 rounded-md ${
                      submitStatus.type === 'success'
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    {submitStatus.message}
                  </div>
                )}

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? 'Creating...' : 'Create User'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Existing Users</CardTitle>
              <CardDescription>
                List of all admin users in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No users found</p>
              ) : (
                <div className="space-y-2">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="p-4 border rounded-md flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium">{user.email}</p>
                        <p className="text-sm text-gray-500">
                          Created: {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {user.isAdmin && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          Admin
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

