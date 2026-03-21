import { Router } from 'express';
import {
  loginController,
  logoutController,
  meController,
  registerController,
  generateApiKeyController
} from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth/requireAuth.js';
<<<<<<< HEAD


const router = Router();

router.post('/login', loginController);
router.post('/register', registerController);
router.post('/api-key', requireAuth, generateApiKeyController);
=======
import { loginRateLimiter, registerRateLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.post('/login', loginRateLimiter, loginController);
router.post('/register', registerRateLimiter, registerController);
router.post('/logout', logoutController);
router.get('/me', requireAuth, meController);
>>>>>>> 7b871ab7a0ccfbae50d889410ef276c02fe4f7b0

export default router;
