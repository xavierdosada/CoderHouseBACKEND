import { cartsRepository, productsRepository } from '../repositories/index.js'
import { ticketMongoMgr } from '../dao/mongo/ticket.mongo.js'
import { ticketProcess } from './ticket.controller.js'

const cart_repository = cartsRepository
const product_repository = productsRepository
const ticket_mgr = new ticketMongoMgr()

export const purchase = async (req, res) => {
    const { cid } = req.params
    const { email } = req.user.user
    const purchase_cart = await cart_repository.getCartsById(cid)
    
    if (purchase_cart.products.length === 0 || !purchase_cart.products){
        throw new Error({status: 'error', message: 'El carrito esta vacio'})
    }
    //Formateo el Proxy que devuelve mongo
    const cart_products = Object.values(purchase_cart.products)
    
    //creo el arreglo que va a actualizar todos los productos
    const productsToUpdate = [];

    // Itero a través de los productos en el carrito
    for (const prod of cart_products) {
        const product = await product_repository.getProductById(prod.product.id);

        if (!product) {
            productsToUpdate.push({id: product.id, status: 'No process', message: 'Producto no encontrado' });
            continue;
        }

        if (prod.quantity > product.stock) {
            productsToUpdate.push({id: product.id, status: 'No process', title: product.title ,message: 'No hay suficiente stock' });
            continue;
        }

        product.quantity = product.stock - prod.quantity
        productsToUpdate.push({id: product._id, status: 'success', newStock: product.quantity, amount: product.price, quantity: prod.quantity});
    }

    //Discrimino los productos procesados y los que no fueron procesados
    const successProducts = productsToUpdate.filter(prod => prod.status === 'success')
    if(successProducts.length === 0){
        throw new Error({status: 'error', message: 'Ningun articulo se pudo comprar, no hay stock o no existen'})
    }

    const noProcessProducts = productsToUpdate.filter(prod => prod.status === 'No process')
    
    for (const prod of successProducts) {
        try{
            //actualizo el stock y elimino del carrito de compras los productos que fueron comprados
            await product_repository.updateProduct(prod.id, {stock: prod.newStock})
            await cart_repository.deleteProductInCart(cid, prod.id)
        } catch(error){
            return new Error({error: error.message})
        }
    }
    
    //creación del ticket
    const newTicket = ticketProcess(email, successProducts)
    try {
        const successTicket = await ticket_mgr.createTicket(newTicket)
        res.status(200).send({status: 'success', message: 'La compra fue realizada con exito!', ticket: successTicket, noProcessProducts})
    } catch (error) {
        req.logger.error(error)
        return new Error({status: 'fail', error: error.message})
    }
    
    
}