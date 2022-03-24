const track = document.querySelector('.carousel__track');
const dotsNav = document.querySelector('.carousel__nav');
const prevButton = document.querySelector('.carousel__button--left');
const nextButton = document.querySelector('.carousel__button--right');

// get page number
const pathArray = window.location.pathname.split('/');
const page = pathArray[2];
renderAttractionInfo(page);

// get data from API
async function getAttraction(id) {
    return (await fetch(`/api/attraction/${id}`, {method: "GET"})).json();
};

// render attraction info
async function renderAttractionInfo(id) {
    result = await getAttraction(id);
    let data = result.data;
    // carousel slide
    let images = data.images;
    for (i = 0; i < images.length; i++) {
        let slide = document.createElement('li');
        let image = document.createElement('img');
        let dot = document.createElement('button');
        if (i > 8) {break;}
        slide.classList.add('carousel__slide');
        image.classList.add('carousel__image');
        image.src = data.images[i];
        image.alt = data.name;
        dot.classList.add('carousel__indicator');
        slide.appendChild(image);
        track.appendChild(slide);
        dotsNav.appendChild(dot);
        if (i == 0){
            slide.classList.add('current-slide');
            dot.classList.add('current-slide');
        }
    }
    arrangeSlides();

    // order
    let tour = document.querySelector('.order__tour');
    let title = document.createElement('h2');
    let subTitle = document.createElement('h4');
    title.textContent = data.name;
    subTitle.textContent = data.category + ' at ' + data.mrt;
    tour.appendChild(title);
    tour.appendChild(subTitle);

    // description
    let history = document.querySelector('.description__history');
    let location = document.querySelector('.description__address');
    let transports = document.querySelector('.description__transportation');
    let paragraph = document.createElement('p');
    let address = document.createElement('p');
    let transport = document.createElement('p');
    paragraph.textContent = data.description;
    address.textContent = data.address;
    transport.textContent = data.transport;
    history.appendChild(paragraph);
    location.appendChild(address);
    transports.appendChild(transport);
};

// arrange the slides next to one another
function arrangeSlides() {
    const slides = Array.from(track.children);
    const slideWidth = slides[0].getBoundingClientRect().width;
    const setSlidePosition = (slide, index) => {
        slide.style.left = slideWidth * index + 'px';
    };
    slides.forEach(setSlidePosition);
}

// update carousel slide and dots
const moveToSlide = (track, currentSlide, targetSlide) => {
    track.style.transform = 'translateX( -' +targetSlide.style.left+ ')';
    currentSlide.classList.remove('current-slide');
    targetSlide.classList.add('current-slide');
}

const updateDots = (currentDot, targetDot) => {
    currentDot.classList.remove('current-slide');
    targetDot.classList.add('current-slide');
}

// when I click left, move slides to the right
prevButton.addEventListener('click', e => {
    const currentSlide = track.querySelector('.current-slide');
    const prevSlide = currentSlide.previousElementSibling;
    const currentDot = dotsNav.querySelector('.current-slide');
    const prevDot = currentDot.previousElementSibling;
    if (prevSlide){
        moveToSlide(track, currentSlide, prevSlide);
        updateDots(currentDot, prevDot);
    } else return;
});

// when I click right, move slides to the left
nextButton.addEventListener('click', e => {
    const currentSlide = track.querySelector('.current-slide');
    const nextSlide = currentSlide.nextElementSibling;
    const currentDot = dotsNav.querySelector('.current-slide');
    const nextDot = currentDot.nextElementSibling;
    if (nextSlide){
        moveToSlide(track, currentSlide, nextSlide);
        updateDots(currentDot, nextDot);
    } else return;
});

// when I click the nav indicator, move to that slide
const dots = Array.from(dotsNav.children);
dotsNav.addEventListener('click', e => {
    const targetDot = e.target.closest('button');
    if(!targetDot) return;
    const currentSlide = track.querySelector('.current-slide');
    const currentDot = dotsNav.querySelector('.current-slide');
    const targetIndex = dots.findIndex(dot => dot === targetDot);
    const targetSlide = slides[targetIndex];
    moveToSlide(track, currentSlide, targetSlide);
    updateDots(currentDot, targetDot);
});

// render tour fee
document.addEventListener('click', e => {
    let tourFee = document.querySelector('.tourFee');
    const dayFee = "2000";
    const nightFee = "2500";
    if (e.target.id == 'nightTour') {
        tourFee.innerHTML = "";
        tourFee.innerHTML = nightFee;
    } else if (e.target.id == 'dayTour') {
        tourFee.innerHTML = "";
        tourFee.innerHTML = dayFee;
    }
})