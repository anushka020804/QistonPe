import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty()
  @IsUUID()
  purchaseOrderId: string;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reference?: string;
}
