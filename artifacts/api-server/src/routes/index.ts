import { Router, type IRouter } from "express";
import healthRouter from "./health";
import adminRouter from "./admin";
import authRouter from "./auth";
import contactRouter from "./contact";
import doctorsRouter from "./doctors";
import listingsRouter from "./listings";
import appointmentsRouter from "./appointments";
import magazineRouter from "./magazine";
import billingRouter from "./billing";
import medicalCentersRouter from "./medical_centers";
import notificationsRouter from "./notifications";
import walletRouter from "./wallet";
import financialRouter from "./financial";

const router: IRouter = Router();

router.use(healthRouter);
router.use(adminRouter);
router.use(authRouter);
router.use(contactRouter);
router.use(doctorsRouter);
router.use(listingsRouter);
router.use(appointmentsRouter);
router.use(magazineRouter);
router.use(billingRouter);
router.use(medicalCentersRouter);
router.use(notificationsRouter);
router.use(walletRouter);
router.use(financialRouter);

export default router;
