// when page loads, show order info
window.addEventListener('load', renderOrder, false)
async function renderOrder(){
    let urlParams = new URLSearchParams(window.location.search);
    let orderNumber = urlParams.get("number");
    let result = await getOrder(orderNumber);
    if (result.error){
        window.location.replace("/");
        return;
    }
    let thankContainer = document.querySelector(".thankyou")
    let message__number = document.createElement("p");
    let message__name = document.createElement("p");
    let message__address = document.createElement("p");
    let message__date = document.createElement("p");
    let message__time = document.createElement("p");
    let message__price = document.createElement("p");
    let message__payment = document.createElement("p");

    // tour time
    let time = ""
    if (result['data']['trip']['time'] == "afternoon"){
        time = "中午 12 點到下午 4 點";
    } else{
        time = "早上 9 點到下午 4 點";
    };

    // payment status
    let paymentStatus = "";
    if (result['data']['status'] == 0){
        paymentStatus = "已付款";
    } else if (result['data']['status'] == 1){
        paymentStatus = "尚未付款（信用卡交易失敗。若希望以其他方式付款，請來信詢問）";
    };

    let footer = document.querySelector(".footer");
    footer.style.height = "60vh";
    message__number.textContent = "訂單編號： " + result['data']['number'];
    message__name.textContent = "行程景點： " + result['data']['trip']['attraction']['name'];
    message__address.textContent = "行程地址： " + result['data']['trip']['attraction']['address'];
    message__date.textContent = "行程日期： " + result['data']['trip']['date'];
    message__time.textContent = "行程時間： " + time;
    message__price.textContent = "訂單價格： 新台幣 " + result['data']['price'] + "元";
    message__payment.textContent = "付款狀態： " + paymentStatus;
    thankContainer.appendChild(message__number);
    thankContainer.appendChild(message__name);
    thankContainer.appendChild(message__address);
    thankContainer.appendChild(message__date);
    thankContainer.appendChild(message__time);
    thankContainer.appendChild(message__price);
    thankContainer.appendChild(message__payment);
}

// get order info
async function getOrder(orderNumber) {
    return (await fetch(`/api/order/${orderNumber}`, {method: 'GET'})).json();
};