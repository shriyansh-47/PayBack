import { Router } from 'express';
import { createGroup, getGroupDashboard, getGroupActivity, simplifyGroupDebts, getUserGroups, deleteGroup } from '../controllers/group.controller.js';
import { verifyJwt } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyJwt);

router.route('/').post(createGroup);
router.route('/user-groups').get(getUserGroups);
router.route('/:groupId').get(getGroupDashboard).delete(deleteGroup);
router.route('/:groupId/activity').get(getGroupActivity);
router.route('/:groupId/simplify').post(simplifyGroupDebts);

export default router;
