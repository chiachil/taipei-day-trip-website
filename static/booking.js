const bookingContent = document.querySelector(".booking__content");
const deleteButton = document.querySelector("#booking__delete");
const orderButton = document.querySelector("#booking__confirmBtn");
const tourImage = document.querySelector(".booking__tourImage");
const tourTitle = document.querySelector(".booking__tourTitle");
const tourDate = document.querySelector(".booking__tourDate");
const tourTime = document.querySelector(".booking__tourTime");
const tourAddress = document.querySelector(".booking__tourAddress");
let price = 0;

// get booking info
async function getBookingInfo() {
    return (await fetch(`/api/booking`, {method: 'GET'})).json();
};
// delete booking info
async function getDeleteResult() {
    return (await fetch(`/api/booking`, {method: 'DELETE'})).json();
};


// render booking info
function renderBooking(booking){
    let tourPrice = document.querySelector(".booking__tourPrice");
    tourTitle.textContent = "台北一日遊：" + booking.attraction.name;
    tourImage.src = booking.attraction.image;
    tourDate.textContent = booking.date;
    price = booking.price
    tourPrice.textContent = "新台幣 " + price + " 元";
    tourAddress.textContent = booking.attraction.address;
    if (booking.time == "morning"){
        tourTime.textContent = "早上 9 點到中午 12 點";
    } else if(booking.time == "afternoon") {
        tourTime.textContent = "中午 12 點到下午 4 點";
    }
    let totalPrice = document.querySelector("#booking__paymentTotal");
    totalPrice.textContent = price;
}


// when page loads, check login status, if user has logged in, show booking info
window.addEventListener('load', showBookingInfo, false)
async function showBookingInfo(){
    let result = await getBookingInfo();
    if (result.error){
        window.location.replace("/");
        return;
    }
    let userData = await getLoginData();
    if (userData){
        let userName = userData.data.name;
        let name = document.querySelector("#userName");
        name.textContent = userName;
    }
    if (result.data){
        let booking = result.data;
        renderBooking(booking);
    } else{
        let message = document.createElement("p");
        let footer = document.querySelector(".footer");
        footer.style.height = "80vh";
        bookingContent.innerHTML ="";
        message.classList.add("booking__message");
        message.textContent = "目前沒有任何待預訂的行程";
        bookingContent.appendChild(message);
    }
}

// when user clicks delete booking button, delete and refresh page
deleteButton.addEventListener("click", deleteBooking, false)
async function deleteBooking(){
    let result = await getDeleteResult();
    if (result.ok){
        refresh();
    }
}