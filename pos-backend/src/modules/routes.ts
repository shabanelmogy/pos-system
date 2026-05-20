import express from "express";
import userRouter from "@/modules/system/user/user.routes.js";
import tableRouter from "@/modules/pos/table/table.routes.js";
import orderRouter from "@/modules/pos/order/order.routes.js";
import paymentRouter from "@/modules/pos/payment/payment.routes.js";
import categoryRouter from "@/modules/catalog/category/category.routes.js";
import itemRouter from "@/modules/catalog/item/item.routes.js";
import customerRouter from "@/modules/crm/customer/customer.routes.js";
import billRouter from "@/modules/pos/bill/bill.routes.js";
import shiftRouter from "@/modules/pos/shift/shift.routes.js";
import branchRouter from "@/modules/system/branch/branch.routes.js";
import posPointRouter from "@/modules/pos/posPoint/posPoint.routes.js";
import posSettingsRouter from "@/modules/pos/posSettings/posSettings.routes.js";
import couponRouter from "@/modules/catalog/coupon/coupon.routes.js";
import kitchenStationRouter from "@/modules/pos/kitchenStation/kitchenStation.routes.js";
import uploadRouter from "@/modules/system/upload/upload.routes.js";

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
router.use("/pos-settings", posSettingsRouter);
router.use("/coupon", couponRouter);
router.use("/kitchen-station", kitchenStationRouter);
router.use("/upload", uploadRouter);

export default router;
