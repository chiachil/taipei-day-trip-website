const bookingContent = document.querySelector(".booking__content");
const deleteButton = document.querySelector("#booking__delete");

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
    let tourImage = document.querySelector(".booking__tourImage");
    let tourTitle = document.querySelector(".booking__tourTitle");
    let tourDate = document.querySelector(".booking__tourDate");
    let tourTime = document.querySelector(".booking__tourTime");
    let tourPrice = document.querySelector(".booking__tourPrice");
    let tourAddress = document.querySelector(".booking__tourAddress");
    tourTitle.textContent = "台北一日遊：" + booking.attraction.name;
    tourImage.src = booking.attraction.image;
    tourDate.textContent = booking.date;
    tourPrice.textContent = "新台幣 " + booking.price + " 元";
    tourAddress.textContent = booking.attraction.address;
    if (booking.time == "morning"){
        tourTime.textContent = "早上 9 點到中午 12 點";
    } else if(booking.time == "afternoon") {
        tourTime.textContent = "中午 12 點到下午 4 點";
    }
    let totalPrice = document.querySelector("#booking__paymentTotal");
    totalPrice.textContent = booking.price;
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