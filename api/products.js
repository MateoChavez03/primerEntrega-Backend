import fs from "fs";

export default class ProductContainer{

    constructor(route){
        this.route = route;
    }

    async getAll(){
        try {
            const products = await fs.promises.readFile(this.route, 'utf-8');
            return JSON.parse(products)
        } catch (error) {
            console.error(error);
            return []
        }
    }

    async update(product, id){
        try {
            const products = await this.getAll();
            let oldProduct = products.find(element => element.id == id);
            const i = products.indexOf(oldProduct);
            if (i > 0) {
                product.id = products[i].id;
                products[i] = product;
                product.timestamp = this.setDate()
                await fs.promises.writeFile(this.route, JSON.stringify(products, null, 2));
                return [product, oldProduct]
            } else {
                console.log('Not found');
                return []
            }
        } catch (error) {
            console.error(error);
            return []
        }
    }

    async saveProduct(product) {
        try {
            const products = await this.getAll();
            if (products.length === 0) {
                product.id = 1;
                product.timestamp = this.setDate()
                products.push(product);
                await fs.promises.writeFile(
                this.route,
                JSON.stringify(products, null, 2)
                );
                return product
            } else {
                let lastProduct = products[products.length - 1];
                product.id = lastProduct.id + 1;
                product.timestamp = this.setDate()
                products.push(product);
                await fs.promises.writeFile(
                this.route,
                JSON.stringify(products, null, 2)
                );
                return product
            }
        } catch (error) {
            throw new Error(error);
        }
    }

    async getById(id){
        try {
            const products = await this.getAll();
            if (products.length > 0) {
                let product = products.find(el => el.id == id);
                return product ? product : null
            } else {
                console.log("No hay productos agregados a la lista");
                return
            }

        } catch (error) {
            throw new Error(error)
        }
    }

    async deleteById(id){
        try {
            const products = await this.getAll();
            if (products.length > 0) {
                const product = products.find(el => el.id == id);
                const newProducts = products.filter(el => el != product);
                await fs.promises.writeFile(this.route, JSON.stringify(newProducts, null, 2))
                return product
            } else {
                console.log("No hay productos agregados a la lista");
                return
            }
        } catch (error) {
            throw new Error(error);
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
