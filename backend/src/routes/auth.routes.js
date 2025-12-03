// Defines routes for authentication.
// Endpoints: POST /signup, POST /login, POST /logout.
// Connects to auth.controller.js for handling requests.

import express from 'express';
import { signup, login ,logout } from '../controllers/auth.controller.js';

const router = express.Router();
// POST /api/auth/signup → Create a new user account
router.post('/signup', signup);
// POST /api/auth/login → Authenticate user and return JWT
router.post('/login', login);

// POST /api/auth/logout → Log out user by clearing JWT cookie
router.post('/logout', logout);
export default router;
