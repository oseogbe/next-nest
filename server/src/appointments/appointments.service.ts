import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { GoogleCalendarService } from '../google-calendar/google-calendar.service';

@Injectable()
export class AppointmentsService {
  constructor(
    private prisma: PrismaService,
    private googleCalendarService: GoogleCalendarService,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto) {
    // Create appointment in database
    const appointment = await this.prisma.appointment.create({
      data: {
        name: createAppointmentDto.name,
        email: createAppointmentDto.email,
        appointmentDateTime: new Date(createAppointmentDto.appointmentDateTime),
        notes: createAppointmentDto.notes,
      },
    });

    // Create Google Calendar event
    try {
      const eventId = await this.googleCalendarService.createEvent({
        summary: `Appointment with ${appointment.name}`,
        description: appointment.notes || '',
        start: appointment.appointmentDateTime,
        end: new Date(
          new Date(appointment.appointmentDateTime).getTime() + 60 * 60 * 1000,
        ), // 1 hour duration
        attendeeEmail: appointment.email,
      });

      // Update appointment with Google Calendar event ID
      return this.prisma.appointment.update({
        where: { id: appointment.id },
        data: { googleEventId: eventId },
      });
    } catch (error: any) {
      // If Google Calendar creation fails, still return the appointment
      const errorMessage = error?.response?.data?.error?.message || error?.message || 'Unknown error';
      const errorCode = error?.code || error?.status;
      
      console.error('Failed to create Google Calendar event:', {
        code: errorCode,
        message: errorMessage,
        errors: error?.response?.data?.error?.errors,
      });
      
      // Log specific guidance for common errors
      if (errorCode === 403 && errorMessage.includes('API has not been used')) {
        console.error('⚠️  Google Calendar API is not enabled. Please enable it in Google Cloud Console.');
      } else if (errorCode === 401) {
        console.error('⚠️  Authentication failed. Please check your Google service account credentials.');
      } else if (errorCode === 404) {
        console.error('⚠️  Calendar not found. Please check GOOGLE_CALENDAR_ID environment variable.');
      }
      
      return appointment;
    }
  }

  async findAll() {
    return this.prisma.appointment.findMany({
      orderBy: {
        appointmentDateTime: 'desc',
      },
    });
  }
}

