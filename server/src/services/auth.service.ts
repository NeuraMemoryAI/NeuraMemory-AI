import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { WithId } from 'mongodb';
import { env } from '../config/env.js';
import {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByApiKey,
  updateUserApiKey,
} from '../repositories/user.repository.js';
import { AuthPayload, AuthResponse, IUser } from '../types/auth.types.js';
import { AppError } from '../utils/AppError.js';

const SALT_ROUNDS = 12;
const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password.';

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(
  plainTextPassword: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(plainTextPassword, passwordHash);
}

function signAuthToken(payload: AuthPayload): string {
  const options: SignOptions = {};
  const expiresIn = env.JWT_EXPIRES_IN as SignOptions['expiresIn'];

  if (expiresIn !== undefined) {
    options.expiresIn = expiresIn;
  }

  return jwt.sign(payload, env.JWT_SECRET, options);
}

function buildAuthResponse(
  message: string,
  user: { id: string; email: string },
): AuthResponse {
  const token = signAuthToken({
    userId: user.id,
    email: user.email,
  });

  return {
    success: true,
    message,
    token,
    user,
  };
}

function maskEmail(email: string): string {
  const atIndex = email.indexOf('@');
  if (atIndex <= 0) return '[invalid-email]';
  const local = email.slice(0, atIndex);
  const domain = email.slice(atIndex);
  const masked = local.length <= 1 ? '*'.repeat(local.length) : `${local[0]}***`;
  return `${masked}${domain}`;
}

function logAuthError(
  operation: 'register' | 'login',
  email: string,
  err: unknown,
): void {
  const now = new Date().toISOString();
  const maskedEmail = maskEmail(email);

  if (err instanceof Error) {
    console.error(`[AuthService] ${operation} failed`, {
      operation,
      email: maskedEmail,
      reason: err.message,
      timestamp: now,
      stack: err.stack,
    });
    return;
  }

  console.error(`[AuthService] ${operation} failed`, {
    operation,
    email: maskedEmail,
    reason: 'Unknown error',
    timestamp: now,
    error: String(err),
  });
}

export async function registerService(
  email: string,
  password: string,
): Promise<AuthResponse> {
  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      throw new AppError(409, 'An account with this email already exists.');
    }

    const passwordHash = await hashPassword(password);
    const createdUser = await createUser(email, passwordHash);

    return buildAuthResponse('Account created successfully.', {
      id: createdUser._id.toString(),
      email: createdUser.email,
    });
  } catch (err) {
    logAuthError('register', email, err);
    throw err;
  }
}

export async function loginService(
  email: string,
  password: string,
): Promise<AuthResponse> {
  try {
    const existingUser = await findUserByEmail(email);
    if (!existingUser) {
      throw new AppError(401, INVALID_CREDENTIALS_MESSAGE);
    }

    const isPasswordValid = await verifyPassword(
      password,
      existingUser.passwordHash,
    );
    if (!isPasswordValid) {
      throw new AppError(401, INVALID_CREDENTIALS_MESSAGE);
    }

    return buildAuthResponse('Login successful.', {
      id: existingUser._id.toString(),
      email: existingUser.email,
    });
  } catch (err) {
    logAuthError('login', email, err);
    throw err;
  }
}

export async function generateApiService(userId: string): Promise<{ apiKey: string }> {
  const apiKey = `nm_${crypto.randomBytes(32).toString('hex')}`;
  
  await updateUserApiKey(userId, apiKey);

  return { apiKey };
}

/**
 * Retrieves a user by their MongoDB ObjectId string.
 *
 * @param userId - The user's MongoDB ObjectId as a string
 * @returns The user document, or `null` if not found
 * @throws {AppError} 500 if the database query fails unexpectedly
 */
export async function getUserById(userId: string): Promise<WithId<IUser> | null> {
  return findUserById(userId);
}

/**
 * Retrieves a user by their API key.
 *
 * @param apiKey - The API key to look up
 * @returns The user document, or `null` if no user has this key
 * @throws {AppError} 500 if the database query fails unexpectedly
 */
export async function getUserByApiKey(apiKey: string): Promise<WithId<IUser> | null> {
  return findUserByApiKey(apiKey);
}
