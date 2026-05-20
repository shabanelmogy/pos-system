import { Request, Response } from "express";
import couponService from "./coupon.service.js";
import { createCouponSchema, updateCouponSchema, validateCouponQuerySchema } from "./coupon.validation.js";
import { fail, handleError } from "../../../utils/errorHandler.js";

const couponController = {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || (req.user.role !== "admin" && req.user.role !== "manager")) {
        fail("Unauthorized", 403);
      }
      const coupons = await couponService.getAllCoupons();
      res.json({ success: true, data: coupons });
    } catch (error) {
      handleError(res, error as any, "couponController.getAll");
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || (req.user.role !== "admin" && req.user.role !== "manager")) {
        fail("Unauthorized", 403);
      }
      const id = req.params.id as string;
      const coupon = await couponService.getCouponById(id);
      res.json({ success: true, data: coupon });
    } catch (error) {
      handleError(res, error as any, "couponController.getById");
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || (req.user.role !== "admin" && req.user.role !== "manager")) {
        fail("Unauthorized", 403);
      }
      const validatedData = createCouponSchema.parse(req.body);
      const coupon = await couponService.createCoupon(validatedData as any);
      res.status(201).json({ success: true, message: req.t("coupon.created"), data: coupon });
    } catch (error) {
      handleError(res, error as any, "couponController.create");
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || (req.user.role !== "admin" && req.user.role !== "manager")) {
        fail("Unauthorized", 403);
      }
      const id = req.params.id as string;
      const validatedData = updateCouponSchema.parse(req.body);
      const coupon = await couponService.updateCoupon(id, validatedData as any);
      res.json({ success: true, message: req.t("coupon.updated"), data: coupon });
    } catch (error) {
      handleError(res, error as any, "couponController.update");
    }
  },

  async validate(req: Request, res: Response): Promise<void> {
    try {
      const { code, orderAmount } = validateCouponQuerySchema.parse(req.query);
      const coupon = await couponService.validateCoupon(code, orderAmount);
      res.json({ success: true, data: coupon });
    } catch (error) {
      handleError(res, error as any, "couponController.validate");
    }
  }
};

export default couponController;
