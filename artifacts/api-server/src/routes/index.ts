import { Router, type IRouter } from "express";
import healthRouter from "./health";
import adminRouter from "./admin";
import authRouter from "./auth";
import doctorsRouter from "./doctors";
import listingsRouter from "./listings";
import appointmentsRouter from "./appointments";

const router: IRouter = Router();

router.use(healthRouter);
router.use(adminRouter);
router.use(authRouter);
router.use(doctorsRouter);
router.use(listingsRouter);
router.use(appointmentsRouter);

export default router;
