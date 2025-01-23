import { Module } from '@nestjs/common';
import { OrdersModule } from './orders/orders.module';
import { NastModule } from './transaports/nast.module';


@Module({
  imports: [OrdersModule,NastModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
