import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

import { NastModule } from 'src/transaports/nast.module';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  imports: [
    NastModule
  ]
})
export class OrdersModule {}
