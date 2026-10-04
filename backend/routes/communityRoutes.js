import express from 'express';

import { optionalAuth, requireAuth } from '../middleware/auth.js';

import { list, get, toggleLike } from '../controllers/communityController.js';

const communityRouter = express.Router();

communityRouter.get("/", optionalAuth, list);

communityRouter.get("/:id", optionalAuth, get);

communityRouter.post("/:id/like", requireAuth, toggleLike);

export default communityRouter;