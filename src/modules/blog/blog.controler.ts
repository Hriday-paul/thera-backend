import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

import httpStatus from 'http-status'
import config from "../../config";
import { blogService } from "./blog.service";

// get all blogs
const allBlogs = catchAsync(async (req, res) => {
    const query = req.query
    const result = await blogService.allBlogs(query)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'all blogs fetched successfully',
        data: result,
    });
})

const singleBlog = catchAsync(async (req, res) => {
    const result = await blogService.singleBlog(req.params.id)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'blog fetched successfully',
        data: result,
    });
})

const createBlog = catchAsync(async (req: Request, res: Response) => {

    const image = req.file?.filename && (config.BASE_URL + '/images/' + req.file.filename) || '';

    const result = await blogService.createBlog(req.body, image);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'blog create successfully',
        data: result,
    });
});

const updateBlog = catchAsync(async (req: Request, res: Response) => {
    let image;

    image = req.file?.filename && (config.BASE_URL + '/images/' + req.file.filename) || '';

    const result = await blogService.updateBlog(req.body, req.params.id, image)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'blog updated successfully',
        data: result,
    });
})

const deleteBlog = catchAsync(async (req: Request, res: Response) => {
    const result = await blogService.deleteBlog(req.params.id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'blog deleted successfully',
        data: result,
    });
});

export const blogControler = {
    allBlogs,
    createBlog,
    updateBlog,
    deleteBlog,
    singleBlog
}