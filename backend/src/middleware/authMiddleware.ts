import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: string;
    teacherId?: string;
    studentId?: string;
    departmentId?: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_sign_key_987654321_abcdef';

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token = '';

    // 1. Extract from headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // 2. Extract from cookies manually
    if (!token && req.headers.cookie) {
      const cookies = req.headers.cookie.split(';').reduce((acc: any, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {});
      token = cookies.token;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        teacher: true,
        student: true,
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User not found or inactive' });
    }

    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
      teacherId: user.teacher?.id,
      studentId: user.student?.id,
      departmentId: user.teacher?.departmentId || user.student?.departmentId || undefined,
    };

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const authorize = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Insufficient Permissions',
      });
    }
    next();
  };
};
