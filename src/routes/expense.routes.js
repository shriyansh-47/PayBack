import { Router } from 'express';
import { createExpense, deleteExpense, settleUp } from '../controllers/expense.controller.js';
import { verifyJwt } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyJwt);

router.route('/').post(createExpense);
router.route('/:expenseId').delete(deleteExpense);
router.route('/settle').post(settleUp);

export default router;
