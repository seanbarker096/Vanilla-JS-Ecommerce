const express = require("express");

const cartsRepo = require("../repositories/carts");
const productsRepo = require('../repositories/products');
const cartShowTemplate = require('../views/carts/show');


const router = express.Router();

//add item to cart
router.post("/cart/products", async (req, res) => {
  let cart;
  //if no cartId in user cookie then make cart and store id in cookie
  if (!req.session.cartId) {
    //create a cart
    cart = await cartsRepo.create({ items: [] });
    req.session.cartId = cart.id;
  } else {
    //otherwise get their cart
    cart = await cartsRepo.getOne(req.session.cartId);
  }
  //either increment quantity for existing product or add new product
  const existingItem = cart.items.find(
    //productId stored in body due to input form on products html page which we clicked on to create post req
    (item) => item.id === req.body.productId
  );
  if (existingItem) {
    //increment quantity of item
    //ecisting item is reference to object inside items array
    //so changing existing item changes the cart.items array too
    existingItem.quantity++;
  } else {
    cart.items.push({ id: req.body.productId, quantity: 1 });
  }
  //update repo record we either just created or loaded in, with new cart items
  await cartsRepo.update(cart.id, {items: cart.items});
  res.redirect('/')
});

//show all items in cart
router.get('/cart', async (req, res) => {
  if (!req.session.cartId) {
    //redirect and exit function
    return res.redirect('/');
  }

  const cart = await cartsRepo.getOne(req.session.cartId);

  //loop through all items in cart and store product info from product repo as property
  //on item object
  for (let item of cart.items) {
    //set product info as object on each cart item
    const product = await productsRepo.getOne(item.id);
    item.product = product;
  }
  //send new cart array with item properties to be rendered
  res.send(cartShowTemplate({ items: cart.items }));
});

//delete item from cart
router.post('/cart/products/delete', async (req, res) => {
  const { itemId } = req.body;
  const cart = await cartsRepo.getOne(req.session.cartId);
  const items = cart.items.filter(item => item.id !== itemId);
  await cartsRepo.update(req.session.cartId, { items });
  res.redirect('/cart');
});

module.exports = router;
