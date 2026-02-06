import express from "express";
import { authMiddleware } from "../middlewares/auth.js";
import {
  generateMonthlyTuition,
  getInvoicesByStudent,
  getInvoicesByMonth,
  payInvoice,
  getInvoiceDetail,
  exportTuitionExcel,
  getTuitionStats
} from "../controllers/tuitionController.js";
import { checkRole } from "../middlewares/checkRole.js";
const router = express.Router();

// 🔥 ADMIN
router.post("/generate", authMiddleware, checkRole(['admin']), generateMonthlyTuition);
router.get("/month", authMiddleware, checkRole(['admin']), getInvoicesByMonth);
router.get("/export", authMiddleware, checkRole(['admin']), exportTuitionExcel);
router.get("/stats", authMiddleware, checkRole(['admin']), getTuitionStats);
// 👨‍👩‍👧 PARENT / STUDENT
router.get("/student/:studentId", authMiddleware, getInvoicesByStudent);

// 💰 PAYMENT
router.patch("/pay/:invoiceId", authMiddleware, checkRole(['admin']), payInvoice);

//
router.get("/detail/:invoiceId", authMiddleware, getInvoiceDetail);
export default router;
