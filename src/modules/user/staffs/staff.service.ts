import QueryBuilder from "../../../builder/QueryBuilder";
import { User } from "../user.models";

const StaffsList = async (company: string, query: Record<string, any>) => {

    console.log("------------------")

    const staffModel = new QueryBuilder(User.find({ role: "staf", staf_company_id: company, isDeleted: false }).select("-password").populate({
        path: "staf"
    }), query)
        .search(["name", "email"])
        .filter()
        .sort()
        .paginate();

    const data: any = await staffModel.modelQuery;
    const meta = await staffModel.countTotal();

    return { meta, data };
};

export const StaffService = {
    StaffsList
}