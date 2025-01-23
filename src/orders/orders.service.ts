import { HttpStatus, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaClient } from '@prisma/client';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { ChangeOrderStatusDto, OrderPaginationDto, UpdateOrderDto } from './dto';
import { NATS_SERVICE, PRODUCT_SERVICE } from 'src/config';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {

  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {
    super();
  }

  private readonly logger = new Logger('OrderServices');

  
  async onModuleInit() {
    await this.$connect();
    this.logger.log('DataBase Orders conected')
  }

  async create(createOrderDto: CreateOrderDto) {
    this.logger.log('---> EJECUTANDO create <----')

    try {

      const productsIds = createOrderDto.items.map( item => item.productId );
      const products = await firstValueFrom(
        this.client.send( {cmd: 'validate_products'}, productsIds)
       )
     

       //2. Cálculos de los valores
       const totalAmount = createOrderDto.items.reduce((acc, orderItem) => {

        const price = products.find(
          (product) => product.id == orderItem.productId,

        ).price;

          return price * orderItem.quantity;

       },0);


       const totalItems = createOrderDto.items.reduce( (acc, orderItem) =>{
        return acc + orderItem.quantity;

       },0)

       //3. Crear una transaccion de base de datos
       const order = await this.order.create({
        data:{
          totalAmount: totalAmount,
          totalItems: totalItems,
          OrderItem:{
            createMany: {
              data: createOrderDto.items.map( (orderItem) => ({
                price: products.find( product => product.id == orderItem.productId).price,
                productId: orderItem.productId,
                quentity: orderItem.quantity
              }) )
            }
          }
        },
        include: {
          OrderItem: {
            select: {
              price: true,
              quentity: true,
              productId: true,
            }
          }
        }
       });



       return {
        ... order,
        OrderItem: order.OrderItem.map( (orderItem) => ({
          ... orderItem,
          name: products.find( product => product.id == orderItem.productId).name,
        }))
      };
         
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Same products were not found'
      })
    }
  }

  async findAll(orderPaginationDto:OrderPaginationDto) {
    this.logger.log('---> EJECUTANDO findAll <----')
    const {page, limit} = orderPaginationDto;

    const totalPages = await this.order.count({
      where:{
        status: orderPaginationDto.status
      }
    });
    const lastPage = Math.ceil( totalPages / limit);

    return {
      data: await this.order.findMany({
        skip:( page -1 ) * limit,
        take: limit,
        where:{
          status: orderPaginationDto.status
        }
        
      }),
      meta:{
        total: totalPages,
        page: page,
        lastPage: lastPage,
      }
    }
  }



  async findOne(id: string) {

  

    const order =  await this.order.findUnique({
      where: {
        id: id
      },
      include: {
        OrderItem: {
          select: {
            price: true,
            quentity: true,
            productId: true,
          }}
      }
    })
    
    if( !order) {
      throw new RpcException(
        {
          message:`Order with ID #${ id } not found`,
          status: HttpStatus.BAD_REQUEST
        } 
      );
    }

    const productsIds = order.OrderItem.map( item => item.productId );
      const products = await firstValueFrom(
        this.client.send( {cmd: 'validate_products'}, productsIds)
       )

    return {
      ... order,
      OrderItem: order.OrderItem.map( (orderItem) => ({
        ... orderItem,
        name: products.find( product => product.id == orderItem.productId).name,
      }))
    };
  }

  async changeOrderStatus( changeOrderStatusDto: ChangeOrderStatusDto) {

    const { id, status} = changeOrderStatusDto;

    const order = await  this.findOne(id);
    if ( order.status == status){
      return order;
    }


    return this.order.update({
      where: {id},
      data: { status: status}
    });
    
  }


}
