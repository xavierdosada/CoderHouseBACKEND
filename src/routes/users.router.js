import { Router } from "express";
import passport from "passport";
import { changeUserRole, deleteUser, getUserByEmail, updateUserDocuments, getAll, deleteInactiveUsers } from "../controllers/users.controller.js";
import { isAdmin } from '../controllers/sessions.controller.js'
import uploader from "../utils/multer.js";

const router = Router();

router.get('/', getAll)
router.get('/:email', getUserByEmail)
router.put('/premium/:uid', passport.authenticate('current', { session: false }), isAdmin, changeUserRole)
router.post('/:uid/documents', uploader.array('documents'), updateUserDocuments)
router.delete('/delete/:uid', passport.authenticate('current', { session: false }), deleteUser)
router.delete('/deleteInactiveUsers', passport.authenticate('current', { session: false }), isAdmin, deleteInactiveUsers)

export default router;