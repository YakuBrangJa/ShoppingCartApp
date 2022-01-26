"use strict";

// DOM Selector variables
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");

// Cart
let cart = [];
let buttonDOM = [];
// getting the products
class Products {
  async getProducts() {
    // fetch('products.json');
    try {
      let result = await fetch("products.json");
      let data = await result.json();
      let products = data.items.map((item) => {
        const { title, price } = item.fields;
        const id = item.sys.id;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

// display products
class UI {
  displayProducts(products) {
    console.log(products);
    products.forEach((product) => {
      let result = `
      <article class="product">
      <div class="img-container">
        <img
          src=${product.image}
          alt="product"
          class="product-img"
        />
        <button class="bag-btn" data-id="${product.id}">
          <i class="fas fa-shopping-cart"></i>
          add to bag
        </button>
      </div>
      <h3>${product.title}</h3>
      <h4>$${product.price}</h4>
      </article>
      `;
      productsDOM.insertAdjacentHTML("beforeend", result);
    });
  }

  getBagButtons() {
    productsDOM.addEventListener("click", (e) => {
      let item = e.target.closest(".bag-btn");
      if (!item) return;

      item.innerText = "In Cart";
      item.disabled = true;

      let id = item.dataset.id;
      buttonDOM.push(id);
      console.log(...buttonDOM);

      // getting an item that match with clicked id
      let cartItem = { ...Storage.getProducts(id), amount: 1 };
      console.log(cartItem);

      // add prodct to the cart
      // cart = [...cart, cartItem];
      cart.push(cartItem);

      // save cart in local storage
      Storage.saveCart(cart);
      // Storage.saveButtons(buttonDOM);
      // set cart count
      this.setCartValues(cart);

      // display cart item
      this.addCartItem(cartItem);

      // Open cart
      // this.showCart();
    });
  }
  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.forEach((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });

    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }

  addCartItem(item) {
    const itemDiv = `
    <div class="cart-item">
    <img src=${item.image} />
    <div>
      <h4>${item.title}</h4>
      <h5>$${item.price}</h5>
      <span class="remove-item" data-id=${item.id}>remove</span>
    </div>
    <div>
      <i class="fas fa-chevron-up" data-id=${item.id}></i>
      <p class="item-amount">${item.amount}</p>
      <i class="fas fa-chevron-down" data-id=${item.id}></i>
    </div>
  </div>
    `;
    cartContent.insertAdjacentHTML("beforeend", itemDiv);
  }

  setupApp() {
    cart = Storage.getCart();

    this.setCartValues(cart);

    cart.forEach((item) => {
      this.addCartItem(item);
      this.getButtons(item).innerText = "In Cart";
      this.getButtons(item).disabled = true;
    });
  }

  cartManage() {
    clearCartBtn.onclick = this.clearCart.bind(this);

    cartContent.addEventListener("click", this.clearAnItem.bind(this));

    cartContent.addEventListener("click", this.increaseAmount.bind(this));

    cartContent.addEventListener("click", this.decreaseAmount.bind(this));
  }

  clearCart() {
    this.clearShop();

    cart = [];
    // cartContent.innerHTML = "";
    while (cartContent.firstChild) cartContent.lastChild.remove();

    Storage.saveCart(cart);

    this.setCartValues(cart);

    this.clearShop();
  }

  clearShop() {
    cart.forEach((item) => {
      this.getButtons(
        item
      ).innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
      this.getButtons(item).disabled = false;
    });
  }

  getButtons(item) {
    let addBtns = [...document.querySelectorAll(".bag-btn")];
    return addBtns.find((b) => b.dataset.id === item.id);
  }

  clearAnItem(e) {
    let removeBtn = e.target.closest(".remove-item");
    if (!removeBtn) return;

    let singleItem = cart.find((item) => removeBtn.dataset.id === item.id);

    cart = cart.filter((item) => removeBtn.dataset.id !== item.id);
    this.setCartValues(cart);

    this.clearSingleShop(singleItem);

    Storage.saveCart(cart);

    e.currentTarget.removeChild(removeBtn.closest(".cart-item"));
  }

  clearSingleShop(item) {
    this.getButtons(
      item
    ).innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
    this.getButtons(item).disabled = false;
  }

  increaseAmount(e) {
    let increaseBtn = e.target.closest(".fa-chevron-up");
    if (!increaseBtn) return;

    let tempItem = cart.find((item) => increaseBtn.dataset.id === item.id);
    tempItem.amount++;

    Storage.saveCart(cart);

    this.setCartValues(cart);

    increaseBtn.parentNode.querySelector(".item-amount").innerText =
      tempItem.amount;
  }

  decreaseAmount(e) {
    let decreaseBtn = e.target.closest(".fa-chevron-down");
    if (!decreaseBtn) return;

    let tempItem = cart.find((item) => decreaseBtn.dataset.id === item.id);
    if (tempItem.amount === 1) return;
    tempItem.amount--;

    Storage.saveCart(cart);

    this.setCartValues(cart);

    decreaseBtn.parentNode.querySelector(".item-amount").innerText =
      tempItem.amount;
  }
}

// Local Storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  // static saveButtons(buttons) {
  //   localStorage.setItem("buttons", JSON, stringify(buttons));
  // }
  static getProducts(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id === id);
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : (cart = []);
  }

  // static getButtons() {
  //   return localStorage.getItem("buttons")
  //     ? JSON.parse(localStorage.getItem("buttons"))
  //     : (buttonDOM = []);
  // }
}

// Open/Close Cart
class Cart {
  constructor() {
    // Cart Open
    cartBtn.onclick = this.openCart;
    // Cart Close
    closeCartBtn.onclick = this.closeCart;
    cartOverlay.onclick = (e) => {
      if (e.target.closest(".cart") || e.target.closest(".remove-item")) return;
      this.closeCart();
    };
  }
  openCart() {
    cartDOM.classList.add("showCart");
    cartOverlay.classList.add("transparentBcg");
  }

  closeCart() {
    cartDOM.classList.remove("showCart");
    cartOverlay.classList.remove("transparentBcg");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  const cart = new Cart();

  // setup app
  // Get all products
  products
    .getProducts()
    .then((product) => {
      ui.displayProducts(product);
      ui.setupApp();
      Storage.saveProducts(product);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartManage();
    });
});
