const popup = document.querySelector('#popup');
const modal = document.createElement('div');
const mask = document.createElement('div');
const box = document.createElement('div');
const decoBar = document.createElement('div');
const content = document.createElement('div');
const title = document.createElement('div');
const close = document.createElement('img');
const pageTitle = document.createElement('h2');
const inputBox = document.createElement('div');
const fullName = document.createElement('input');
const email = document.createElement('input');
const password = document.createElement('input');
const actionButton = document.createElement('input');
const hint = document.createElement('p');
const alternative = document.createElement('p');
const alternativeBtn = document.createElement('button');
const navBooking = document.querySelector("#bookingButton");

// when page loads, check login status, if user has logged in, change menu button
window.addEventListener('load', checkLogin, false)
async function checkLogin (){
    let result = await getLoginData();
    let menuLogin = document.querySelector('#loginPage');
    if (result.data){
        menuLogin.removeAttribute('id');
        menuLogin.id = 'logoutPage';
        menuLogin.textContent = '登出系統';
    }
}
// when user clicks booking button on menu, check login status, show popup
navBooking.addEventListener("click", clickMenuBooking, false)
async function clickMenuBooking(){
    let result = await getLoginData();
    if (result.data){
        window.location.replace("/booking");
    } else{
        renderModal();
        showLogin();
    }
}

// when user clicks login/logout button on menu
document.addEventListener('click', clickMenu, false)
async function clickMenu(e){
    let targetId = e.target.id;
    if (targetId == "loginPage"){
        renderModal();
        showLogin();
    };
    if (targetId == "logoutPage"){
        await logout();
        refresh();
        menuLogin.removeAttribute('id');
        menuLogin.id = 'loginPage';
        menuLogin.textContent = '登入/註冊';
    };
}

// when user clicks alternative btn on login/register page, show alternative page info
alternativeBtn.addEventListener("click", (e)=>{
    let targetId = e.target.id;
    if (targetId == "toRegisterPage"){
        showRegister();
    };
    if (targetId == "toLoginPage"){
        showLogin();
    };
})

// when user clicks on close, close the modal
document.addEventListener("click", (e)=>{
    if (e.target.classList == "popup__close"){
        removeModal();
    }
})
// when user clicks on the mask area, close the modal
document.addEventListener("click", (e)=>{
    if (e.target.classList == "popup__mask"){
        removeModal();
    }
})

// when user clicks action btn on login/register page, send request to db and show response hint
actionButton.addEventListener('click', getUser, false)
async function getUser (e){
    let targetId = e.target.id;
    if (targetId == "popup__registerButton"){
        let name = document.getElementById('popup__inputName').value;
        let email = document.getElementById('popup__inputEmail').value;
        let password = document.getElementById('popup__inputPwd').value;
        let result = await register(name, email, password);
        if (hint){
            hint.remove();
        };
        if (result.ok){
            let message = '註冊成功';
            let color = '#1faf13';
            renderHint(message, color);
        } else if (result.error){
            let message = result.message;
            let color = '#c62828';
            renderHint(message, color);
        };
    };
    if (targetId == "popup__loginButton"){
        let email = document.getElementById('popup__inputEmail').value;
        let password = document.getElementById('popup__inputPwd').value;
        let result = await login(email, password);
        if (hint){
            hint.remove();
        };
        if (result.ok){
            refresh();
        } else if (result.error){
            let message = result.message;
            let color = '#c62828';
            renderHint(message, color);
        };
    };
}

//when user presses enter on input
inputBox.addEventListener('keyup', (e)=>{
    let name = document.getElementById('popup__inputName');
    let email = document.getElementById('popup__inputEmail');
    let password = document.getElementById('popup__inputPwd');
    if (e.target == name || e.target == email || e.target == password){
        if (e.key == "Enter"){
            actionButton.click();
        };
    };
})


// get user login info from API
async function getLoginData() {
    return (await fetch(`/api/user`, {method: 'GET'})).json();
};

// get register response from API
async function register(name, email, password) {
    let body = {
        "name": name,
        "email": email,
        "password": password
      }
    return (await fetch(`/api/user`, {
        method: 'POST',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(body)
    })).json();
};

// get login response from API
async function login(email, password) {
    let body = {
        "email": email,
        "password": password
      }
    return (await fetch(`/api/user`, {
        method: 'PATCH',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(body)
    })).json();
};

// get logout response from API
async function logout() {
    return (await fetch(`/api/user`, {method: 'DELETE'})).json();
};


// init status
function init(){
    hint.remove();
    fullName.value = '';
    email.value = '';
    password.value = '';
}
// refresh page
function refresh(){
    window.location.reload();
}

// render popup modal
function renderModal(){
    popup.appendChild(modal);
    modal.appendChild(mask);
    modal.appendChild(box);
    box.appendChild(decoBar);
    box.appendChild(content);
    content.appendChild(title);
    content.appendChild(inputBox);
    content.appendChild(alternative);
    title.appendChild(close);
    title.appendChild(pageTitle);
    inputBox.appendChild(email);
    inputBox.appendChild(password);
    inputBox.appendChild(actionButton);
    modal.classList.add('popup__container');
    mask.classList.add('popup__mask');
    box.classList.add('popup__box');
    decoBar.classList.add('popup__decoratorBar');
    content.classList.add('popup__content');
    title.classList.add('popup__title');
    close.classList.add('popup__close');
    close.src = '/static/images/icon_close.png';
    close.alt = 'close';
    inputBox.classList.add('popup__inputBox');
    fullName.type = 'type';
    fullName.placeholder = '輸入姓名';
    fullName.id = 'popup__inputName';
    email.type = 'type';
    email.placeholder = '輸入電子信箱';
    email.id = 'popup__inputEmail';
    password.type = 'password';
    password.placeholder = '輸入密碼';
    password.id = 'popup__inputPwd';
    actionButton.type = 'submit';
}

// show login info
function showLogin(){
    init();
    if (inputBox.firstChild === fullName){
        inputBox.removeChild(fullName);
    };
    pageTitle.textContent = '登入會員帳號';
    actionButton.value = '登入帳戶';
    actionButton.id = 'popup__loginButton';
    alternative.textContent = '還沒有帳戶？';
    alternative.appendChild(alternativeBtn);
    alternativeBtn.id = 'toRegisterPage';
    alternativeBtn.textContent = '點此註冊';
}

// show register info
function showRegister(){
    init();
    if (inputBox.firstChild === email){
        inputBox.insertBefore(fullName, inputBox.firstChild);
    };
    pageTitle.textContent = '註冊會員帳號';
    actionButton.value = '註冊新帳戶';
    actionButton.id = 'popup__registerButton';
    alternative.textContent = '已經有帳戶了？';
    alternative.appendChild(alternativeBtn);
    alternativeBtn.id = 'toLoginPage';
    alternativeBtn.textContent = '點此登入';
}

// remove popup modal
function removeModal(){
    modal.remove();
}

// render hint
function renderHint(message, color){
    hint.classList.add('popup__hint');
    content.insertBefore(hint, inputBox.nextSibling);
    hint.textContent = message;
    hint.style.color = color;
}