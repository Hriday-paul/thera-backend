import { model, Model, Schema } from 'mongoose';
import { IProduct } from './products.interface';


export interface productModel extends Model<IProduct> { }

const ProductSchema: Schema<IProduct> = new Schema(
    {
        name: { type: String, required: true },
        images: { type: [String], required: true },
        price: { type: Number, default: 0 },
        details: { type: String, required: true },
        stock: { type: Number, default: 0 },
        // category : {type : String, required : true},
        isDeleted : {type : Boolean, default : false}
    },
    { timestamps: true },
);

export const Products = model<IProduct, productModel>('products', ProductSchema);