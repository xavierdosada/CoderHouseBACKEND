import cartsModel from '../models/carts.model.js'

export class CartMongoMgr {
    async getCarts(){
        try{
            const carts = await cartsModel.find().populate('products.product')
            return carts
        }catch (error){
            throw new Error(error.message)
        }
    }

    async getCartsById(id){
        try{
            const cart = await cartsModel.findOne({ _id: id}).populate('products.product')
            return cart
        }catch (error){
            throw new Error(error.message)
        }
    }

    async createCart(){
        try{
            const cartAdded = await cartsModel.create({ product: [] })
            return cartAdded
        }catch(error){
            throw new Error(error.message)
        }
    }

    async saveCart(cart){
        try {
            await cart.save();
        } catch(error){
            throw new Error(error.message)
        }
    }

    async updateQuantityProducts(cid, pid, quantity){
        try {
            const updateCart = await cartsModel.findByIdAndUpdate(
                cid, //En el carrito con este ID
                {$set: {'products.$[elem].quantity': quantity}}, //Actualizo el quantity
                {
                    arrayFilters: [{'elem.product': pid}], //arrayFilters es un filtro de mongo para saber que producto actualizar
                    new: true // Devuelve el carrito actualizado despues de la actualización
                }
            ).populate('products.product')

            return updateCart
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async deleteProductInCart(cid, pid){
        try {
            await cartsModel.findByIdAndUpdate( 
                cid, 
                {$pull: {products: {product: pid}}}, //Elimino el producto del carrito
                {new: true} // Devuelve el carrito actualizado despues de la eliminación
            )
            .populate('products.product')
            .exec()
            return 'success'
        } catch(error){
            throw new Error(error.message)
        }
    }

    async deleteAllProducts(cid){
        try {
            const emptyCart = await cartsModel.findByIdAndUpdate( 
                cid, {$set: {products: []}}, //Elimino todos los productos, seteando un arraglo vacio
                {new: true} // Devuelve el carrito actualizado despues de la eliminación
            ).populate('products.product')
            return emptyCart
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async deleteCart(id){
        try {
            await cartsModel.deleteOne({_id: id})
        } catch (error) {
            throw new Error(error.message)
        }
    }
}

