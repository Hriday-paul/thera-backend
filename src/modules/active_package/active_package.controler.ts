import { Request, Response } from "express"
import catchAsync from "../../utils/catchAsync"

import sendResponse from "../../utils/sendResponse"
import { active_package_service } from "./active_package.service"

const getActivePackageByCompany = catchAsync(async (req, res: Response) => {

    const result = await active_package_service.getActivePackageByCompany(req?.user?._id);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Active package successfully',
        data: result,
    });

})

export const active_package_controler = {
    getActivePackageByCompany
}