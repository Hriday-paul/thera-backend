import express, { NextFunction, Request, Response } from 'express';
import { authRouts } from './modules/auth/auth.rout';
import { userRoutes } from './modules/user/user.rout';
import { contactRoutes } from './modules/contact/contact.route';

import { dashboardRouts } from './modules/dasboard/dashboard.rout';
import { gameRoutes } from './modules/games/games.rout';
import { blogRoutes } from './modules/blog/blog.rout';
import { settingsRoutes } from './modules/settings/settings.rout';
import { productRoutes } from './modules/products/products.route';
import { orderRoutes } from './modules/order/order.route';
import { paymentsRoutes } from './modules/payments/payments.route';


const router = express.Router();

const moduleRoutes = [
    {
        path: '/auth',
        route: authRouts,
    },
    {
        path: '/users',
        route: userRoutes,
    },
    {
        path: '/contacts',
        route: contactRoutes,
    },
    {
        path: '/dashboard',
        route: dashboardRouts,
    },
    {
        path: '/games',
        route: gameRoutes,
    },
    {
        path: '/blogs',
        route: blogRoutes,
    },
    {
        path: '/products',
        route: productRoutes,
    },
    {
        path: '/setting',
        route: settingsRoutes,
    },
    {
        path: '/orders',
        route: orderRoutes,
    },
    {
        path: '/payments',
        route: paymentsRoutes,
    }
];
moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;