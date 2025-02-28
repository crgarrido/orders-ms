import { IsNumber, IsPositive, IsString } from 'class-validator';

export class OrderItemDto {
  @IsString()
  @IsPositive()
  productId: string;

  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsNumber()
  @IsNumber()
  price: number;
}