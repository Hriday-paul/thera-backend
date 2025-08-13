import { check } from "express-validator";


export const sendMessageValidator = [
  check("chat").trim().trim().not().isEmpty().withMessage("chat id is required"),
  check("receiver").trim().trim().not().isEmpty().isMongoId().withMessage("receiver id is not valid"),
  check("type").trim().trim().not().isEmpty().isIn(["text", "file"]).withMessage("message type should be text or file"),
]

// const updateMessageValidation = z.object({
 
//   body: z.object({
//     chat: z.string({ required_error: 'chat id is required' }),
//     text: z
//       .string({ required_error: 'text is required' })
//       .default('')
//       .optional(), 
//     receiver: z.string({ required_error: 'receiver id is required' }),
//     seen: z.boolean().default(false),
//   }),
// });

// export const messagesValidation = {
//   updateMessageValidation,
// };
