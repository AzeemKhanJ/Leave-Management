import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repository/userRepository';
import { AuditLogRepository } from '../repository/auditLogRepository';
import { logger } from '../config/logger';

import { Secret, SignOptions } from "jsonwebtoken";

const JWT_SECRET: Secret =
  process.env.JWT_SECRET ?? "super_secret_jwt_sign_key_987654321_abcdef";

const JWT_EXPIRES_IN: SignOptions["expiresIn"] =
  (process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"]) ?? "7d";

export class AuthService {
  static async login(username: string, password: string, ip?: string, userAgent?: string) {
    const user = await UserRepository.findByUsername(username);
    if (!user || !user.isActive) {
      logger.warn(`Failed login attempt for username: ${username}`);
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      logger.warn(`Failed login attempt (incorrect password) for username: ${username}`);
      throw new Error('Invalid credentials');
    }

    // Fetch profile info to return
    const fullUser = await UserRepository.findById(user.id);

    const token = jwt.sign(
  {
    id: user.id,
    username: user.username,
    role: user.role,
  },
  JWT_SECRET,
  {
    expiresIn: JWT_EXPIRES_IN,
  }
);

    // Audit Log
    await AuditLogRepository.log({
      userId: user.id,
      username: user.username,
      role: user.role,
      actionType: 'LOGIN',
      description: `User ${user.username} logged in successfully.`,
      ipAddress: ip,
      userAgent: userAgent,
    });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        profile: fullUser?.teacher || fullUser?.student || null,
      },
    };
  }

  static async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await UserRepository.findById(userId);
    if (!user) throw new Error('User not found');

    const isMatch = await bcrypt.compare(currentPass, user.passwordHash);
    if (!isMatch) throw new Error('Incorrect current password');

    const passwordHash = await bcrypt.hash(newPass, 10);
    await UserRepository.resetPassword(userId, passwordHash);

    await AuditLogRepository.log({
      userId: user.id,
      username: user.username,
      role: user.role,
      actionType: 'USER_ACTIVITY',
      description: `User ${user.username} changed their password.`,
    });
  }
}
