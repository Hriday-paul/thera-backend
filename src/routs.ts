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
import { CaseFileRouts } from './modules/case_files/case_files.route';
import { AppoinmentRouts } from './modules/appoinments/appoinments.route';


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
    },
    {
        path: '/case-files',
        route: CaseFileRouts,
    },
    {
        path: '/appoinments',
        route: AppoinmentRouts,
    },

];
moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;