import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from 'src/auth/schemas/user.schema';

export type BooksDocument = HydratedDocument<Books>;

@Schema()
export class Books {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: User;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  author: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ required: true })
  year: number;

  @Prop({ required: true })
  genre: string;

  @Prop({
    type: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        grade: { type: Number },
      },
    ],
    required: true,
  })
  ratings: { userId: User; grade: number }[];

  @Prop({ required: true })
  averageRating: number;
}
export const BooksSchema = SchemaFactory.createForClass(Books);
