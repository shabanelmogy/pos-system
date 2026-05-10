export const billDocs = {
  "/api/bill": {
    get: {
      tags: ["Bill"],
      summary: "Get all bills",
      responses: {
        200: { description: "Success" }
      }
    },
    post: {
      tags: ["Bill"],
      summary: "Create a new bill for an order",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["orderId", "totalAmount", "taxAmount"],
              properties: {
                orderId: { type: "string", format: "uuid" },
                totalAmount: { type: "number" },
                taxAmount: { type: "number" },
                discountAmount: { type: "number" },
                status: { type: "string", enum: ["Paid", "Unpaid"] }
              }
            }
          }
        }
      },
      responses: {
        201: { description: "Created" }
      }
    }
  },
  "/api/bill/order/{orderId}": {
    get: {
      tags: ["Bill"],
      summary: "Get bill by Order ID",
      parameters: [{ name: "orderId", in: "path", required: true, schema: { type: "string" } }],
      responses: {
        200: { description: "Success" }
      }
    }
  },
  "/api/bill/status/{id}": {
    patch: {
      tags: ["Bill"],
      summary: "Update bill payment status",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["status"],
              properties: {
                status: { type: "string", enum: ["Paid", "Partially Paid", "Unpaid"] }
              }
            }
          }
        }
      },
      responses: {
        200: { description: "Success" }
      }
    }
  }
};
