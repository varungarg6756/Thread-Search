const input = document.getElementById("inputGroupFile02");
const headingContainer = document.getElementById("headingContainer");
const inputContainer = document.getElementById("container");
const array = [];
input.addEventListener("change",async(e)=>{
    transition();
    Array.from(e.target.files).forEach(item => {
        const element = document.createElement("img");
        element.style.height = "100%";
        const file = item; 
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function() {
            element.src = reader.result;
            array.push(element);
        }; 
    });
    setTimeout(()=>{
        document.body.removeChild(headingContainer)
        inputContainer.style.bottom = "0";
        inputContainer.textContent = ""; 
        createSlideShow();
    },2000);
});

function transition(){
    headingContainer.style.opacity = "0";
    document.getElementsByClassName("input-group")[0].style.opacity = "0";
    inputContainer.classList.add('animated');
    inputContainer.style.minHeight = "100vh";
    inputContainer.style.minWidth = "100vw";
    scrollToTop();
}
function scrollToTop(){
    const req = requestAnimationFrame(scrollToTop);
    if(inputContainer.getBoundingClientRect().top >= 0){
        inputContainer.style.bottom = `${parseInt(inputContainer.style.bottom.substring(0, inputContainer.style.bottom.length - 2)) + 5}px`;
    } else {
        cancelAnimationFrame(req);
    }
}
function createSlideShow(){
   const element = document.createElement("div");
    inputContainer.appendChild(element);
    element.outerHTML = `<div id="carouselExampleFade" class="carousel slide carousel-fade">
    <div class="carousel-inner">
    </div>
    <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleFade" data-bs-slide="prev">
      <span class="carousel-control-prev-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Previous</span>
    </button>
    <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleFade" data-bs-slide="next">
      <span class="carousel-control-next-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Next</span>
    </button>
  </div>`;
//    element.outerHTML = `<div id="carouselExample" class="carousel slide">
//    <div class="carousel-inner">
//    </div>
//    <button class="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev">
//      <span class="carousel-control-prev-icon" aria-hidden="true"></span>
//      <span class="visually-hidden">Previous</span>
//    </button>
//    <button class="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">
//      <span class="carousel-control-next-icon" aria-hidden="true"></span>
//      <span class="visually-hidden">Next</span>
//    </button>
//  </div>`;
 createDiv();
}
function createDiv(){
    const carousel = document.getElementsByClassName("carousel-inner")[0];
    array.forEach((item)=>{
        const element = document.createElement("div");
        const data = item.src;
        const image = document.createElement("img");
        image.src = data;
        image.className = "d-block w-100";
        carousel.appendChild(element); 
        element.className = "carousel-item active";
        image.addEventListener('click', function (event) {
            const x = event.offsetX;
            const y = event.offsetY;
            drawCircle(element, x, y);
        });
        element.appendChild(image)
    });
}
function getColorAtPixel(image, x, y) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    context.drawImage(image, 0, 0, image.width, image.height);
    const pixel = context.getImageData(x, y, 1, 1).data;
    const rgba = {
        "r" : pixel[0],
        "g" : pixel[1],
        "b" : pixel[2],
        "a" : pixel[3],
    }
    return rgba;
}
function drawCircle(container , x, y){
    const radius = 20;
    const color = "red";
    const thickness = 5;
    if(container.querySelector('.circle')){
        container.removeChild(container.querySelector('.circle'));
    }
    const element = document.createElement("div");
    element.className = "circle";
    element.style.position = "absolute";
    element.style.left = `${x - radius}px`;
    element.style.top = `${y - radius}px`;
    element.style.width = `${radius * 2}px`;
    element.style.height = `${radius * 2}px`;
    element.style.border = `solid ${thickness}px ${color}`;
    element.style.borderRadius = "50%";
    container.appendChild(element);
    document.getElementById("choose").style.visibility = "visible";
}
function search(){
    const array = [];
    Array.from(document.getElementsByClassName('circle')).forEach((item)=>{
        const top = parseInt(item.style.top.substring(0,item.style.top.length - 2));
        const left = parseInt(item.style.left.substring(0,item.style.top.length - 2));
        array.push(getColorAtPixel(item.parentElement.querySelector("img"), left + (item.getBoundingClientRect().width / 2), top + (item.getBoundingClientRect().height / 2)));
    }); 
    sendRequest(array);
    document.body.innerHTML = `
    <div style="color: white; padding: 20px; height: 100vh; width: 100vw;">
    <div class="container text-center">
        <div class="row align-items-start">
        </div>
      </div>
      <h2 style="text-align:center;">Close matches that are found</h2>
      <div id="result"></div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL" crossorigin="anonymous"></script>
    `;
    document.body.style.overflowX = "hidden";
    const columnContainer = document.getElementsByClassName("row align-items-start")[0];
    let count = 1;
    array.forEach((item)=>{
        const element = document.createElement("div");
        columnContainer.appendChild(element);
      if(count === 1){
        element.outerHTML = ` <div style="height: 100px; display: flex; justify-content: center; align-items: center;" class="col active">
        ${count}
      </div>`;  
      } else {
        element.outerHTML = ` <div style="height: 100px; display: flex; justify-content: center; align-items: center;" class="col">
        ${count}
      </div>`;  
      }
        count++;
    });
}
async function sendRequest(array){
    const options = {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(array),
      };
    let data = await fetch("/color", options);
    data = await data.json();
    if(data.text === "ok!"){
        result.style.padding = "20px";
       loadList(data);
    }
}

function loadList(data){
    let count = 1;
    const active = document.getElementsByClassName("col active")[0];
    const result = document.getElementById("result");
    result.innerHTML = `<ul class="list-group"></ul>`;
    data.data[parseInt(active.innerHTML.trim()) - 1].forEach((item)=>{
        const element = document.createElement("li");
        document.getElementsByClassName("list-group")[0].appendChild(element);
        console.log(item);
        element.outerHTML =  `<li style="display:flex;align-items:center;justify-content:space-between;" class="list-group-item"><div>${count}. difference between color : ${parseInt(item.distance)} in box number : ${item.boxNumber} (reel number : ${item.reelNumber})</div><div style="height:100px;width:33%;background-color: rgb(${item.item.r}, ${item.item.g}, ${item.item.b});"></div></li>`;
        count++;
    });
    
//  
//     <li class="list-group-item">A second item</li>
//     <li class="list-group-item">A third item</li>
//     <li class="list-group-item">A fourth item</li>
//     <li class="list-group-item">And a fifth one</li>
}