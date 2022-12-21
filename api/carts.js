import fs from "fs";

export default class CartContainer{
    
    constructor(route){
        this.route = route;
    }
    
    async getAll(){
        try {
            const carts = await fs.promises.readFile(this.route, 'utf-8');
            return JSON.parse(carts)
        } catch (error) {
            console.error(error);
            return []
        }
    }

    async saveCart() {
        try {
            const carts = await this.getAll();
            if (carts.length === 0) {
                let products = []
                const cart = {
                    id: 1,
                    timestamp: this.setDate(),
                    products
                };
                await carts.push(cart);
                await fs.promises.writeFile(this.route, JSON.stringify(carts, null, 2));
                return cart
            } else {
                let lastCart = carts[carts.length - 1];
                let id = lastCart.id + 1
                let products = []
                const cart = {
                    id,
                    timestamp: this.setDate(),
                    products
                };
                await carts.push(cart);
                await fs.promises.writeFile(this.route, JSON.stringify(carts, null, 2));
                return cart
            }
        } catch (error) {
            throw new Error(error);
        }
    }

    async deleteById(id){
        try {
            const carts = await this.getAll();
            if (carts.length > 0) {
                const cart = carts.find(el => el.id == id);
                const newCarts = carts.filter(el => el != cart);
                await fs.promises.writeFile(this.route, JSON.stringify(newCarts, null, 2))
                return cart
            } else {
                console.log("No hay carritos agregados a la lista");
                return
            }
        } catch (error) {
            throw new Error(error);
        }
    }

    async getById(id){
        try {
            const carts = await this.getAll();
            if (carts.length > 0) {
                let cart = carts.find(el => el.id == id);
                return cart ? cart : null
            } else {
                console.log("No hay productos agregados a la lista");
                return
            }

        } catch (error) {
            throw new Error(error)
        }
    }

    async getProdsByCartId(id){
        try {
            const cart = await this.getById(id);
            if (cart) {
                if (cart.products.length > 0) {
                    return cart
                } else {
                    console.log("No hay productos agregados a la lista");
                    return
                }
            } else {
                console.log("No existe dicho carrito");
            }
        } catch (error) {
            throw new Error(error)
        }
    }

    async saveProdInCart(id, product) {
        try {
            const carts = await this.getAll();
            if (carts.length > 0) {
                let cart = carts.find(el => el.id == id)
                let i = cart.id - 1
                carts.splice(i, 1);
                cart.products.push(product);
                await fs.promises.writeFile(this.route, JSON.stringify(carts, null, 2));
                return cart ? cart : null
            } else {
                console.log("No existe el carrito o el producto");
                return
            }
        } catch (error) {
            throw new Error(error)
        }
    }

    async getProdInCart(cartId, productId) {
        try {
            const carts = await this.getAll();
            if (carts) {
                let cart = await this.getById(cartId);
                let product = cart.products.find(el => el.id == productId);
                return product ? product : null
            }
        } catch (error) {
            throw new Error(error)
        }
    }

    async deleteProdInCart(cartId, product) {
        try {
            const carts = await this.getAll();
            if (carts) {
                let cart = await this.getById(cartId);
                let cartIndex = carts.map(el => el.id).indexOf(cart.id);
                let productIndex = cart.products.map(el => el.id).indexOf(product.id)
                cart.products.splice(productIndex, 1);
                carts.splice(cartIndex, 1);
                carts.push(cart);
                carts.sort((a, b) => {
                    if (a.id > b.id) {
                        return 1;
                    }
                    if (a.id < b.id) {
                        return -1;
                    }
                    return 0;
                });
                await fs.promises.writeFile(this.route, JSON.stringify(carts, null, 2));
                return cart ? cart : null
            }
        } catch (error) {
            throw new Error(error)
        }
    }

    setDate() {
        let today = new Date();
        let minutes = today.getMinutes();
        if (minutes < 10) {
            minutes = `0${today.getMinutes()}`
        }
        let date = `${today.getFullYear()}-${(today.getMonth()+1)}-${today.getDate()} ${today.getHours()}:${minutes}`;
        return date
    }
}