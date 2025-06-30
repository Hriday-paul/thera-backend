import { model, Model, Schema } from 'mongoose';
import { IGames } from './games.interface';

export interface gameModel extends Model<IGames> { }

const GameSchema: Schema<IGames> = new Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    status: { type: Boolean, default: true },
    description: { type: String, required: true },
    link: { type: String, required: true },
  },
  { timestamps: true },
);

export const Game = model<IGames, gameModel>('games', GameSchema);