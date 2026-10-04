import express from "express";

import { requireAuth } from "../middleware/auth.js";

import {
  create,
  generate,
  get,
  list,
  loadOwnedProject,
  remove,
  uapdate,
} from "../controllers/projectsControllers.js";

import { githubRoutes, vercelRoute } from "./projectDeploy.js";

const projectRouter = express.Router();

// Get all projects
projectRouter.get("/", requireAuth, list);

// Create a new project
projectRouter.post("/", requireAuth, create);

// Get single project
projectRouter.get("/:id", requireAuth, get);

// Update project
projectRouter.patch("/:id", requireAuth, uapdate);

// Delete project
projectRouter.delete("/:id", requireAuth, remove);

// Generate project
projectRouter.post("/:id/generate", requireAuth, generate);

// Create GitHub repository
projectRouter.post(
  "/:id/github",
  requireAuth,
  githubRoutes(loadOwnedProject)
);

// Deploy project to Vercel
projectRouter.post(
  "/:id/deploy",
  requireAuth,
  vercelRoute(loadOwnedProject)
);

export default projectRouter;