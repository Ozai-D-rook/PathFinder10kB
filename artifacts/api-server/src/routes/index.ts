import { Router, type IRouter } from "express";
import healthRouter from "./health";
import studentsRouter from "./students";
import assessmentsRouter from "./assessments";
import recommendationsRouter from "./recommendations";

const router: IRouter = Router();

router.use(healthRouter);
router.use(studentsRouter);
router.use(assessmentsRouter);
router.use(recommendationsRouter);

export default router;
