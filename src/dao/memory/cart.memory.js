import fs from 'fs/promises'

export class CartMemoryMgr {
    constructor(path) {
        this.crtid = 0;
        this.path = path;
        this.carts = [];
    }

    async loadCart(){
        const json = await fs.readFile(this.path, 'utf-8');
        if (!json){
            await this.saveCart();
        } else {
            const carts = JSON.parse(json)
            if (carts.length > 0){
                this.carts = carts;
                this.crtid = this.carts[this.carts.length - 1].id;
            }
        }
    }
    
    async getCarts(){
        await this.loadCart();
        return this.carts;
    }

    async getCartsById(id){
        await this.loadCart();
        const findCart = this.carts.find(cart => cart.id === parseInt(id))
        if (!findCart){
            throw new Error("No se encontro un carrito con ese ID")
        }
        return findCart;
    }

    async newCart(){
        await this.loadCart();
        const newCart = 
        {
            id: ++this.crtid,
            product: []
        }
        this.carts.push(newCart)
        await this.saveCart();
        return ("Se creo un nuevo carrito")
    }

    async saveCart(){
        const json = JSON.stringify(this.carts, null, 2)
        await fs.writeFile(this.path, json)
    }

    newProduct(id){
        const newProduct = {
            id: id,
            quantity: 1
        }
        return newProduct;
    }

    async addProductToCart(cid, pid){
        await this.loadCart();
        const cartIndex = this.carts.findIndex(cart => cart.id === parseInt(cid))
        if (cartIndex === -1){
            throw new Error("No se encontro un carrito con ese ID")
        }
        const cart_prod = this.carts[cartIndex].product; //creo cart_prod para que quede mas legible
        const prodIndex = cart_prod.findIndex(prod => prod.id === parseInt(pid))
        if (prodIndex === -1){
            //Si no existe el producto, lo agrego al carrito
            const length = cart_prod.length
            const lastIdProduct = length > 0 ? cart_prod[length - 1].id : 0;

            cart_prod.push(this.newProduct(lastIdProduct+1))
            this.saveCart();
            return ("Producto agregado al carrito")
        }
        //Si existe, aumento su quantity +1
        cart_prod[prodIndex].quantity += 1;
        this.saveCart()
        return (`El producto con id: ${cart_prod[prodIndex].id} aumento su cantidad a ${cart_prod[prodIndex].quantity}` )
    }
}

