import { Router } from 'express';
import { getAllCurrentUtilization, getAverageHistoricalUtilizationInRadius, getCurrentRestaurantUtilizationsInRadius, getCurrentUtilizationByRestaurantId, postRestaurantUtilization } from '../controllers/utilization.contoller';
import verifyJWTMiddleware from '../middlewares/verifyJWT.middleware';
const utilizationRouter = Router();

utilizationRouter.post('/set', verifyJWTMiddleware, postRestaurantUtilization);
utilizationRouter.get('/current/all', getAllCurrentUtilization);
utilizationRouter.get('/restaurant/:id', getCurrentUtilizationByRestaurantId);
utilizationRouter.get('/location/current', getCurrentRestaurantUtilizationsInRadius);
utilizationRouter.get('/location/history', getAverageHistoricalUtilizationInRadius);

export default utilizationRouter;