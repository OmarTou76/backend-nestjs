import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Books } from './schemas/books.schema';
import { Model, ObjectId } from 'mongoose';
import { CreateBookDto } from './dto/create-book.dto';
import { randomUUID } from 'crypto';
import { unlink, writeFile } from 'fs/promises';
import { AppendRatingDto } from './dto/append-rating.dto';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
import { validate } from 'class-validator';

@Injectable()
export class BooksService {
  private readonly MIMETYPE = {
    'image/png': '.png',
    'image/jpg': '.jpg',
    'image/jpeg': '.jpeg',
  };

  private readonly IMAGE_URL = 'http://localhost:4000/api/books/cover/';
  constructor(@InjectModel(Books.name) private booksModel: Model<Books>) {}

  async deleteUpload(id: ObjectId) {
    const book = await this.getOneBook(id);
    if (!book) throw new ConflictException("Ce livre n'existe pas/plus.");
    const filename = book.imageUrl.split(this.IMAGE_URL)[1];
    const path = `./uploads/${filename}`;
    await unlink(path);
  }

  private getAverage(ratings: Books['ratings']) {
    const sum = ratings.reduce((acc, curr) => (acc += curr.grade), 0);
    return sum / ratings.length;
  }

  async appendRating(id: ObjectId, rating: AppendRatingDto) {
    const book = await this.booksModel.findById(id);
    book.ratings.push({ ...rating, grade: rating.rating });
    book.averageRating = this.getAverage(book.ratings);
    return await book.save();
  }

  async deleteBook(id: ObjectId) {
    await this.deleteUpload(id);
    return await this.booksModel.findByIdAndRemove(id);
  }

  async updateBook(
    id: ObjectId,
    body: CreateBookDto,
    image: Express.Multer.File,
  ) {
    if (!image)
      return await this.booksModel.findOneAndUpdate({ _id: id }, { ...body });

    const filename = await this.saveImage(image);
    await this.deleteUpload(id);

    return this.booksModel.findOneAndUpdate(
      { _id: id },
      {
        ...body,
        imageUrl: this.IMAGE_URL + filename,
      },
    );
  }

  async saveBook(body: CreateBookDto, image: Express.Multer.File) {
    const filename = await this.saveImage(image);

    return await new this.booksModel({
      ...body,
      imageUrl: this.IMAGE_URL + filename,
    }).save();
  }

  async getBestBooks() {
    return await this.booksModel
      .find()
      .sort({ averageRating: -1 })
      .limit(3)
      .exec();
  }

  async getAllBooks() {
    return await this.booksModel.find();
  }

  async getOneBook(id: ObjectId) {
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
