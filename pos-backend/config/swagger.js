const swaggerJsdoc = require("swagger-jsdoc");

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Restaurant POS API",
    version: "1.0.0",
    description: "API documentation for the Restaurant POS backend.",
  },
  servers: [
    {
      url: "http://localhost:8000",
      description: "Local development server",
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
  paths: {
    "/": {
      get: {
        summary: "Health check",
        tags: ["Health"],
        responses: {
          200: { description: "Server is running" },
        },
      },
    },
    "/api/user/register": {
      post: {
        summary: "Register a user",
        tags: ["User"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
            },
          },
        },
        responses: {
          201: { description: "User created" },
          400: { description: "Invalid request" },
        },
      },
    },
    "/api/user/login": {
      post: {
        summary: "Login user",
        tags: ["User"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          200: { description: "Login successful and accessToken cookie set" },
          401: { description: "Invalid credentials" },
        },
      },
    },
    "/api/user/logout": {
      post: {
        summary: "Logout user",
        tags: ["User"],
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: "Logout successful" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/user": {
      get: {
        summary: "Get current user",
        tags: ["User"],
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: "Current user data" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/table": {
      get: {
        summary: "Get tables",
        tags: ["Table"],
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: "List of tables" },
          401: { description: "Unauthorized" },
        },
      },
      post: {
        summary: "Create table",
        tags: ["Table"],
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TableRequest" },
            },
          },
        },
        responses: {
          201: { description: "Table created" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/table/{id}": {
      put: {
        summary: "Update table",
        tags: ["Table"],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateTableRequest" },
            },
          },
        },
        responses: {
          200: { description: "Table updated" },
          401: { description: "Unauthorized" },
          404: { description: "Table not found" },
        },
      },
    },
    "/api/order": {
      get: {
        summary: "Get orders",
        tags: ["Order"],
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: "List of orders" },
          401: { description: "Unauthorized" },
        },
      },
      post: {
        summary: "Create order",
        tags: ["Order"],
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/OrderRequest" },
            },
          },
        },
        responses: {
          201: { description: "Order created" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/order/{id}": {
      get: {
        summary: "Get order by id",
        tags: ["Order"],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Order data" },
          401: { description: "Unauthorized" },
          404: { description: "Order not found" },
        },
      },
      put: {
        summary: "Update order status",
        tags: ["Order"],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateOrderRequest" },
            },
          },
        },
        responses: {
          200: { description: "Order updated" },
          401: { description: "Unauthorized" },
          404: { description: "Order not found" },
        },
      },
    },
    "/api/payment/create-order": {
      post: {
        summary: "Create Razorpay order",
        tags: ["Payment"],
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreatePaymentOrderRequest" },
            },
          },
        },
        responses: {
          200: { description: "Razorpay order created" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/payment/verify-payment": {
      post: {
        summary: "Verify Razorpay payment",
        tags: ["Payment"],
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/VerifyPaymentRequest" },
            },
          },
        },
        responses: {
          200: { description: "Payment verified" },
          400: { description: "Payment verification failed" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/payment/webhook-verification": {
      post: {
        summary: "Razorpay webhook verification",
        tags: ["Payment"],
        responses: {
          200: { description: "Webhook verified" },
          400: { description: "Invalid signature" },
        },
      },
    },
  },
};

const options = {
  definition: swaggerDefinition,
  apis: [],
};

module.exports = swaggerJsdoc(options);
