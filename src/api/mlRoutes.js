import express from "express";
import { spawn } from "child_process";

const router = express.Router();

router.post("/predict-demand", async (req, res) => {
  const input = req.body;

  const py = spawn("python", [
    "ml/predict.py",
    JSON.stringify(input),
  ]);

  let data = "";

  py.stdout.on("data", (chunk) => {
    data += chunk.toString();
  });

  py.on("close", () => {
    res.json(JSON.parse(data));
  });
});

export default router;
