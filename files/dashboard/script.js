const accountHeading = document.getElementById("account");
const tabs = document.getElementById("v-pills-tab");
const create = document.getElementById("create");
const modal = new bootstrap.Modal(document.getElementById("modal"));
const form = document.getElementById("form");

async function sendLoginDetails(options) {
  const data = await fetch("/login", options);
  return data.text();
}

if (localStorage.getItem("key")) {
  const data = {
    auth: "key",
    key: localStorage.getItem("key"),
  };
  const options = {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(data),
  };
  sendLoginDetails(options).then((value) => {
    const ObjValue = JSON.parse(value);
    const text = ObjValue.text;
    if (text !== "ok!") {
      window.location.href = "/login";
    }
  });
} else {
  window.location.href = "/login";
}

form.style.height = `${window.innerHeight - document.getElementsByTagName("nav")[0].getBoundingClientRect().height + 80}px`

async function getDetails() {
  const data = {
    auth: "key",
    key: localStorage.getItem("key"),
  };
  const options = {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(data),
  };
  const response = await fetch("/details", options);
  return response.text();
}

let loggedIn = false;
getDetails().then((value) => {
  const parsed = JSON.parse(value);
  if (parsed.text === "incorrect key!") {
    window.location.href = "/login";
  } else if (parsed.text === "ok!") {
    accountHeading.innerHTML = parsed.email;
    loggedIn = true;
    for (let item of parsed.data){
      const buttonElement = document.createElement("button");
      buttonElement.style.marginBottom = "10px";
      buttonElement.class = "nav-Link";
      buttonElement.setAttribute("data-toggle", "pill");
      buttonElement.setAttribute("role", "tab");
      buttonElement.setAttribute("aria-controls", "v-pills-home");
      buttonElement.setAttribute("aria-selected", "true");
      buttonElement.addEventListener('click',() => {
        loadWindow(buttonElement, parsed.data);
      });
      tabs.appendChild(buttonElement);
      buttonElement.innerHTML = item["nickname"];
    }
    const array = Array.from(tabs.children);
    if(array.length > 0){
      array[0].click();
    }
  }
});

let saved = true;
create.addEventListener("click", () => {
  if (saved) {
    if(loggedIn){
      createTab();
    } else {
      const modalContent = document
      .getElementById("modal")
      .querySelector(".modal-content");
    modalContent.innerHTML = `
          <div class="modal-header">
            <h5 class="modal-title">please wait!</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Please wait for account details to load before creating!</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-success" data-bs-dismiss="modal">Ok, I will wait</button>
          </div>
        `;
    modal.show();
    }
  } else {
    const modalContent = document
      .getElementById("modal")
      .querySelector(".modal-content");
    modalContent.innerHTML = `
          <div class="modal-header">
            <h5 class="modal-title">oops</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Please save your product before create the next one.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-success" data-bs-dismiss="modal">Ok, I will save.</button>
            <button onclick="discard()" type="button" class="btn btn-danger" data-bs-dismiss="modal">Discard this project and create another</button>
          </div>
        `;
    modal.show();
  }
});

window.addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    if (
      document.activeElement &&
      document.activeElement.tagName === "INPUT" &&
      document.activeElement.value !== ""
    ) {
      const activeElementValue = document.activeElement.value;
      if (activeElementValue.length <= 16) {
        // saved = false;
        tabs.removeChild(document.activeElement);
        const buttonElement = document.createElement("button");
        buttonElement.style.marginBottom = "10px";
        buttonElement.class = "nav-Link";
        buttonElement.setAttribute("data-toggle", "pill");
        buttonElement.setAttribute("role", "tab");
        buttonElement.setAttribute("aria-controls", "v-pills-home");
        buttonElement.setAttribute("aria-selected", "true");
        buttonElement.onclick = () => {
          loadWindow(buttonElement);
        };
        buttonElement.innerHTML = activeElementValue;
        tabs.appendChild(buttonElement);
        await loadWindow(buttonElement);
        const modalContent = document
          .getElementById("modal")
          .querySelector(".modal-content");
        modalContent.innerHTML = `
          <div class="modal-header">
            <h5 class="modal-title">Creating item on server.....</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p><div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div></p>
          </div>
          <div class="modal-footer">
          </div>
    `;
        modal.show();
        const payload = {
          auth: "key",
          key: localStorage.getItem("key"),
          operation: "createItem",
          "box-number": getNumberOfItems(),
          "data": "",
          "box-nickname": activeElementValue
        };
        const data = await createItemOnServer(payload);
        window.location.href = window.location.href;
        modal.hide();
        const text = data.text;
        if (text === "incorrect key!") {
          window.location.href = "/login";
        }
      } else {
        alert(
          "This name is not the actual display name of the product. It is only visible to u therefore, a Nickname's of a product must be no longer than 16 characters."
        );
      }
    }
  }
});

function createTab() {
  const input = document.createElement("input");
  input.className = "nav-link";
  input.id = "v-pills-home-tab";
  input.style.border = "solid white";
  input.setAttribute("data-toggle", "pill");
  input.setAttribute("href", "#v-pills-home");
  input.setAttribute("role", "tab");
  input.setAttribute("aria-controls", "v-pills-home");
  input.setAttribute("aria-selected", "true");
  tabs.appendChild(input);
  input.focus();
  input.addEventListener('blur', ()=>{
    if(!input.value){
    input.parentElement.removeChild(input);
    }
  });
}

function loadWindow(activeElement, data) {
  CircleHistory = [];
  document.getElementById("buttonContainer").style.visibility = "hidden";
  form.innerHTML = ``;
  array = Array.from(tabs.children);
  array.forEach((element) => {
    element.className = "nav-link";
    element.onclick = () => {
      loadWindow(element);
    };
  });
  activeElement.classList.add("active");
  activeElement.onclick = () => {};
  form.innerHTML += `
<div id="inputContainer" class="mb-3">
  <label for="formFile" class="form-label">Upload a photo</label>
  <input class="form-control" type="file" id="formFile">
</div>`;
document.getElementById("formFile").addEventListener('change',(e)=>{
  Array.from(e.target.files).forEach(item => {
    const element = document.createElement("img");
    element.style.height = "100%";
    element.draggable = false;
    element.addEventListener('click', function (event) {
      const x = event.offsetX;
      const y = event.offsetY;
      drawCircle(element.parentElement, x, y);
  });
    const file = item; 
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function() {
        element.src = reader.result;
        document.getElementById("inputContainer").replaceWith(element)
    }; 
});
});
const element = document.createElement("button");
    element.className = "btn btn-danger";
    element.type = "button";
    element.id = "save";
    element.style.marginRight = "30px";
    element.style.right = "0";
    element.style.position = "absolute";
    element.innerHTML = "Delete Box";
    element.onclick = () => {
      const modalContent = document
  .getElementById("modal")
  .querySelector(".modal-content");
modalContent.innerHTML = `
      <div class="modal-header">
        <h5 class="modal-title">Are you sure?</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
      <p>Delete?</p>
      </div>
      <div class="modal-footer">
      <button type="button" onclick="deleteBox()" class="btn btn-danger">Delete</button>
      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
      </div>
`;
modal.show();
    };
    create.parentElement.appendChild(element);
if(data){ 
  const element = document.createElement("img");
  element.draggable = false;
  element.style.height = "100%";
  if(data[getActiveItemNumber() - 1]["circleData"]){
  element.src = data[getActiveItemNumber() - 1]["img-file"];
  element.addEventListener('click', function (event) {
    const x = event.offsetX;
    const y = event.offsetY;
    drawCircle(element.parentElement, x, y);
  });
  document.getElementById("inputContainer").replaceWith(element);
  data[getActiveItemNumber() - 1]["circleData"].forEach((item)=>{
    drawCircle(element.parentElement, item.x, item.y);  
  });
}
}
}

async function save() {
  saved = true;
  const modalContent = document
  .getElementById("modal")
  .querySelector(".modal-content");
modalContent.innerHTML = `
      <div class="modal-header">
        <h5 class="modal-title">Saving.....</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <p><div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div></p>
      </div>
      <div class="modal-footer">
      </div>
`;
  modal.show();
  const file = form.querySelector('img').src;
  const circleData = [];
  const data = [];
  CircleHistory.forEach((item)=>{
    const radius = parseInt(item.style.width) / 2;
    const x = parseInt(item.style.left) + radius;
    const y = parseInt(item.style.top) + radius;
    const object = {
      "x" : x,
      "y" : y
    }
    circleData.push(object);
    const rgb = getColorAtPixel(form.querySelector('img'), x, y);
    data.push(rgb);
  });
  const payload = {
    auth: "key",
    key: localStorage.getItem("key"),
    operation: "editItem",
    "box-number": getNumberOfItems(),
    "circle-data" : circleData,
    "data": data,
    "box-nickname" : document.getElementsByClassName("nav-link active")[0].innerHTML, // issue
    "img-file" : file
  };
  const response = await createItemOnServer(payload);
  modal.hide();
  const text = response.text;
  if (text === "incorrect key!") {
    window.location.href = "/login";
  }
}

async function createItemOnServer(payload) {
  const options = {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  };
  const data = await fetch("/dashboard/save", options);
  let text = await data.text();
  const parsed = JSON.parse(text);
  return parsed;
}

async function deleteBox(){
  const modalContent = document
  .getElementById("modal")
  .querySelector(".modal-content");
modalContent.innerHTML = `
      <div class="modal-header">
        <h5 style="color:red;" class="modal-title">Deleting....</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
      <p>Deleting...</p>
      </div>
      <div class="modal-footer">
      </div>
`;
const payload = {
  auth: "key",
  key: localStorage.getItem("key"),
  operation: "deleteItem",
  "box-number": getNumberOfItems()
};
const data = await createItemOnServer(payload);
  modal.hide();
const text = data.text;
if (text === "incorrect key!") {
  window.location.href = "/login";
}
  const active = document.getElementsByClassName("nav-link active")[0];
  active.parentElement.removeChild(active);
  const array = Array.from(tabs.children);
    if(array.length > 0){
      array[0].click();
    } else {
      form.textContent = "";
      document.getElementById("buttonContainer").textContent = "";
    }
}

function getNumberOfItems() {
  let count = 0;
  const array = Array.from(tabs.children);
  for (let item of array) {
    if (item.tagName === "BUTTON") {
      count++;
    }
  }
  return count;
}

function getActiveItemNumber() {
  let count = 1;
  const activeElement = document.getElementsByClassName("nav-link active")[0];
  const array = Array.from(tabs.children);
  for (let item of array) {
    if (item === activeElement) {
      return count;
    } else {
      count++;
    }
  }
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

let CircleHistory = [];
function drawCircle(container , x, y){
  radius = 2;
  color = "red";
  thickness = 1;
  // let radius = undefined;
  // let color = undefined;
  // let thickness = undefined;
  // if(window.innerHeight > window.innerWidth){
  // radius = 5;
  // color = "red";
  // thickness = 1;
  // } else {
  //   radius = 30;
  //   color = "red";
  //   thickness = 5;
  // }
  const element = document.createElement("div");
  element.className = "circle";
  element.style.position = "absolute";
  element.style.left = `${x - radius}px`;
  element.style.top = `${y - radius}px`;
  element.style.width = `${radius * 2}px`;
  element.style.height = `${radius * 2}px`;
  element.style.border = `solid ${thickness}px ${color}`;
  element.style.borderRadius = "50%";
  const dot = document.createElement("div");
  dot.style.position = "absolute";
  dot.style.left = `${x}px`;
  dot.style.top = `${y}px`;
  dot.style.width = `${radius / 2}px`;
  dot.style.height = `${radius / 2}px`;
  element.style.border = `solid ${thickness}px ${color}`;
  element.style.borderRadius = "50%";
  container.appendChild(element);
  container.appendChild(dot);
  CircleHistory.push(element)
  check();
}

function undoCircle(){
  if(CircleHistory.length > 0){
  const lastElement = CircleHistory.pop();
  lastElement.parentElement.removeChild(lastElement);
}
check();
}

function check(){
  if(CircleHistory.length !== 0){
    document.getElementById("buttonContainer").style.visibility = "visible";
  } else {
    document.getElementById("buttonContainer").style.visibility = "hidden";
  }
}
