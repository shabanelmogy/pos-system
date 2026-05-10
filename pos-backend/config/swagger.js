import swaggerJsdoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Restaurant POS API",
    version: "1.0.0",
    description: "API documentation for the Restaurant POS backend.",
  },
  servers: [
    {
      url: "/",
      description: "Current server",
    },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "accessToken",
      },
    },
    schemas: {
      ApiResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Request completed successfully" },
          data: { type: "object" },
        },
      },
      RegisterRequest: {
        type: "object",
        required: ["name", "phone", "email", "password", "role"],
        properties: {
          name: { type: "string", example: "Admin" },
          phone: { type: "number", example: 9999999999 },
          email: { type: "string", format: "email", example: "admin@example.com" },
          password: { type: "string", example: "password123" },
          role: { type: "string", example: "Admin" },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "admin@example.com" },
          password: { type: "string", example: "password123" },
        },
      },
      TableRequest: {
        type: "object",
        required: ["tableNo", "seats"],
        properties: {
          tableNo: { type: "number", example: 1 },
          seats: { type: "number", example: 4 },
        },
      },
      UpdateTableRequest: {
        type: "object",
        properties: {
          status: { type: "string", example: "Booked" },
          orderId: { type: "string", example: "65f1d6f1d6f1d6f1d6f1d6f1" },
        },
      },
      OrderRequest: {
        type: "object",
        required: ["customerDetails", "orderStatus", "bills", "items"],
        properties: {
          customerDetails: {
            type: "object",
            properties: {
              name: { type: "string", example: "John Doe" },
              phone: { type: "string", example: "9999999999" },
              guests: { type: "number", example: 2 },
            },
          },
          orderStatus: { type: "string", example: "In Progress" },
          bills: {
            type: "object",
            properties: {
              total: { type: "number", example: 500 },
              tax: { type: "number", example: 25 },
              totalWithTax: { type: "number", example: 525 },
            },
          },
          items: {
            type: "array",
            items: { type: "object" },
          },
          table: { type: "string", example: "65f1d6f1d6f1d6f1d6f1d6f1" },
          paymentMethod: { type: "string", example: "Cash" },
        },
      },
      UpdateOrderRequest: {
        type: "object",
        required: ["orderStatus"],
        properties: {
          orderStatus: { type: "string", example: "Completed" },
        },
      },
      CreatePaymentOrderRequest: {
        type: "object",
        required: ["amount"],
        properties: {
          amount: { type: "number", example: 525 },
        },
      },
      VerifyPaymentRequest: {
        type: "object",
        required: ["razorpay_order_id", "razorpay_payment_id", "razorpay_signature"],
        properties: {
          razorpay_order_id: { type: "string" },
          razorpay_payment_id: { type: "string" },
          razorpay_signature: { type: "string" },
        },
      },
    },
  },
};

const options = {
  definition: swaggerDefinition,
  apis: ["./src/modules/**/*.docs.js"],
};

export default swaggerJsdoc(options);
