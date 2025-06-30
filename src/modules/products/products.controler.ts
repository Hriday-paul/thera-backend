import config from "../../config";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { productService } from "./products.service";
import httpStatus from 'http-status'

const allProducts = catchAsync(async (req, res) => {
    const query = req.query
    const result = await productService.allProducts(query)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'all products fetched successfully',
        data: result,
    });
})

const singleProduct = catchAsync(async (req, res) => {
    const result = await productService.singleProduct(req.params.id)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Product fetched successfully',
        data: result,
    });
})

const addProduct = catchAsync(async (req, res) => {

    const files = req.files as Express.Multer.File[];

    const filePaths = files.map(file => {
        return file?.filename && (config.BASE_URL + '/images/' + file.filename) || '';
    });

    const result = await productService.addProduct(req.body, filePaths)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'product added successfully',
        data: result,
    });
})

const updateProduct = catchAsync(async (req, res) => {

    const files = req.files as Express.Multer.File[];

    const filePaths = files.map(file => {
        return file?.filename && (config.BASE_URL + '/images/' + file.filename) || '';
    });

    const result = await productService.updateProduct(req.body, req.params.id, filePaths)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'product updated successfully',
        data: result,
    });
});

const deleteProduct = catchAsync(async (req, res) => {
    const result = await productService.deleteProduct(req.params.id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Product deleted successfully',
        data: result,
    });
});

export const productControler = {
    allProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    singleProduct
}