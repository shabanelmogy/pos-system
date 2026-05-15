import couponService from "./coupon.service.js";
import { createCouponSchema, updateCouponSchema, validateCouponQuerySchema } from "./coupon.validation.js";
import { fail, handleError } from "../../utils/errorHandler.js";

const couponController = {
  async getAll(req, res) {
    try {
      if (req.user.role !== "admin" && req.user.role !== "manager") fail("Unauthorized", 403);
      const coupons = await couponService.getAllCoupons();
      res.json({ success: true, data: coupons });
    } catch (error) {
      handleError(res, error, "couponController.getAll");
    }
  },

  async getById(req, res) {
    try {
      if (req.user.role !== "admin" && req.user.role !== "manager") fail("Unauthorized", 403);
      const coupon = await couponService.getCouponById(req.params.id);
      res.json({ success: true, data: coupon });
    } catch (error) {
      handleError(res, error, "couponController.getById");
    }
  },

  async create(req, res) {
    try {
      if (req.user.role !== "admin" && req.user.role !== "manager") fail("Unauthorized", 403);
      const validatedData = createCouponSchema.parse(req.body);
      const coupon = await couponService.createCoupon(validatedData);
      res.status(201).json({ success: true, message: "Coupon created successfully", data: coupon });
    } catch (error) {
      handleError(res, error, "couponController.create");
    }
  },

  async update(req, res) {
    try {
      if (req.user.role !== "admin" && req.user.role !== "manager") fail("Unauthorized", 403);
      const validatedData = updateCouponSchema.parse(req.body);
      const coupon = await couponService.updateCoupon(req.params.id, validatedData);
      res.json({ success: true, message: "Coupon updated successfully", data: coupon });
    } catch (error) {
      handleError(res, error, "couponController.update");
    }
  },

  async validate(req, res) {
    try {
      const { code, orderAmount } = validateCouponQuerySchema.parse(req.query);
      const coupon = await couponService.validateCoupon(code, orderAmount);
      res.json({ success: true, data: coupon });
    } catch (error) {
      handleError(res, error, "couponController.validate");
    }
  }
};

export default couponController;
