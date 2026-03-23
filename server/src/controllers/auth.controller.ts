import { NextFunction, Request, Response } from 'express';
import {
  loginService,
  registerService,
  generateApiService,
  getUserById,
} from '../services/auth.service.js';
import { loginSchema, registerSchema } from '../validations/auth.validation.js';
import { AppError } from '../utils/AppError.js';

/**
 * @module auth.controller
 * HTTP request handlers for authentication endpoints.
 * Delegates all business logic to `auth.service.ts`.
 */

const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export async function loginController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      throw new AppError(
        400,
        result.error.errors[0]?.message ?? 'Invalid input.',
      );
    }

    const { email, password } = result.data;
    const response = await loginService(email, password);

    res.cookie('authorization', response.token, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000,
    });

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function registerController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      throw new AppError(
        400,
        result.error.errors[0]?.message ?? 'Invalid input.',
      );
    }

    const { email, password } = result.data;
    const response = await registerService(email, password);

    res.cookie('authorization', response.token, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE_MS,
    });

    const { token: _token, ...safeResponse } = response;
    res.status(201).json(safeResponse);
  } catch (err) {
    next(err);
  }
}

export async function generateApiKeyController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const response = await generateApiService(userId);

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (err) {
    next(err);
  }
}

export async function logoutController(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    res.clearCookie('authorization', {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'lax',
    });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}

export async function meController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const user = await getUserById(userId);
    if (!user) {
      throw new AppError(404, 'User not found.');
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id.toString(),
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function profileController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError(401, 'Authentication required.');

    const user = await getUserById(userId);
    if (!user) throw new AppError(404, 'User not found.');

    res.status(200).json({
      success: true,
      data: { email: user.email, createdAt: user.createdAt },
    });
  } catch (err) {
    next(err);
  }
}
