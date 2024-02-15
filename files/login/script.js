const form = document.getElementsByTagName("form")[0];
const email = document.getElementsByTagName("input")[0];
const password = document.getElementsByTagName("input")[1];
const checkBox = document.getElementsByTagName("input")[2];
const modal = document.getElementById("modal");

async function sendLoginDetails(options){
    const data = await fetch("/login", options);
    return data.text();
}

if(localStorage.getItem("key")){
  modal.innerHTML = `<div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Trying to Auto - Login</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
              <div class="progress">
              <div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
              </div>
              <div class="modal-footer">
              </div>
            </div>
          </div>`;
          $('#modal').modal('show');
  for(let index = 0;index<20;index++){
    setTimeout(()=>{
      modal.innerHTML = `<div class="modal-dialog" role="document">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="exampleModalLabel">Trying to Auto - Login</h5>
                  <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div class="modal-body">
                <div class="progress">
  <div class="progress-bar" role="progressbar" style="width: ${5*index}%" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
</div>
                </div>
                <div class="modal-footer">
                </div>
              </div>
            </div>`;
    },index*1000);
  }
  setTimeout(()=>{
    modal.innerHTML = `<div class="modal-dialog" role="document">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="exampleModalLabel">Trying to Auto - Login</h5>
                  <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div class="modal-body">
                ahh i m sorry, i thought this was funny. Actually the auto login didnt work this time. Maybe ur internet gave up idk so please login 😂.
                <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                </div>
              </div>
            </div>`;
  },19000);
            
const data = {
    "auth": "key",
    "key": localStorage.getItem("key")
}
const options = {
  method: "POST",
  headers:{
   "content-type":"application/json",
  },
  body: JSON.stringify(data)
}
  sendLoginDetails(options).then((value)=>{
    const ObjValue = JSON.parse(value)
    const text = ObjValue.text;
    if(ObjValue.text === "ok!"){
      window.location.href = "/dashboard";
    }
  });
}

form.addEventListener('submit', (e)=>{
    e.preventDefault();
    if(email.value && password.value){
        if(!email.value.match(/^[A-Za-z\._\-0-9]*[@][A-Za-z]*[\.][a-z]{2,4}$/)){
            modal.innerHTML = `<div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Incorrect credentials</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                Please enter a valid email address!
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
              </div>
            </div>
          </div>`;
            $('#modal').modal('show');
        }else if(password.value.length < 8){
            modal.innerHTML = `<div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Incorrect credentials</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
              please enter password that is longer than 8 characters. Your account is probably not gonna get hacked or anything. Just saying for ur own safety.
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
              </div>
            </div>
          </div>`;
            $('#modal').modal('show');
        }else if(!checkBox.checked){
            modal.innerHTML = `<div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Incorrect credentials</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
              please accept our terms and conditions UWU
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
              </div>
            </div>
          </div>`;
            $('#modal').modal('show');
        } else {
            const data = {
                "auth": "details",
                "email": email.value,
                "password": password.value
            }
            const options = {
               method: "POST",
               headers:{
                "content-type":"application/json",
               },
               body: JSON.stringify(data)
            }
            sendLoginDetails(options).then((value)=>{
              const ObjValue = JSON.parse(value)
              const text = ObjValue.text;
              const key = ObjValue.key;
                if(text === "ok!"){
                    localStorage.setItem("key", key);
                    window.location.href = "/dashboard";
                } else if(text === "INCORRECT!"){
                    modal.innerHTML = `<div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Incorrect credentials</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
              ${text}
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
              </div>
            </div>
          </div>`;
            $('#modal').modal('show');
                } else if(text === "INCORRECT FORMAT!"){
                    modal.innerHTML = `<div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Incorrect credentials</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
              invalid format of email, try again
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
              </div>
            </div>
          </div>`;
            $('#modal').modal('show');
                }
            });
        }
    }
});




