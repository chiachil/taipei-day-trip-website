let nextPage = 0;
let keywordToSearch = null;

// first loading
renderPictureList(0);

// get data from API
async function getAttractions(page) {
    return (await fetch(`/api/attractions?page=${page}`, {method: 'GET'})).json();
};

async function searchAttractions(page, keyword) {
    return (await fetch(`/api/attractions?page=${page}&keyword=${keyword}`, {method: 'GET'})).json();
};

// render picture list
async function renderPictureList(page=0, keyword=null) {
    let result = [];
    if (keyword) {
        result = await searchAttractions(page, keyword);
        if (result.error){
            let error = result.message;
            let attractionList = document.getElementById('gallery');
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
    for (i = 0; i < data.length; i++) {
        let attractionList = document.getElementById('gallery');
        let attraction = document.createElement('li');
        let card = document.createElement('a');
        let image = document.createElement('img');
        let title = document.createElement('h4');
        let info = document.createElement('div');
        let location = document.createElement('h4');
        let category = document.createElement('h4');
        attraction.classList.add('galleryItem');
        card.href = '/attraction/' + data[i].id;
        card.classList.add('galleryCard');
        image.src = data[i].images[0];
        image.alt = data[i].name;
        title.classList.add('attractionTitle');
        title.textContent = data[i].name;
        info.classList.add('attractionInfo');
        location.classList.add('location');
        category.classList.add('category');
        location.textContent = data[i].mrt;
        category.textContent = data[i].category;
        info.appendChild(location);
        info.appendChild(category);
        card.appendChild(image);
        card.appendChild(title);
        card.appendChild(info);
        attraction.appendChild(card);
        attractionList.appendChild(attraction);
    }
};

// when user scrolls the page at bottom
window.addEventListener('scroll', async() => {
    const scrolled = window.scrollY;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (scrolled !== scrollable || nextPage == null) {return;}
    await renderPictureList(nextPage, keywordToSearch);
});

// when user clicks the keyword-searching button
document.addEventListener('click', keywordSearch, false)
async function keywordSearch(e) {
    if (e.target.id == 'searchButton'){
        keywordToSearch = document.getElementById('searchKeyword').value;
        if (keywordToSearch) {
            let attractionList = document.getElementById('gallery');
            attractionList.innerHTML = '';
            await renderPictureList(0, keywordToSearch);
        }
    }
};