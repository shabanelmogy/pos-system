import express from "express";
import userRouter from "./user/user.routes.js";
import tableRouter from "./table/table.routes.js";
import orderRouter from "./order/order.routes.js";
import paymentRouter from "./payment/payment.routes.js";
import categoryRouter from "./category/category.routes.js";
import itemRouter from "./item/item.routes.js";

const router = express.Router();

router.use("/user", userRouter);
router.use("/table", tableRouter);
router.use("/order", orderRouter);
router.use("/payment", paymentRouter);
router.use("/category", categoryRouter);
router.use("/item", itemRouter);

export default router;
