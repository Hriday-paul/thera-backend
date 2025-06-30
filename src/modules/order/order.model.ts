import { Model, model, Schema } from 'mongoose';
import { IOrder } from './order.interface';

export interface orderModel extends Model<IOrder> { }

// Define the Mongoose schema
const OrderSchema = new Schema<IOrder>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'users',
            required: true,
        },
        products: [
            {
                id: {
                    type: Schema.Types.ObjectId,
                    ref: 'products',
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                },
            }
        ],
        total_amount: {
            type: Number,
            required: true,
            min: 0,
        },
        address: {
            type: String,
            required: true,
        },
        contact: {
            type: String,
            required: true,
        },
        isPaid: {
            type: Boolean,
            default: false,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        tranId: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            required: true,
            enum: ['pending', "cancel", "complete"], //2 for individual teacher, 3 for school admin & 4 for school teacher & 5 for admin & 6 for sub admin
            default: 'pending'
        },
    },
    {
        timestamps: true,
    },
);


// Create and export the model
const Order = model<IOrder, orderModel>('orders', OrderSchema);

export default Order;
