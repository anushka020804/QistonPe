import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { PaymentTerm } from '../../common/enums/payment-terms.enum';

export class CreateVendorDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ enum: PaymentTerm, default: PaymentTerm.NET_30 })
  @IsEnum(PaymentTerm)
  paymentTerm: PaymentTerm;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}
