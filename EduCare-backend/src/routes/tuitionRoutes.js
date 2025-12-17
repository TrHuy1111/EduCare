import express from "express";
import { authMiddleware } from "../middlewares/auth.js";
import {
  generateMonthlyTuition,
  getInvoicesByStudent,
  getInvoicesByMonth,
  payInvoice,
  getInvoiceDetail
} from "../controllers/tuitionController.js";

const router = express.Router();

// 🔥 ADMIN
router.post("/generate", authMiddleware, generateMonthlyTuition);
router.get("/month", authMiddleware, getInvoicesByMonth);

// 👨‍👩‍👧 PARENT / STUDENT
router.get("/student/:studentId", authMiddleware, getInvoicesByStudent);

// 💰 PAYMENT
router.patch("/pay/:invoiceId", authMiddleware, payInvoice);

//
router.get("/detail/:invoiceId", authMiddleware, getInvoiceDetail);
export default router;
