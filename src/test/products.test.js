import chai from 'chai'
import supertest from 'supertest'
import { ProductMongoMgr } from '../dao/mongo/product.mongo.js'

const product_mgr = new ProductMongoMgr()
const expect = chai.expect
const requester = supertest(`http://localhost:8080`)

describe('Testing Router Products', () => {
    let session;

    before('login and set cookie', async () => {
        const mockUser = {
            email: "test123123@gmail.com",
            password: "barroPremium",
        }

        let loginRes;
        loginRes = await requester.post('/api/session/login').send(mockUser)
        session = loginRes.headers['set-cookie'][0].split(';')[0].split('=')[1]
    })

    it('GET /api/products -- Sin una cookie debe devolver Unathorized', async () => {
        const newProduct = {
            title: 'test',
            description: 'test1',
            price: 300,
            status: true,
            code: '273276872341',
            stock: 1000,
            category: 'postre',
            owner: { role: 'user', createdBy: 'boosi@bochi.com' }
        }

        const {statusCode, unauthorized} = await requester.post('/api/products').send(newProduct)
        expect(statusCode).to.equal(401)
        expect(unauthorized).to.equal(true)
    })

    it('GET /api/products -- Debe crear un nuevo producto', async () => {
        const newProduct = {
            title: 'test',
            description: 'test2',
            price: 300,
            status: true,
            code: '29832402341',
            stock: 1000,
            category: 'postre',
            owner: { role: 'user', createdBy: 'boosi@bochi.com' }
        }

        const { request, statusCode} = await requester.post('/api/products').set('Cookie',[`coderCookieToken=${session}`]).send(newProduct)
        expect(statusCode).to.be.eql(201)
        expect(request._data).to.have.property('title').that.is.an('string')
        expect(request._data).to.have.property('description').that.is.an('string')
        expect(request._data).to.have.property('price').that.is.an('number')
        expect(request._data).to.have.property('status').that.is.an('boolean')
        expect(request._data).to.have.property('code').that.is.an('string')
        expect(request._data).to.have.property('stock').that.is.an('number')
        expect(request._data).to.have.property('category').that.is.an('string')
        expect(request._data).to.have.property('owner').that.is.an('object')
        expect(request._data.owner).to.have.property('role').that.is.an('string')
        expect(request._data.owner).to.have.property('createdBy').that.is.an('string')
    })

    it('GET /api/products -- Al crear un producto debe crear la propiedad createdBy de owner automaticamente', async () => {
        const newProduct = {
            title: 'test',
            description: 'test2',
            price: 300,
            status: true,
            code: '29832402342',
            stock: 1000,
            category: 'postre',
            owner: { role: 'user' }
        }

        const result = await requester.post('/api/products').set('Cookie',[`coderCookieToken=${session}`]).send(newProduct)
        const { _body, statusCode } = result
        expect(statusCode).to.be.eql(201)
        expect(_body.status).to.be.eql('success')
        expect(_body.product).to.have.property('owner').that.is.an('object')
        expect(_body.product.owner).to.have.property('createdBy').that.is.an('string')
        expect(_body.product.owner).to.have.property('role').that.is.an('string')
        expect(_body.product).to.have.property('title').that.is.an('string')
        expect(_body.product).to.have.property('description').that.is.an('string')
        expect(_body.product).to.have.property('price').that.is.an('number')
        expect(_body.product).to.have.property('status').that.is.an('boolean')
        expect(_body.product).to.have.property('code').that.is.an('string')
        expect(_body.product).to.have.property('stock').that.is.an('number')
        expect(_body.product).to.have.property('category').that.is.an('string')
        
    })
    
    after('Delete product created', async () => {
        const productOne = await product_mgr.getProductByCode('29832402341')
        const productTwo = await product_mgr.getProductByCode('29832402342')
        await product_mgr.deleteProduct(productOne._id)
        await product_mgr.deleteProduct(productTwo._id)
    })
})