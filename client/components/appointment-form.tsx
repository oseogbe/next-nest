'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import api from '@/lib/api'
import { useState } from 'react'
import { format } from 'date-fns'
import { CalendarIcon, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

const appointmentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  appointmentDateTime: z.string().min(1, 'Date and time is required'),
  notes: z.string().optional(),
})

type AppointmentFormData = z.infer<typeof appointmentSchema>

export default function AppointmentForm() {
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
    control,
    setValue,
    watch,
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
  })

  const selectedDate = watch('appointmentDateTime')
  const [selectedDateObj, setSelectedDateObj] = useState<Date | undefined>(
    selectedDate ? new Date(selectedDate) : undefined
  )
  const [selectedTime, setSelectedTime] = useState<string>(
    selectedDate ? format(new Date(selectedDate), 'HH:mm') : ''
  )

  const onSubmit = async (data: AppointmentFormData) => {
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      await api.post('/appointments', data)
      setSubmitStatus({
        type: 'success',
        message: 'Appointment booked successfully! You will receive a calendar invitation via email.',
      })
      reset()
      setSelectedDateObj(undefined)
      setSelectedTime('')
    } catch (error: any) {
      setSubmitStatus({
        type: 'error',
        message: error.response?.data?.message || 'Failed to book appointment. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDateObj(date)
    if (date && selectedTime) {
      const [hours, minutes] = selectedTime.split(':')
      const dateTime = new Date(date)
      dateTime.setHours(parseInt(hours), parseInt(minutes))
      setValue('appointmentDateTime', format(dateTime, "yyyy-MM-dd'T'HH:mm"), {
        shouldValidate: true,
      })
    } else if (date) {
      // Set default time to current time if no time selected
      const dateTime = new Date(date)
      const now = new Date()
      dateTime.setHours(now.getHours(), now.getMinutes())
      setSelectedTime(format(dateTime, 'HH:mm'))
      setValue('appointmentDateTime', format(dateTime, "yyyy-MM-dd'T'HH:mm"), {
        shouldValidate: true,
      })
    }
  }

  const handleTimeChange = (time: string) => {
    setSelectedTime(time)
    if (selectedDateObj && time) {
      const [hours, minutes] = time.split(':')
      const dateTime = new Date(selectedDateObj)
      dateTime.setHours(parseInt(hours), parseInt(minutes))
      setValue('appointmentDateTime', format(dateTime, "yyyy-MM-dd'T'HH:mm"), {
        shouldValidate: true,
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointment Details</CardTitle>
        <CardDescription>
          Please provide your information to schedule an appointment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="john@example.com"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="appointmentDateTime">Preferred Date & Time *</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !selectedDateObj && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDateObj ? (
                      format(selectedDateObj, 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDateObj}
                    onSelect={handleDateSelect}
                    disabled={(date: Date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <div className="relative flex items-center">
                <Clock className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <Input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="pl-10"
                  placeholder="Time"
                />
              </div>
            </div>
            <input
              type="hidden"
              {...register('appointmentDateTime')}
            />
            {errors.appointmentDateTime && (
              <p className="text-sm text-destructive">
                {errors.appointmentDateTime.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Any additional information..."
              rows={4}
            />
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
            {isSubmitting ? 'Booking...' : 'Book Appointment'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

