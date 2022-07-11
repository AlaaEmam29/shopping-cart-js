"use strict"
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const cartLayout = document.querySelector(".cart-layout");
const cartDOM = document.querySelector(".cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartContent = document.querySelector(".cart-wrapper");
const cartItemsInNav = document.querySelector(".cart-items");
const cartTotalPrice = document.querySelector(".cart-total");
const productsContainer = document.querySelector(".products .row");
let cart = [] , buttonsDOM = [];

async function getAllProducts() {
    try {
        let response = await fetch('/js/products.json');
        let { items } = await response.json();
        return items
    }
    catch (err) {
        console.log(err)
    }
}
const displayProducts = (items) => {
    const item = items.map(({ fields, sys }) => {
        const { id } = sys;
        const { title, price } = fields;
        const image = fields.image.fields.file.url
        return `
        <div class="col-md-6 col-lg-4 col-xl-3 mb-3">
        <article class="product ">
            <div class="item position-relative">
                <img src="${image}"class="product-img" alt="product-item">
                <button data-id=${id} class="btn btn-color bag-btn position-absolute">
                    <i class="fas fa-shopping-cart text-capitalize">
                        add to cart
                    </i>
                </button>
            </div>
            <h5 class="mt-3">
                ${title}
            </h5>
            <h5 class="price">
               ${price}
            </h5>
        </article>
    </div>
        `
    }).join('');
    productsContainer.innerHTML = item;

};
async function initProducts() {

    const items = await getAllProducts().then((item) => {
        setLocalStorageProducts(item)
        displayProducts(item)
    }).then(() => {
        getBagButtons(),
        cartItemLogical()
    })
}
document.addEventListener("DOMContentLoaded", function () {
    setupAPP()
    initProducts();

})
function setLocalStorageProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
}
function getProductByIdFomLocalStorage(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find(product => product.sys.id === id);
  }
function getBagButtons(){
    const btns=[...document.querySelectorAll(".bag-btn i")]
    buttonsDOM=btns
    btns.forEach(btn => {
        let id=btn.parentNode.dataset.id;
        let inCart=cart.find(item=>item.id===id)
        if(inCart){
            btn.innerText="In Cart"
            btn.parentNode.disabled=true
        }
        
            btn.addEventListener('click',(e)=>{
                e.target.innerText="In Cart"
                e.target.parentNode.disabled=true;
                let cartItem = { ...getProductByIdFomLocalStorage(id), amount: 1 };
                cart = [...cart, cartItem];
                saveCart(cart);
                setCartValue(cart)
                addCartItem(cartItem);
                toggleCartDisplay();
            })
  })
}
function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}
function setCartValue(cart) {
let tempTotal = 0, itemsTotal = 0;
cart.map((item)=>{
    const {fields:{price },amount} = item;
    tempTotal +=price * amount;
    itemsTotal+= amount;
}) 
cartTotalPrice.textContent = parseFloat(tempTotal.toFixed(2));
cartItemsInNav.textContent = itemsTotal
}
function addCartItem(item)
{
return  cartContent.innerHTML += 
`
<div class="cart-item d-flex my-4 justify-content-between ">
<img src="${item.fields.image.fields.file.url}" alt="">
<div class="text-start mx-3 w-100">
    <h5>${item.fields.title}</h5>
    <h6>${item.fields.price}</h6>
    <span class="remove-item text-muted" data-id="${item.sys.id}">remove</span>
</div>
<div class="icons  d-flex flex-column justify-content-center">
    <i class="fas fa-chevron-up up" data-id="${item.sys.id}"></i>
    <h5 class="item-amount text-center ">${item.amount}</h5>
    <i class="fas fa-chevron-down down" data-id="${item.sys.id}"></i>
</div>
</div>
`
}
function getCartFomLocalStorage() {
 return localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")) : [];

}
function setupAPP() {
cart = getCartFomLocalStorage();
setCartValue(cart);
popoverCart(cart);
closeCartBtn.addEventListener("click", function() {toggleCartDisplay()})
cartBtn.addEventListener("click", function() {toggleCartDisplay()})

}
function popoverCart(cart){
    cart.map((item)=>{
        addCartItem(item)
    })
}
function toggleCartDisplay() {
    cartLayout.classList.toggle("transparent-bcg")
    cartDOM.classList.toggle("show-cart")

}
function hiddenCartDisplay() {
    cartLayout.classList.remove("transparent-bcg")
    cartDOM.classList.remove("show-cart")

}
function cartItemLogical() {
    clearCartBtn.addEventListener("click", function(){
        clearCart()
    })
    cartContent.addEventListener("click", function(e){
        const id = e.target.dataset.id;
        const items = [cart,id,e.target.parentElement.parentElement]
if(e.target.classList.contains("remove-item"))
{
const parent = e.target.parentElement.parentElement
removeItem(id);
cartContent.removeChild(parent);
}
else if(e.target.classList.contains("up"))
{
    changeAmount(items,e.target.nextElementSibling,1)
}
else if(e.target.classList.contains("down"))
{
   changeAmount(items,e.target.previousElementSibling,-1)
}
})
}
function changeAmount(items,e,i){
    let tempItem = items[0].find(item => item.sys.id === items[1]);
    tempItem.amount= tempItem.amount+i;
    if(tempItem.amount >0)
{
    saveCart(items[0]);
    setCartValue(items[0])

}
else{
    cartContent.removeChild(items[2]);
    removeItem(items[1])
}
    e.innerText = tempItem.amount
    
}
function clearCart(){
    let cartItems = cart.map(item=>item.sys.id)

    cartItems.forEach(id=> removeItem(id))
   while (cartContent.children.length >0)
   {
    cartContent.removeChild(cartContent.children[0])
   }
   toggleCartDisplay()
   
}

function removeItem(id){
cart = cart.filter(item => item.sys.id !== id);
setCartValue(cart)
saveCart(cart)
let btn =setupButton(id)
btn.innerText="Add To Cart"
btn.parentNode.disabled=false;

}
function setupButton(id){
    return buttonsDOM.find(btn =>btn.parentNode.dataset.id === id)
}