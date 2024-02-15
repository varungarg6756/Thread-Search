const express = require("express");
const bodyParser = require('body-parser');
const path = require("path");
require('dotenv').config();

const API_KEY = {
  "type": "service_account",
  "project_id": "thread-search",
  "private_key_id": process.env.private_key_id ,
  "private_key": process.env.private_key,
  "client_email": process.env.client_email,
  "client_id": process.env.client_id,
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-2gvsq%40thread-search.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}
const port = 5050;
const indexDIR = "files/index/";
const loginDIR = "files/login/";
const dashboardDIR = "files/dashboard/";

const app = express();
app.use(bodyParser.json({ limit: '1000mb' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", express.static(path.join(__dirname, indexDIR)));
app.use("/login", express.static(path.join(__dirname, loginDIR)));
app.use("/dashboard", express.static(path.join(__dirname, dashboardDIR)));
app.post("/login", async (req, res) => {
  if (req.body.auth === "details") {
    req.body.email = req.body.email.toLowerCase();
    const email = req.body.email;
    const password = req.body.password;
    if (
      password.length >= 8 &&
      email.match(/^[A-Za-z\._\-0-9]*[@][A-Za-z]*[\.][a-z]{2,4}$/)
    ) {
      const user = await authenticateUser(email, password);
      if (user) {
        res.send(JSON.stringify({ text: "ok!", key: await user.user.getIdToken() }));
      } else {
        res.send(
          JSON.stringify({
            text: "INCORRECT!",
          })
        );
      }
    } else {
      res.send(
        JSON.stringify({
          text: "INCORRECT FORMAT!",
        })
      );
    }
  } else if (req.body.auth === "key" && req.body.key) {
    const response = await verifyAuthToken(req.body.key);
    if(response){
        res.send(JSON.stringify({ text: "ok!" }));
    }else{
      res.send(JSON.stringify({ text: "incorrect key!" }));
    }
  }
});
app.post("/details", async (req, res) => {
  if (req.body.auth === "key" && req.body.key) {
    const response = await verifyAuthToken(req.body.key);
    const data = await getData();
    const filteredData = [];
    try{
    await data["boxes"].forEach(item => {
      if(item){
        filteredData.push(item)
      }
    });
  }catch{}
    if(response){
      res.send(JSON.stringify({
        text: "ok!", email: response.email,
        data: filteredData
        }));
    } else{
      res.send(JSON.stringify({ text: "incorrect key!" }));
    }
  } else {
    res.send(JSON.stringify({ text: "incorrect key!" }));
  }
});
app.post("/dashboard/save", async (req, res) => {
  const value = await verifyAuthToken(req.body.key);
  if (value && typeof req.body["box-number"] === "number") {
    const operation = req.body.operation;
    const boxNumber = req.body["box-number"];
    const nickname = req.body["box-nickname"];
    const circleData = req.body["circle-data"];
    const imgFile = req.body["img-file"];
    const data = req.body.data;
    if(operation === "createItem"){
      await writeData(boxNumber, {
        "nickname" : nickname
      });
      res.send(JSON.stringify({ text: "ok!" }));
    } else if (operation === "editItem") {
      await writeData(boxNumber, {
        "nickname" : nickname,
        "circleData" : circleData,
        "img-file" : imgFile,
        "reels" : data
      });
      res.send(JSON.stringify({ text: "ok!" }));
    } else if(operation === "deleteItem") {
      await deleteData(boxNumber);
      res.send(JSON.stringify({ text: "ok!" }));
    }
  } else {
    res.send(JSON.stringify({ text: "incorrect key!" }));
  }
});
app.post("/color", async (req, res)=>{
   // structure : [ [{ a: 255, b: 115, g: 58, r: 107 },......], [], [] ]    array > clothColors > best matches
  const data = await getData();
  const filteredData = [];
  const result = [];
  try{
    data["boxes"].forEach(box => {
      if(box){
        filteredData.push(box);
      }
    });
  }catch{}
  await req.body.forEach((cloth)=>{
    const colorArray = [];
    filteredData.forEach((box)=>{
      box["reels"].forEach((item)=>{
        const distance = Math.sqrt(((item.r - cloth.r) ** 2) + ((item.g - cloth.g) ** 2) + ((item.b - cloth.b) ** 2) + ((item.a - cloth.a) ** 2));
        colorArray.push({
        item: item,
        distance: distance,
        boxNumber: filteredData.indexOf(box) + 1,
        reelNumber: box["reels"].indexOf(item) + 1
        });
      });
    });
    colorArray.sort((a,b)=>a.distance - b.distance);
    if(colorArray.length >= 5){
      result.push(colorArray.slice(0,5));
    } else { 
      result.push(colorArray.slice(0,colorArray.length));
    }
  });
  if(result.length > 0){
    res.send(JSON.stringify({ text: "ok!", data: result }));
  } else {
    res.send(JSON.stringify({ text: "No items!"}));
  }
});

app.listen(port, () => {
  console.log("listening at port", port);
});

async function verifyAuthToken(token) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      return decodedToken;
    }catch{}
  }

const { initializeApp } = require("firebase/app");
const { getDatabase, ref, set, get, remove } = require("firebase/database");
const { getAuth, signInWithEmailAndPassword } = require("firebase/auth");
var admin = require("firebase-admin");
var serviceAccount = API_KEY;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://thread-search-default-rtdb.asia-southeast1.firebasedatabase.app",
});

async function authenticateUser(email, password) {
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    const auth = await getAuth();
    const user = await signInWithEmailAndPassword(auth, email, password);
    return user;
  } catch {}
}

const firebaseConfig = {
  apiKey: "AIzaSyApJyLz3lBaXn5ScTo6rQRdhy9tfvrfBOo",
  authDomain: "thread-search.firebaseapp.com",
  databaseURL:
    "https://thread-search-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "thread-search",
  storageBucket: "thread-search.appspot.com",
  messagingSenderId: "145903808184",
  appId: "1:145903808184:web:4eaa4970baa94be6320e4d",
  measurementId: "G-LT78V9PQPE",
};

const firebaseApp = initializeApp(firebaseConfig);

async function writeData(boxnumber, data) {
  const auth = getAuth();
  const db = getDatabase();
  set(ref(db, 'boxes/' + boxnumber), data);
}

async function deleteData(boxnumber){
  const auth = getAuth();
  const db = getDatabase();
  remove(ref(db, 'boxes/' + boxnumber));
}

async function getData(){
  const db = getDatabase();
  const rootRef = ref(db);
  const data = await get(rootRef);
  if (data) {
    return data.val();
  } 
}


