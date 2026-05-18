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
      BranchRequest: {
        type: "object",
        required: ["name", "code"],
        properties: {
          name: { type: "string", example: "Cairo Main Branch" },
          code: { type: "string", example: "BR-CAIRO-01" },
          phone: { type: "string", example: "+20123456789" },
          email: { type: "string", format: "email" },
          address: { type: "string" },
          city: { type: "string" },
        },
      },
      POSPointRequest: {
        type: "object",
        required: ["branchId", "name", "code"],
        properties: {
          branchId: { type: "string", format: "uuid" },
          name: { type: "string", example: "Counter 1" },
          code: { type: "string", example: "POS-BR1-01" },
          isActive: { type: "boolean", default: true },
        },
      },
      CategoryRequest: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", example: "Main Course" },
          images: { type: "array", items: { type: "string" } },
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
      POSSettingsRequest: {
        type: "object",
        properties: {
          autoPrintReceipt: { type: "boolean" },
          allowDiscounts: { type: "boolean" },
          enableTables: { type: "boolean" },
          requireCustomerOnOrder: { type: "boolean" },
          openOnMenu: { type: "boolean" },
          directPrint: { type: "boolean" },
          receiptPrinterName: { type: "string" },
          kitchenPrinterName: { type: "string" },
        },
      },
      OpenShiftRequest: {
        type: "object",
        required: ["branchId", "posPointId", "cashierId", "openingBalance"],
        properties: {
          branchId: { type: "string", format: "uuid" },
          posPointId: { type: "string", format: "uuid" },
          cashierId: { type: "string", format: "uuid" },
          openingBalance: { type: "number", example: 100 },
        },
      },
      CloseShiftRequest: {
        type: "object",
        required: ["closingBalance"],
        properties: {
          closingBalance: { type: "number", example: 1500 },
          notes: { type: "string", example: "Shift ended normally" },
        },
      },
      Bill: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid", description: "The unique primary key UUID of the bill", example: "b1111111-1111-1111-1111-111111111111" },
          orderId: { type: "string", format: "uuid", description: "The associated order UUID for this bill", example: "o2222222-2222-2222-2222-222222222222" },
          billNo: { type: "string", description: "Unique auto-generated sequential bill number", example: "BILL-2026-0001" },
          totalAmount: { type: "number", description: "Gross sum amount of all items in the order", example: 150.00 },
          taxAmount: { type: "number", description: "Calculated tax value applied to the bill", example: 15.00 },
          discountAmount: { type: "number", description: "Total discount deductions applied to the bill", example: 10.00 },
          payableAmount: { type: "number", description: "Net amount payable by the customer after tax and discounts", example: 155.00 },
          status: { type: "string", enum: ["Paid", "Partially Paid", "Unpaid"], description: "Current payment status of the bill", example: "Unpaid" },
          createdAt: { type: "string", format: "date-time", description: "Timestamp when the bill was generated", example: "2026-05-18T10:52:51.000Z" },
          updatedAt: { type: "string", format: "date-time", description: "Timestamp when the bill was last modified", example: "2026-05-18T10:52:51.000Z" },
        },
      },
      Category: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid", description: "The unique primary key UUID of the category", example: "c3333333-3333-3333-3333-333333333333" },
          name: { type: "string", description: "Unique display name of the food/drink category", example: "Main Course" },
          images: { type: "array", items: { type: "string" }, description: "Array of display image URLs for this category", example: ["https://example.com/images/pasta.jpg"] },
          kitchenStationId: { type: "string", format: "uuid", description: "Associated KDS kitchen station UUID for order routing", example: "k4444444-4444-4444-4444-444444444444" },
          createdAt: { type: "string", format: "date-time", description: "Timestamp when the category was created", example: "2026-05-18T10:52:51.000Z" },
          updatedAt: { type: "string", format: "date-time", description: "Timestamp when the category was last updated", example: "2026-05-18T10:52:51.000Z" },
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
