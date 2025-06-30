import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../error/AppError";
import { IGames } from "./games.interface";
import { Game } from "./games.model";
import httpStatus from 'http-status'

//get all games
const allGames = async (query: Record<string, any>) => {
    const gameModel = new QueryBuilder(Game.find(), query)
        .search(['name'])
        .filter()
        .paginate()
        .sort();
    const data: any = await gameModel.modelQuery;
    const meta = await gameModel.countTotal();
    return {
        data,
        meta,
    };
}

const createGame = async (payload: IGames, image: string) => {

    const res = await Game.create({ ...payload, image: image })

    return res;
};

const updateGame = async (payload: IGames, gameId: string, image: string) => {
    const { description, name, status, link } = payload

    const updateFields: Partial<IGames> = { description, name, status, link };

    if (image) updateFields.image = image;

    // Remove undefined or null fields to prevent overwriting existing values with null
    Object.keys(updateFields).forEach((key) => {
        if (updateFields[key as keyof IGames] === undefined || updateFields[key as keyof IGames] === '' || updateFields[key as keyof IGames] === null) {
            delete updateFields[key as keyof IGames];
        }
    });

    if (Object.keys(updateFields).length === 0) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'No valid field found',
        );
    }

    const isExist = await Game.findById(gameId)

    if (!isExist) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Game not found',
        );
    }

    const result = await Game.updateOne({ _id: gameId }, updateFields)

    if (result?.modifiedCount <= 0) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Game update failed, try again',
        );
    }

    return result

}

const deleteGame = async (gameId: string) => {

    const isExist = await Game.findById(gameId)

    if (!isExist) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Game not found',
        );
    }

    const res = await Game.deleteOne({ _id: gameId });

    if (res?.deletedCount <= 0) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Game delete failed, try again',
        );
    }

    return res;
};

export const gameService = {
    allGames,
    createGame,
    updateGame,
    deleteGame
}