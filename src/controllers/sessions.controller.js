import userDTO from "../dao/dtos/user.dto.js"
import { productsRepository, userRepository } from "../repositories/index.js"

const product_repository = productsRepository
const users_repository = userRepository

export const register = async (req, res) => {
    res.status(201).send({ status: 'success', message: "The user has been registered", payload: req.body})
}

export const failRegister = async (req, res) => {
    res.status(400).send({ status: 'error', error: 'There was an error registering the user' })
}

export const login = async (req, res) => {
    if (!req.user) return res.status(400).send({ status: 'error', message: 'Invalid credentials' })
    res.cookie('coderCookieToken', req.user, { httpOnly: true }).send({ status: "success", message: "cookie set" })
}

export const failLogin = async (req, res) => {
    req.logger.error(error)
    res.status(401).send({ status: "error", error: 'failed Login', message: res.message })
}

export const github = async (req, res) => {
    
}

export const githubcallback = async (req, res) => {
    try {
        req.session.user = req.user
        res.cookie('coderCookieToken', req.user, { httpOnly: true })
        // req.logger.debug(req.session.user)
        res.redirect('/realtimeproducts')
    } catch (error) {
        req.logger.error(error)
        res.status(400).send({ status: 'error', error: error.message })
    }
}

export const logout = async (req, res) => {
    req.session.destroy(err => {
        if (!err){
            res.clearCookie('coderCookieToken')
            res.redirect('/api/session/login')
            return
        }

        req.logger.error(err)
        res.send({ status: 'Logout ERROR', body: err })
    })
}

export const current = async (req, res) => {
    const currentUser = new userDTO(req.user.user)
    res.status(200).send({currentUser: currentUser})
}

export const isOwnCart = async (req, res, next) => {
    const { cid, pid } = req.params
    //buscar el cart del usuario en la base de datos
    const { role, email } = req.user.user
    const user = await users_repository.getUserByEmail(email)

    if (!user._doc.cart){
        throw new Error("El usuario no tiene un carrito creado")
    }

    const cartId = user._doc.cart.toString()

    if(cartId !== cid){
        req.logger.warning('No tiene permisos')
        throw new Error("El producto no se puede agregar porque el carrito no es propio")
    }

    const product = await product_repository.getProductById(pid)

    if(role === 'premium' && product._doc.owner.createdBy !== email){
        req.logger.warning('No tiene permisos')
        throw new Error("No se pueden agregar productos propios al carrito")
    }

    next()
}

export const isOwnProduct = async (req, res) => {
    const { email } = req.user.user
    const { pid } = req.params
    if(!pid) res.status(400).send("Es necesario un product id")

    const prod = await product_repository.getProductById(pid)
    const owner_email = prod._doc.owner.createdBy
    if(email === owner_email){
        return true
    }
    req.logger.warning('No tiene permisos')
    res.status(400).send("El producto no se puede agregar porque el producto no es propio")
}   

//MIDDLEWARES
export const isAdmin = async (req, res, next) => {
    if(req.user.user.role === 'admin'){
        return next();
    }
    req.logger.warning('No es admin / sin permisos')
    res.status(403).send("No tienes permisos suficientes")
}

export const isPremium = async (req, res, next) => {
    if(req.user.user.role === 'premium'){
        return next();
    }
    req.logger.warning('No es premium / sin permisos')
    res.status(403).send("No tienes permisos suficientes")
}

export const isUser = async (req, res, next) => {
    if(req.user.user.role === 'user'){
        return next();
    }
    req.logger.warning('No es user / no tiene permisos de usuario')
    res.status(403).send("No tiene permisos de usuario para realizar esta acción")
}

export const isUserOrPremium = async (req, res, next) => {
    if(req.user.user.role === 'user' || req.user.user.role === 'premium'){
        return next();
    }
    req.logger.warning('No es user o premium / no tiene permisos de usuario')
    res.status(403).send("No tiene permisos de usuario para realizar esta acción")
}

export const isAdminOrPremium = async (req, res, next) => {
    if (req.user.user.role === 'admin'){
        return next()
    }

    if (req.user.user.role === 'premium'){
        if(await isOwnProduct(req, res)){
            return next()
        }
    }

    req.logger.warning('No tiene permisos')
    res.status(400).send("El producto no se puede eliminar porque el producto no es propio o no tiene suficientes permisos")
}