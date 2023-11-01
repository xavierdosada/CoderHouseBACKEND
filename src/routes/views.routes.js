import { Router } from 'express'
import passport from "passport";
import { isUser, isAdmin } from "../controllers/sessions.controller.js";
import { 
    productsView, 
    productByIdView, 
    loginView, 
    realTimeProducts, 
    registerView, 
    privateAccess, 
    chat, 
    adminDashboard, 
    myCart 
} from '../controllers/views.controller.js';

const router = Router();

router.get('/products', privateAccess, productsView)
router.get('/products/:pid', productByIdView)
router.get('/realtimeproducts', passport.authenticate('current', { session: false }), realTimeProducts)
router.get('/myCart/:cid', myCart)
router.get('/api/session/register', registerView)
router.get('/api/session/login', loginView)
router.get('/api/admin-dashboard',  passport.authenticate('current', { session: false }), privateAccess, isAdmin, adminDashboard)
router.get('/chat', passport.authenticate('current', { session: false }), privateAccess, isUser, chat)

export default router;