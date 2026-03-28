import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, AuthSession } from '@/types';
import { findUserByEmail } from './data-store';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateToken = (user: User): string => {
  const payload: AuthSession = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    departmentId: user.departmentId,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

export const verifyToken = (token: string): AuthSession | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthSession;
  } catch (error) {
    return null;
  }
};

export const authenticateUser = async (email: string, password: string): Promise<User | null> => {
  const user = findUserByEmail(email);
  if (!user) {
    return null;
  }
  
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    return null;
  }
  
  return user;
};
