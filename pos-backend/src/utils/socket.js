import { Server } from "socket.io";
import orderEventEmitter, { ORDER_EVENTS } from "./events.js";
import logger from "./logger.js";

let io;

export const initSocket = (server, corsOptions) => {
  io = new Server(server, {
    cors: corsOptions,
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    logger.info(`New client connected: ${socket.id}`);

    socket.on("join_branch", (branchId) => {
      socket.join(`branch_${branchId}`);
      logger.info(`Client ${socket.id} joined branch: ${branchId}`);
    });

    socket.on("disconnect", () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });

  // Listen to internal events and broadcast to relevant branch rooms
  Object.values(ORDER_EVENTS).forEach((event) => {
    orderEventEmitter.on(event, ({ order, context }) => {
      const branchId = order?.branchId || context?.branchId;
      if (branchId) {
        logger.info(`Broadcasting event ${event} to branch_${branchId}`);
        io.to(`branch_${branchId}`).emit("order_update", { event, order });
      } else {
        logger.info(`Broadcasting event ${event} to all`);
        io.emit("order_update", { event, order });
      }
    });
  });

  // Also listen for table status changes
  orderEventEmitter.on("table_updated", ({ table, branchId }) => {
    if (branchId) {
      logger.info(`Broadcasting table_updated to branch_${branchId}`);
      io.to(`branch_${branchId}`).emit("table_update", { table });
    } else {
      logger.info(`Broadcasting table_updated to all`);
      io.emit("table_update", { table });
    }
  });

  return io;
};

export const getIo = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};
