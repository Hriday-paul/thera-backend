import generateRandomString from "../../utils/generateRandomString";
import { ICaseFile } from "./case_files.interface";
import { CaseFiles } from "./case_files.model";

const createcaseFile = async (payload: ICaseFile) => {

    const file_id = "#" + generateRandomString(10);

    const res = await CaseFiles.create({ ...payload, file_id })

    return res;
};

const CaseFilesByPatient = async (patient: string) => {

    const res = await CaseFiles.find({ patient, isDeleted : false }).populate("assign_stafs").populate("patient");

    return res;
};

export const CaseFileService = {
    createcaseFile,
    CaseFilesByPatient
}