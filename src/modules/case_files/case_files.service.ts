import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../error/AppError";
import generateRandomString from "../../utils/generateRandomString";
import { ICaseFile } from "./case_files.interface";
import { CaseFiles } from "./case_files.model";
import httpStatus from "http-status";

const createcaseFile = async (payload: ICaseFile) => {

    const file_id = "#" + generateRandomString(10);

    const res = await CaseFiles.create({ ...payload, file_id })

    return res;
};

const CaseFilesByPatient = async (patient: string, query: Record<string, any>) => {

    const caseFileModel = new QueryBuilder(CaseFiles.find({ patient, isDeleted: false }).populate("assign_stafs").populate("patient"), query)
        .search(["file_id", "name"])
        .sort();

    const data: any = await caseFileModel.modelQuery;

    return data;
};

const updateCaseFileStatus = async (id: string, status: boolean) => {

    const exist = await CaseFiles.findOne({ _id: id, isDeleted: false })

    if (!exist) {
        throw new AppError(httpStatus.NOT_EXTENDED, 'Case File not found');
    }

    const res = await CaseFiles.updateOne({ _id: id }, { isClosed: status })

    return res;
};

const CaseFileStats = async (patient: string) => {

    const total = await CaseFiles.countDocuments({ patient, isDeleted: false });
    const opened = await CaseFiles.countDocuments({ patient, isDeleted: false, isClosed: false });
    const closed = await CaseFiles.countDocuments({ patient, isDeleted: false, isClosed: true });

    return {
        total,
        opened,
        closed
    };
};

export const CaseFileService = {
    createcaseFile,
    CaseFilesByPatient,
    updateCaseFileStatus,
    CaseFileStats
}