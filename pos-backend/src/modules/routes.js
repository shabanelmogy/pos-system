import express from "express";
import userRouter from "./user/user.routes.js";
import tableRouter from "./table/table.routes.js";
import orderRouter from "./order/order.routes.js";
import paymentRouter from "./payment/payment.routes.js";
import categoryRouter from "./category/category.routes.js";
import itemRouter from "./item/item.routes.js";
import customerRouter from "./customer/customer.routes.js";
import billRouter from "./bill/bill.routes.js";
import shiftRouter from "./shift/shift.routes.js";
import branchRouter from "./branch/branch.routes.js";
import posPointRouter from "./posPoint/posPoint.routes.js";

const router = express.Router();

router.use("/user", userRouter);
router.use("/table", tableRouter);
router.use("/order", orderRouter);
router.use("/payment", paymentRouter);
router.use("/category", categoryRouter);
router.use("/item", itemRouter);
router.use("/customer", customerRouter);
router.use("/bill", billRouter);
router.use("/shift", shiftRouter);
router.use("/branch", branchRouter);
router.use("/pos-point", posPointRouter);

export default router;
