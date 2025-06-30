import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { gameService } from "./games.service";
import httpStatus from 'http-status'
import config from "../../config";
import { IGames } from "./games.interface";

// get all games
const allgames = catchAsync(async (req, res) => {
    const query = req.query
    const result = await gameService.allGames(query)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'all games fetched successfully',
        data: result,
    });
})

const createGame = catchAsync(async (req: Request, res: Response) => {

    const image = req.file?.filename && (config.BASE_URL + '/images/' + req.file.filename) || '';

    const result = await gameService.createGame(req.body, image);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'game create successfully',
        data: result,
    });
});

const updateGame = catchAsync(async (req: Request, res: Response) => {
    let image;

    image = req.file?.filename && (config.BASE_URL + '/images/' + req.file.filename) || '';

    const result = await gameService.updateGame(req.body, req.params.id, image)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'game updated successfully',
        data: result,
    });
})

const deleteGame = catchAsync(async (req: Request, res: Response) => {
    const result = await gameService.deleteGame(req.params.id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'game deleted successfully',
        data: result,
    });
});

export const gameControler = {
    allgames,
    createGame,
    updateGame,
    deleteGame
}