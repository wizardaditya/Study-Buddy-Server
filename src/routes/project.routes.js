const router = require("express").Router();
const { getProjects, createProject, getProject, starProject, deleteProject } = require("../controllers/project.controller");
const { authenticate, optionalAuth } = require("../middleware/auth.middleware");

router.get("/", optionalAuth, getProjects);
router.post("/", authenticate, createProject);
router.get("/:id", optionalAuth, getProject);
router.post("/:id/star", authenticate, starProject);
router.delete("/:id", authenticate, deleteProject);

module.exports = router;
