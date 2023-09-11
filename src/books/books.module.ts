import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Books, BooksSchema } from './schemas/books.schema';
import { BooksController } from './books.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.register({
      global: true,
      secret: process.env.SECRET_KEY,
      signOptions: { expiresIn: '2d' },
    }),
    MongooseModule.forFeature([{ name: Books.name, schema: BooksSchema }]),
  ],
  providers: [BooksService],
  controllers: [BooksController],
})
export class BooksModule {}
