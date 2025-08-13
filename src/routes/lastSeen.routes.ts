// routes/lastSeen.routes.ts
import { Router } from "express";
import { lastSeenAuth } from "../middleware/lastseen.middleware";
import { updateLastSeen } from "../services/UserActivityService"; 

const lastSeenRouter = Router();

lastSeenRouter.use(lastSeenAuth, updateLastSeen);

export { lastSeenRouter };
