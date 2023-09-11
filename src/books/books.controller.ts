import {
  Body,
  Controller,
  Get,
  Param,
  Post,
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
import { join } from 'path';

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
    return this.booksService.getAllBooks();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.booksService.getOneBook(id);
  }

  @Get('cover/:id')
  async getBookCover(@Param('id') id: string, @Res() res) {
    const file = createReadStream(`./uploads/${id}`);
    return file.pipe(res);
  }
}
