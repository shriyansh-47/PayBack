import { Router } from 'express';
import { createExpense, deleteExpense, settleUp, getUserExpenses, hideExpense } from '../controllers/expense.controller.js';
import { verifyJwt } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyJwt);

router.route('/').post(createExpense).get(getUserExpenses);
// /settle must come BEFORE /:expenseId to avoid Express matching "settle" as an ID
router.route('/settle').post(settleUp);
router.route('/:expenseId/hide').post(hideExpense);
router.route('/:expenseId').delete(deleteExpense);

export default router;
