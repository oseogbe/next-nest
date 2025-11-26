import AppointmentForm from '@/components/appointment-form'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Book an Appointment
          </h1>
          <p className="text-gray-600">
            Fill out the form below to schedule your appointment
          </p>
        </div>
        <AppointmentForm />
      </div>
    </main>
  )
}

