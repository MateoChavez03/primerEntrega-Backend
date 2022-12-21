// Imports
import express from 'express';
import ProductContainer from '../api/products.js';
import CartContainer from '../api/carts.js';

const { Router } = express;

// Data
const products = new ProductContainer('./assets/products.json');
const carts = new CartContainer('./assets/carts.json');

// Admin
const isAdmin = true

const adminOnly = async (req, res, next) => {
    if (!isAdmin) {
        res.json({error: -1, description: "Ruta no autorizada para usuarios sin permisos de administrador"})
    } else {
        next()
    }
}

// Route Not Found

const notFound = new Router();
notFound.use(express.json());
notFound.use(express.urlencoded({extended: true}));

notFound.get('*', async (req, res)=>{
    res.json({error: -2, description: "Metodo no implementado en dicha ruta"})
});

notFound.post('*', async (req, res)=>{
    res.json({error: -2, description: "Metodo no implementado en dicha ruta"})
});

notFound.delete('*', async (req, res)=>{
    res.json({error: -2, description: "Metodo no implementado en dicha ruta"})
});

notFound.put('*', async (req, res)=>{
    res.json({error: -2, description: "Metodo no implementado en dicha ruta"})
});

// Products Router
const productsRouter = new Router();
productsRouter.use(express.json());
productsRouter.use(express.urlencoded({extended: true}));

productsRouter.get('/', async (req, res)=>{
    const productsArr = await products.getAll();
    productsArr.length > 0 ? res.json(productsArr) : res.sendStatus(400);
});

productsRouter.get('/:id', async (req, res)=> {
    const product = await products.getById(req.params.id);
    product ? res.json(product) : res.sendStatus(404);
});

productsRouter.post('/', adminOnly, async (req, res) => {
    let product = req.body;
    if(product){
        product = await products.saveProduct(product);
        res.json(product);
    }
    else{
        res.sendStatus(400);
    };
})

productsRouter.delete('/:id', adminOnly, async (req, res) => {
    const product = req.params.id;
    try {
        let deleted = await products.deleteById(product)
        res.json(deleted)
    } catch (error) {
        throw new Error(error);
    }
})

productsRouter.put('/:id', adminOnly, async (req, res) => {
    const result = await products.update(req.body, req.params.id);
    if(result.length > 0){
        res.send(`
        Product: ${JSON.stringify(result[1])}\n
        replaced for: ${JSON.stringify(result[0])}
        `);
    }
    else{
        res.sendStatus(400);
    }
})

// Carts Router
const cartsRouter = new Router();
cartsRouter.use(express.json());
cartsRouter.use(express.urlencoded({extended: true}));

cartsRouter.post('/', async (req, res) => {
    const cart = await carts.saveCart();
    res.json(cart);
});

cartsRouter.delete('/:id', async (req, res) => {
    const deletedCart = await carts.deleteById(req.params.id);
    if (deletedCart) {
        res.json(deletedCart);
    } else {
        res.sendStatus(400);
    }
})

cartsRouter.get('/:id/products', async (req, res) => {
    const products = await carts.getProdsByCartId(req.params.id);
    if (products) {
        res.json(products.products);
    } else {
        res.sendStatus(400);
    }
})

cartsRouter.post('/:cartId/products/:productId', async (req, res)=> {
    const cart = await carts.getById(req.params.cartId);
    const product = await products.getById(req.params.productId);
    if(cart && product){
        const updatedCart = await carts.saveProdInCart(cart.id, product);
        res.json(updatedCart)
    } else {
        res.status(404).send('Cart ID or Product ID not found')
    }
})

cartsRouter.delete('/:cartId/products/:productId', async (req, res) => {
    const cart = await carts.getById(req.params.cartId);
    const product = await carts.getProdInCart(req.params.cartId, req.params.productId);
    if (cart && product) {
        const updatedCart = await carts.deleteProdInCart(cart.id, product);
        res.json(updatedCart)
    } else {
        res.status(404).send('Cart ID or Product ID not found');
    }
})

// Server
const app = express();

app.use(express.static('public'));
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('*', notFound);

const PORT = 8080;
const server = app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${server.address().port}`);
});
server.on('error', error => console.log(`Error en servidor ${error}`));