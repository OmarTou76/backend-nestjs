import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateBookDto } from './dto/create-book.dto';
import { JsonParseInterceptor } from './books.interceptor';
import { createReadStream } from 'fs';
import { Response } from 'express';
import { ObjectId } from 'mongoose';

@Controller('api/books/')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @UseGuards(AuthGuard)
  @Post('')
  @UseInterceptors(FileInterceptor('image'), new JsonParseInterceptor())
  async createBook(
    @Body() body: { book: CreateBookDto },
    @UploadedFile()
    image: Express.Multer.File,
  ) {
    return await this.booksService.saveBook(body.book, image);
  }

  @Get()
  async findAll() {
    return await this.booksService.getAllBooks();
  }
  @Get('bestrating')
  async findBestBook() {
    return await this.booksService.getBestBooks();
  }

  @Get(':id')
  async findOne(@Param('id') id: ObjectId) {
    return await this.booksService.getOneBook(id);
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('image'), new JsonParseInterceptor())
  @Put(':id')
  async updateBook(
    @Param('id') id: ObjectId,
    @Body() body: { book: CreateBookDto } | CreateBookDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return await this.booksService.updateBook(
      id,
      'book' in body ? body.book : body,
      image,
    );
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async removeBook(@Param('id') id: ObjectId) {
    return await this.booksService.deleteBook(id);
  }

  @Get('cover/:id')
  async getBookCover(@Param('id') id: string, @Res() res: Response) {
    const file = createReadStream(`./uploads/${id}`);
    return file.pipe(res);
  }
}
