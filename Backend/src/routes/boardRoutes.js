import express from "express";
import boardController from "../controllers/boardController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validateMiddleware.js";
import boardValidation from "../validations/boardValidation.js";

const router = express.Router();

router.get("/workspace/:workspaceId", authMiddleware.authenticate, boardController.getBoardsByWorkspace);
router.get("/:id", authMiddleware.authenticate, boardController.getBoardById);

router.post("/", authMiddleware.authenticate, validate(boardValidation.createBoardSchema), boardController.createBoard);

router.patch("/:id", authMiddleware.authenticate, validate(boardValidation.updateBoardSchema), boardController.updateBoard);
router.patch("/:id/deactivate", authMiddleware.authenticate, boardController.deactivateBoard);

router.post("/:id/invite", authMiddleware.authenticate, validate(boardValidation.inviteUserToBoardSchema), boardController.inviteUserToBoard);

router.post("/:id/columns", authMiddleware.authenticate, boardController.addColumn);
router.delete("/:id/columns/:columnIndex", authMiddleware.authenticate, boardController.removeColumn);

router.post("/:id/items", authMiddleware.authenticate, boardController.createItem);
router.patch("/:id/items/:itemIndex/columns/:columnIndex", authMiddleware.authenticate, boardController.updateItemCell);

router.post("/:id/charts", authMiddleware.authenticate, boardController.addChart);
router.delete("/:id/charts/:chartIndex", authMiddleware.authenticate, boardController.removeChart);

export default router;