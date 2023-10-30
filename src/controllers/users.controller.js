import { userRepository } from '../repositories/index.js'
import userDTO from '../dao/dtos/user.dto.js'
import { sendEmail } from '../utils/sendEmails.js'
import { io } from '../app.js'

const user_repository = userRepository

export const getAll = async (req, res) => {
    try {
        const users = await user_repository.getAll()
        const users_dto = users.map(user => {
            return new userDTO(user._doc)
        })
        res.status(200).send({ payload: "successfully", users_dto })
    } catch (error) {
        res.status(400).send({ payload: "Error", error: error.message })
    }
}

export const getUserByEmail = async (req, res) => {
    try {
        const { email } = req.params
        const user = await user_repository.getUserByEmail(email)
        res.status(200).send({ payload: "successfully", user })
    } catch (error) {
        res.status(400).send({ payload: "Error", error: error.message })
    }
}

export const addCartToUser = async (req, res) => {
    try {
        const { id, email } = req
        if (!id || !email) throw new Error("id or email missing")

        const user = await user_repository.addCartToUser(id, email)
        res.status(200).send({ payload: "successfully", user })
    } catch (error) {
        res.status(400).send({ payload: "Error", error: error.message })
    }
}

export const updateUser = async (req, res) => {
    try {
        const { email, data } = req
        const result = await user_repository.updateUser(email, data)
        res.status(200).send({ payload: "successfully", result })
    } catch (error) {
        res.status(400).send({ payload: "Error", error: error.message })
    }
}

export const changeUserRole = async (req, res) => {
    try {
        const { uid } = req.params
        const user = await user_repository.getUserById(uid)
        const { email } = user._doc
        const { role } = user._doc
        let roleChangeTo = 'user'

        if (role === 'admin') return res.status(400).send({ payload: "Error", message: "No puede cambiar el rol de un admin" })
        if (role === 'user') {
            const requiredDocuments = ['id', 'adress', 'account state']
            const userDocuments = user.documents || []

            //check if user has all documents
            const hasAllDocuments = requiredDocuments.every(requiredDoc => {
                return userDocuments.some(userDocument => userDocument.name.includes(requiredDoc))
            })
            if (!hasAllDocuments) return res.status(400).send({ payload: "Error", message: "No tiene los documentos necesarios para cambiar de role a premium" })
            roleChangeTo = 'premium';
        }

        await user_repository.updateUser(email, { role: roleChangeTo })
        return res.status(200).send({ payload: "success", message: `El rol fue cambiado a ${roleChangeTo} correctamente.` })
    } catch (error) {
        return res.status(400).send({ payload: "Error", error: error.message })
    }
}

export const deleteUser = async (req, res) => {
    try {
        const { uid } = req.params
        if (!uid) res.status(400).send({ payload: "Error", message: "Es necesario un id para eliminar un usuario" })
        user_repository.deleteUser(uid)
        //renderizo de nuevo para que se actualize en timepo real mediante socket.io
        io.emit('adminBoard')
        res.status(204).send({ payload: "Success", message: "El usuario fue eliminado" })
    } catch (error) {
        res.status(400).send({ payload: "Error", error: error.message })
    }
}

export const deleteInactiveUsers = async (req, res) => {
    try {
        //Dos dias inactivo se elimina el usuario
        const today = new Date()
        today.setDate(today.getDate() - 2)
        const twoDaysBefore = today.toISOString();
        //Busco los usuarios que estan inactivos por más de 2 dias
        const inactiveUsers = await user_repository.getInactiveUsers(twoDaysBefore)
        if (!inactiveUsers) res.status(404).send({ payload: "Not Found", message: "No hay usuarios inactivos" })

        //elimino los usuarios
        const { acknowledged, deletedCount } = await user_repository.deleteInactiveUsers(twoDaysBefore)
        if (!acknowledged) res.status(400).send({ payload: "Error", message: "Hubo un error al intentar eliminar los usuarios inactivos" })

        //se envia los email a los usuarios eliminados
        inactiveUsers.map(user => {
            const { email } = user
            const subject = 'Cuenta Inactiva'
            const message = 'Su cuenta ha sido eliminada debido a inactividad.'
            sendEmail(email, subject, message)
        })

        res.status(200).send({ payload: "Success", message: `Se eliminaron ${deletedCount} usuarios inactivos` })
    } catch (error) {
        res.status(400).send({ payload: "Error", error: error.message })
    }
}



export const updateUserDocuments = async (req, res) => {
    try {
        const { uid } = req.params
        if (!uid) res.status(400).send({ payload: "Error", message: "Es necesario un id para subir documentos al usuario" })
        if (!req.files) res.status(400).send({ payload: "Error", message: "Se necesitan documentos para actualizar el usuario" })
        const user = await user_repository.updateUserDocuments(uid, req.files)
        res.status(200).send({ payload: "successfully", user })
    } catch (error) {
        res.status(400).send({ payload: "Error", error: error.message })
    }
}

//Middelwares

export const setLastConnection = async (req, res, next) => {
    const { email } = req.session.req.body
    await user_repository.setLastConnection(email)
    next();
}