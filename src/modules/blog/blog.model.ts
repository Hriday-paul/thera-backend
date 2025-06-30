import { model, Model, Schema } from 'mongoose';
import { IBlog } from './blog.interface';

export interface blogModel extends Model<IBlog> { }

const BlogSchema: Schema<IBlog> = new Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true },
);

export const Blog = model<IBlog, blogModel>('blogs', BlogSchema);