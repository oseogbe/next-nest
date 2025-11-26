import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { ConfigService } from '@nestjs/config';

interface CreateEventParams {
  summary: string;
  description?: string;
  start: Date;
  end: Date;
  attendeeEmail: string;
}

@Injectable()
export class GoogleCalendarService {
  private calendar;

  constructor(private configService: ConfigService) {
    // Initialize Google Calendar API
    // Using service account for server-to-server authentication
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: this.configService.get<string>(
          'GOOGLE_SERVICE_ACCOUNT_EMAIL',
        ),
        private_key: this.configService
          .get<string>('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY')
          ?.replace(/\\n/g, '\n'),
        project_id: this.configService.get<string>(
          'GOOGLE_PROJECT_ID',
        ),
      },
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    this.calendar = google.calendar({ version: 'v3', auth });
  }

  async createEvent(params: CreateEventParams): Promise<string> {
    try {
      const calendarId =
        this.configService.get<string>('GOOGLE_CALENDAR_ID') || 'primary';

      // Build event description to include attendee info since service accounts
      // cannot invite attendees without domain-wide delegation
      const description = params.description 
        ? `${params.description}\n\nAttendee: ${params.attendeeEmail}`
        : `Attendee: ${params.attendeeEmail}`;

      const event = {
        summary: params.summary,
        description: description,
        start: {
          dateTime: params.start.toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: params.end.toISOString(),
          timeZone: 'UTC',
        },
        // Note: Service accounts cannot invite attendees without domain-wide delegation
        // The attendee email is included in the description instead
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 10 },
          ],
        },
      };

      // Try to create event with attendees first (if domain-wide delegation is set up)
      // If that fails, create without attendees
      try {
        const eventWithAttendees = {
          ...event,
          attendees: [
            {
              email: params.attendeeEmail,
            },
          ],
        };

        const response = await this.calendar.events.insert({
          calendarId,
          requestBody: eventWithAttendees,
          sendUpdates: 'all',
        });

        return response.data.id || '';
      } catch (attendeeError: any) {
        // If inviting attendees fails (likely due to service account limitations),
        // create the event without attendees
        if (attendeeError?.code === 403 && attendeeError?.errors?.[0]?.reason === 'forbiddenForServiceAccounts') {
          console.warn('Cannot invite attendees with service account. Creating event without attendees.');
          
          const response = await this.calendar.events.insert({
            calendarId,
            requestBody: event,
            sendUpdates: 'none', // No updates since there are no attendees
          });

          return response.data.id || '';
        }
        // Re-throw if it's a different error
        throw attendeeError;
      }
    } catch (error) {
      console.error('Error creating Google Calendar event:', error);
      throw error;
    }
  }
}

