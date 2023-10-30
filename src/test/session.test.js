import mongoose from 'mongoose'
import env from '../config/config.js'
import chai from 'chai'
import supertest from 'supertest'
import { UserMongoMgr } from '../dao/mongo/user.mongo.js'

const user_mgr = new UserMongoMgr()
const expect = chai.expect
const requester = supertest(`http://localhost:8080`)

mongoose.connect(env.MONGO_URL_TESTING)

describe('Testing Router Session', () => {
    it('POST /api/session/login -- Redireccionado a faillogin si user/pass son incorrectos', async () => {
        const mockUser = {
            email: "asdp123421111nlf@gmail.com",
            password: "12134321d",
        }

        const { statusCode, redirect, text} = await requester.post('/api/session/login').send(mockUser)
        expect(statusCode).to.equal(302)
        expect(redirect).to.equal(true)
        expect(text).to.contain('Redirecting').and.to.contain('/api/session/faillogin')
    })

    it('POST /api/session/register -- Debe crear/registrar un usuario', async () => {
        const mockUser = {
            first_name: "Xavi",
            last_name: "Dosada",
            email: "testing@gmail.com",
            dob: "11/11/2023",
            password: "123asd",
            role: "admin"
        }

        const { body, statusCode } = await requester.post('/api/session/register').send(mockUser)
        expect(statusCode).to.equal(201)
        expect(body).to.have.property('status', 'success')
        expect(body).to.have.property('payload')
    })

    it('POST /api/session/login -- Debe loguear el usuario rol: admin', async () => {
        const mockUser = {
            email: "testing@gmail.com",
            password: "123asd",
        }

        const { body, statusCode } = await requester.post('/api/session/login').send(mockUser)
        expect(statusCode).to.equal(200)
        expect(body).to.have.property('status', 'success')
    })

    after( async () => {
        const user = await user_mgr.getUserByEmail('testing@gmail.com')
        await user_mgr.deleteUser(user._id)
    })
})
