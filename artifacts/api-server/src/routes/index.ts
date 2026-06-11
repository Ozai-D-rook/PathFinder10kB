import { Router, type IRouter } from "express";
import healthRouter from "./health";
import studentsRouter from "./students";
import assessmentsRouter from "./assessments";
import recommendationsRouter from "./recommendations";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(studentsRouter);
router.use(assessmentsRouter);
router.use(recommendationsRouter);
router.use(adminRouter);

export default router;
