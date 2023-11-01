import { Router } from "express"
import passport from "passport";
import cookieParser from "cookie-parser";
import { current, failLogin, failRegister, github, githubcallback, login, logout, register } from "../controllers/sessions.controller.js";
import { setLastConnection } from "../controllers/users.controller.js";

const router = Router();
router.use(cookieParser())

//REGISTER
router.post('/register', passport.authenticate('register', { failureRedirect: '/api/session/failregister' }), register)
router.get('/failregister', failRegister)

//LOGIN
router.post('/login', passport.authenticate('login', { session: false, failureRedirect: '/api/session/faillogin' }), setLastConnection, login)
router.get('/faillogin', failLogin)

//GITHUB LOGIN
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }), github);
router.get('/githubcallback', passport.authenticate('github', { failureRedirect: '/api/session/login' }), githubcallback)

//DELETE SESSION
router.get('/logout', passport.authenticate('current', { session: false }), setLastConnection, logout)

//CURRENT
router.get('/current', passport.authenticate('current', { session: false }), current)

export default router;
