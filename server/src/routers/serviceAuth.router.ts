import { Router } from "express";
import { checkServiceAccess, login } from "../controllers/auth.controller";
import verifyJWTMiddleware from "../middlewares/verifyJWT.middleware";
import { getTokenFromStore, getUserInfoByToken, redirectToService } from "../controllers/service.controller";
const serviceAuthRouter = Router();

serviceAuthRouter.post("/verify", verifyJWTMiddleware, checkServiceAccess);

serviceAuthRouter.get("/redirect/:service", verifyJWTMiddleware, redirectToService);

serviceAuthRouter.get("/token/:code", getTokenFromStore);

serviceAuthRouter.get("/user-from-token", verifyJWTMiddleware, getUserInfoByToken);



export default serviceAuthRouter;
