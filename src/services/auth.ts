import "dotenv/config";
const bcrypt = require("bcrypt");
import jwt from "jsonwebtoken";

class AuthService {
  async hashPassword(password: string) {
    try {
      return await bcrypt.hash(password, +process.env.SALT_ROUNDS!);
    } catch (error) {
      console.error(error);
      throw new Error("There was an error hashing the password");
    }
  }

  async passwordsMatch(password: string, hash: string) {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      throw new Error("There was an error comparing the passwords");
    }
  }

  createAuthToken(payload: Record<string, any>) {
    try {
      return jwt.sign(payload, process.env.JWT_SECRET!, {
        expiresIn: process.env.JWT_EXPIRES_IN!,
      });
    } catch (error) {
      console.error(error);
      throw new Error("There was an error creating the JWT");
    }
  }
}

export default new AuthService();
