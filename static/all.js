let nextPage = 0;
let keywordToSearch = null;

// first loading
getPicture(0);

// get data from API
async function getAttractions(page) {
    return (await fetch(`/api/attractions?page=${page}`, {method: "GET"})).json();
};

async function searchAttractions(page, keyword) {
    return (await fetch(`/api/attractions?page=${page}&keyword=${keyword}`, {method: "GET"})).json();
};

// get pictures by auto-loading or search
async function getPicture(page=0, keyword=null) {
    let result = [];
    if (keyword) {
        result = await searchAttractions(page, keyword);
        if (result.error){
            let error = result.message;
            let attractionList = document.getElementById("gallery");
            let message = document.createElement('p');
            message.innerHTML = error;
            attractionList.appendChild(message);
            nextPage = null;
            keywordToSearch = null;
            return;
        };
    } else {
        result = await getAttractions(page);
    }
    nextPage = result.nextPage;
    let data = result.data;
    // render pictures
    for (i = 0; i < data.length; i++) {
        let attraction = document.createElement('li');
        let image = document.createElement('img');
        let attractionName = document.createElement('h4');
        let info = document.createElement('div');
        let location = document.createElement('p');
        let category = document.createElement('p');
        let attractionList = document.getElementById("gallery");
        image.src = data[i].images[0];
        attractionName.textContent = data[i].name;
        info.classList.add("info");
        location.textContent = data[i].mrt;
        category.textContent = data[i].category;
        info.appendChild(location);
        info.appendChild(category);
        attraction.appendChild(image);
        attraction.appendChild(attractionName);
        attraction.appendChild(info);
        attractionList.appendChild(attraction);
    }
};

window.addEventListener("scroll", async() => {
    const scrolled = window.scrollY;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (scrolled !== scrollable || nextPage == null) {return;}
    await getPicture(nextPage, keywordToSearch);
});

document.addEventListener("click", async()=>{
    keywordToSearch = document.getElementById("keyword").value;
    if (keywordToSearch) {
        let attractionList = document.getElementById("gallery");
        attractionList.innerHTML = "";
        await getPicture(0, keywordToSearch);
    }
});