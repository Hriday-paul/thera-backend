import express from 'express';
import { authRouts } from './modules/auth/auth.rout';
import { userRoutes } from './modules/user/user.rout';
import { contactRoutes } from './modules/contact/contact.route';
import { dashboardRouts } from './modules/dasboard/dashboard.rout';
import { settingsRoutes } from './modules/settings/settings.rout';
import { paymentsRoutes } from './modules/payments/payments.route';
import { CaseFileRouts } from './modules/case_files/case_files.route';
import { AppoinmentRouts } from './modules/appoinments/appoinments.route';
import { chatRoutes } from './modules/chat/chat.route';
import { messagesRoutes } from './modules/messages/messages.route';
import { notificationRoute } from './modules/notification/notification.routes';
import { TaskRouts } from './modules/task/task.route';
import { SubtaskRout } from './modules/subtask/sabtask.rout';
import { TaskOccurenece } from './modules/task_occurece/task_occurence.route';
import { packageRouts } from './modules/package/package.rout';
import { Active_pack_router } from './modules/active_package/active_package.route';
import { invoicesRoutes } from './modules/invoices/invoices.route';


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
        path: '/setting',
        route: settingsRoutes,
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
    {
        path: '/chats',
        route: chatRoutes,
    },
    {
        path: '/notifications',
        route: notificationRoute,
    },
    {
        path: '/messages',
        route: messagesRoutes,
    },
    {
        path: '/tasks',
        route: TaskRouts,
    },
    {
        path: '/subtask',
        route: SubtaskRout,
    },
    {
        path: '/task-occurences',
        route: TaskOccurenece,
    },
    {
        path: '/packages',
        route: packageRouts,
    },
    {
        path: '/active-pack',
        route: Active_pack_router,
    },
    {
        path: '/invoices',
        route: invoicesRoutes,
    },

];
moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;