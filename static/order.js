// SetupSDK
TPDirect.setupSDK(124115, 'app_txhUc3e9hbencFjqLNaaQwS8yyIhHnQuEIiSYW2tYm2FaZegAQq4q3eC1MtE', 'sandbox');

// TPDirect.card.setup
let fields = {
    number: {
        element: '#card-number',
        placeholder: '**** **** **** ****'
    },
    expirationDate: {
        element: document.getElementById('card-expiration-date'),
        placeholder: 'MM / YY'
    },
    ccv: {
        element: '#card-ccv',
        placeholder: 'CCV'
    }
};
TPDirect.card.setup({
    fields: fields,
    styles: {
        'input': {
            'color': 'gray'
        },
        'input.ccv': {
            'font-size': '16px'
        },
        'input.expiration-date': {
            'font-size': '16px'
        },
        'input.card-number': {
            'font-size': '16px'
        },
        ':focus': {
            'color': 'black'
        },
        '.valid': {
            'color': 'green'
        },
        '.invalid': {
            'color': 'red'
        },
        '@media screen and (max-width: 400px)': {
            'input': {
                'color': 'orange'
            }
        }
    }
});


// call TPDirect.card.getPrime when user submit form to get tap pay prime
orderButton.addEventListener("click", getPrime, false)
function getPrime(event) {
    event.preventDefault();

    // 取得 TapPay Fields 的 status
    const tappayStatus = TPDirect.card.getTappayFieldsStatus();

    // 確認是否可以 getPrime
    if (tappayStatus.canGetPrime === false) {
        alert('請完整填寫欄位資訊');
        return;
    }
    // Get prime
    let prime = ""
    TPDirect.card.getPrime((result) => {
        if (result.status !== 0) {
            alert('付款失敗，原因：' + result.msg);
            return;
        }
        prime = result.card.prime;
        getOrderNumber(prime);
    })

    // get orderNumber
    async function getOrderNumber(prime){
        let result = await getOrderResult(prime);
        if (result.data){
            let orderNumber = result.data.number;
            window.location.replace("/thankyou?number=" + orderNumber);
        } else{
            alert("付款失敗，原因：" + result.message);
        }
    }
}

// get order result from API
async function getOrderResult(prime) {
    let result = await getBookingInfo();
    booking = result.data;
    let contactName = document.querySelector("#contactName").value;
    let contactEmail = document.querySelector("#contactName").value;
    let contactPhone = document.querySelector("#contactName").value;
    let body = {
        "prime": prime,
        "order": {
            "price": booking.price,
            "trip": {
                "attraction": {
                    "id": booking.attraction.id,
                    "name": booking.attraction.name,
                    "address": booking.attraction.address,
                    "image": booking.attraction.image
                },
                "date": booking.date,
                "time": booking.time
            },
            "contact": {
                "name": contactName,
                "email": contactEmail,
                "phone": contactPhone
            }
        }
    }
    return (await fetch(`/api/orders`, {
        method: 'POST',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(body)
    })).json();
};