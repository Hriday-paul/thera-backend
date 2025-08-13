import { Router } from 'express';
import { chatController } from './chat.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import { createChatValidation } from './chat.validation';
import req_validator from '../../middleware/req_validation';

const router = Router();

router.post(
  '/',
  auth(
    USER_ROLE.admin,
    USER_ROLE.user,
  ),
  createChatValidation,
  req_validator(),
  chatController.createChat,
);

router.patch(
  '/:id',
  auth(
    USER_ROLE.admin,
    USER_ROLE.user,
  ),
  createChatValidation,
  req_validator(),
  chatController.updateChat,
);

router.delete(
  '/:id',
  auth(
    USER_ROLE.admin,
    USER_ROLE.user,
  ),
  chatController.deleteChat,
);

router.get(
  '/my-chat-list',
  auth(
    USER_ROLE.admin,
    USER_ROLE.user,
  ),
  chatController.getMyChatList,
);

router.get(
  '/:id',
  auth(
    USER_ROLE.admin,
    USER_ROLE.user,
  ),
  chatController.getChatById,
);

export const chatRoutes = router;
