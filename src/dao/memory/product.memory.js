import fs from 'fs/promises'

export class ProductMemoryMgr {
    constructor(path) {
        //instancio el id en cero para luego incrementarlo por cada producto creado.
        this.id = 0;
        this.path = path;
        this.products = [];
    }

    async loadProducts(){
        const json = await fs.readFile(this.path, 'utf-8');
        //Si el archivo esta vacio le inserto un array vacio.
        if (!json) {
            await this.saveProducts();
        } else {
            const products = JSON.parse(json);
            if (products.length > 0){
                this.products = products;
                this.id = this.products[this.products.length - 1].id; //Tomo el ultimo id utilizado en el archivo y lo guardo.
            }
        }    
    }

    //Guardo el producto en el archivo
    async saveProducts(){
        const json = JSON.stringify(this.products, null, 2)
        await fs.writeFile(this.path, json)
    }

    async addProduct(newProduct){
        //Cargo los datos del archivo
        await this.loadProducts();
        const {title, description, code, price, status, stock, category, thumbails} = newProduct;
        //valido que no se repita el campo code y que todos los campos sean obligatorios
        if (title && description && code && price && status && stock && category){
            this.validateTypeof(title, description, code, price, status, stock, category);
            const existCode = this.products.some(product => product.code === code) // valido que el producto no exista
            if (existCode){
                throw new Error("Code ya existe");
            } else {
                //agrego al array vacio el nuevo producto con sus propiedades y id autogenerado.
                this.products.push({ id: ++this.id, title, description, price, thumbails, code, stock});
                await this.saveProducts(); //espero hasta que se guarde el producto
            }
        } else {
            throw new Error("Faltan campos");
        }  
    }

    async getProducts(){
        await this.loadProducts();
        return this.products;
    }

    async getProductById(id){
        await this.loadProducts();
        const productID = this.products.find(product => product.id === parseInt(id));
        if (productID){
            return productID;
        } else {
            throw new Error("Product Not Found")
        }
    }

    async updateProduct(id, data){
        await this.loadProducts();
        const indexID = this.products.findIndex(product => product.id === parseInt(id));
        if (indexID !== -1){
            this.products[indexID] = {
                ...this.products[indexID], //Mantengo las propiedades del producto anterior
                ...data //sobreescribo los datos con los nuevos datos.
            }
            await this.saveProducts();
            return ("Producto Actualizado")
        } else {
            throw new Error("Not Found")
        }
    }

    async deleteProduct(id){
        await this.loadProducts();
        const existID = this.products.findIndex(product => product.id === parseInt(id));
        if (existID !== -1){
            this.products.splice(existID, 1)
            await this.saveProducts()
            return ("Producto Eliminado")
        } else {
            throw new Error("Not Found")
        }
    }

    validateTypeof(title, description, code, price, status, stock, category){
        if ( 
            typeof title        !== "string" || 
            typeof description  !== "string" || 
            typeof code         !== "string" || 
            typeof category     !== "string"
        ){
            throw new Error("Verifique que title, description, code o category sean de tipo string")
        }
        if ( 
            typeof price !== "number" || 
            typeof stock !== "number"
        ){
            throw new Error("Verifique que price o stock sean de tipo number")
        }
        if ( typeof status !== "boolean"){
            this.products[indexID].status = true;
        }
    }
} 