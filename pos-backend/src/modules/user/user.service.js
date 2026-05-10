import userRepository from "./user.repository.js";
import bcrypt from "bcryptjs";
import { fail } from "../../utils/errorHandler.js";

const userService = {
  async registerUser(userData) {
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      fail("User with this email already exists", 409);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    return await userRepository.create({
      ...userData,
      password: hashedPassword,
    });
  },

  async loginUser(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      fail("Invalid email or password", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      fail("Invalid email or password", 401);
    }

    return user;
  },

  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      fail("User not found", 404);
    }
    return user;
  }
};

export default userService;
