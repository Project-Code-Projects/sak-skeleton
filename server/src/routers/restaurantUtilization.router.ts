import { Router } from 'express';
import { getAllCurrentUtilization, getCurrentUtilizationByRestaurantId, postRestaurantUtilization } from '../controllers/utilization.contoller';
import verifyJWTMiddleware from '../middlewares/verifyJWT.middleware';
const utilizationRouter = Router();

utilizationRouter.post('/set', verifyJWTMiddleware, postRestaurantUtilization);
utilizationRouter.get('/current/all', getAllCurrentUtilization);
utilizationRouter.get('/restaurant/:id', getCurrentUtilizationByRestaurantId);

export default utilizationRouter;