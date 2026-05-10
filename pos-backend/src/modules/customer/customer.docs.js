export const customerDocs = {
  "/api/customer": {
    get: {
      tags: ["Customer"],
      summary: "Get all customers",
      responses: {
        200: { description: "Success" }
      }
    },
    post: {
      tags: ["Customer"],
      summary: "Create a new customer",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "phone"],
              properties: {
                name: { type: "string" },
                phone: { type: "string" },
                email: { type: "string" }
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
  "/api/customer/{id}": {
    get: {
      tags: ["Customer"],
      summary: "Get customer by ID",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: {
        200: { description: "Success" }
      }
    },
    put: {
      tags: ["Customer"],
      summary: "Update customer",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string" },
                phone: { type: "string" },
                email: { type: "string" }
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
