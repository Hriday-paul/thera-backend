import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../error/AppError";

import httpStatus from 'http-status'
import { Blog } from "./blog.model";
import { IBlog } from "./blog.interface";

//get all blogs
const allBlogs = async (query: Record<string, any>) => {
    const blogModel = new QueryBuilder(Blog.find(), query)
        .search(['name', "description"])
        .filter()
        // .paginate()
        .sort();
    const data: any = await blogModel.modelQuery;
    // const meta = await blogModel.countTotal();
    return {
        data,
        // meta,
    };
}

const singleBlog = async (blogId: string) => {
    const blog = await Blog.findById(blogId);

    if (!blog) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Blog not found',
        );
    }

    return blog
}

const createBlog = async (payload: IBlog, image: string) => {

    const res = await Blog.create({ ...payload, image: image })

    return res;
};

const updateBlog = async (payload: IBlog, blogId: string, image: string) => {
    const { description, name } = payload

    const updateFields: Partial<IBlog> = { description, name };

    if (image) updateFields.image = image;

    // Remove undefined or null fields to prevent overwriting existing values with null
    Object.keys(updateFields).forEach((key) => {
        if (updateFields[key as keyof IBlog] === undefined || updateFields[key as keyof IBlog] === '' || updateFields[key as keyof IBlog] === null) {
            delete updateFields[key as keyof IBlog];
        }
    });

    if (Object.keys(updateFields).length === 0) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'No valid field found',
        );
    }

    const isExist = await Blog.findById(blogId)

    if (!isExist) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Blog not found',
        );
    }

    const result = await Blog.updateOne({ _id: blogId }, updateFields)

    if (result?.modifiedCount <= 0) {
        throw new AppError(
            httpStatus.NOT_MODIFIED,
            'Blog update failed, try again',
        );
    }

    return result

}

const deleteBlog = async (blogId: string) => {

    const isExist = await Blog.findById(blogId)

    if (!isExist) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Blog not found',
        );
    }

    const res = await Blog.deleteOne({ _id: blogId })

    if (res?.deletedCount <= 0) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Blog delete failed, try again',
        );
    }

    return res;
};

export const blogService = {
    allBlogs,
    singleBlog,
    createBlog,
    updateBlog,
    deleteBlog
}