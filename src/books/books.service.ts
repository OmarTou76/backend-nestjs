import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Books } from './schemas/books.schema';
import { Model } from 'mongoose';
import { CreateBookDto } from './dto/create-book.dto';
import { randomUUID } from 'crypto';
import { writeFile } from 'fs/promises';
@Injectable()
export class BooksService {
  private readonly MIMETYPE = {
    'image/png': '.png',
    'image/jpg': '.jpg',
    'image/jpeg': '.jpeg',
  };

  private readonly IMAGE_URL = 'http://localhost:4000/api/books/cover/';
  constructor(@InjectModel(Books.name) private booksModel: Model<Books>) {}

  async saveBook(body: CreateBookDto, image: Express.Multer.File) {
    const filename = await this.saveImage(image);

    return await new this.booksModel({
      ...body,
      imageUrl: this.IMAGE_URL + filename,
    }).save();
  }

  async getAllBooks() {
    return await this.booksModel.find();
  }

  async getOneBook(id: string) {
    return await this.booksModel.findById(id);
  }

  private async saveImage(image: Express.Multer.File): Promise<string> {
    if (!this?.MIMETYPE[image?.mimetype])
      throw new ConflictException("Ce type d'image n'est pas pris en compte.");
    const filename = `${randomUUID() + this.MIMETYPE[image.mimetype]}`;
    const path = `./uploads/${filename}`;
    await writeFile(path, image.buffer);
    return filename;
  }
}
