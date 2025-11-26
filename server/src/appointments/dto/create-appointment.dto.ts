import { IsString, IsEmail, IsDateString, IsOptional } from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsDateString()
  appointmentDateTime: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

