import { Router } from "express";

const router = Router();

router.get("/", async (_, res) => {
  res.json({
    status: "ok",
  });
});

export const healthRouter = router;
