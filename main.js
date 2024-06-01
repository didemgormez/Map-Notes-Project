import { v4 as uuidv4 } from "https://jspm.dev/uuid";
import { detecIcon, detecType, setStorage } from "./helpers.js";



//! HTML'den gelenler
const form = document.querySelector("form");
const list = document.querySelector("ul");


//! Olay İzleyicileri
form.addEventListener("submit", handleSubmit);
list.addEventListener("click", handleClick);


//! Ortak Kullanım Alanı
var map;
var layerGroup = [];
var notes = JSON.parse(localStorage.getItem("notes")) || [];
var coords = [];

/*
 todo Kullanıcının konumunu öğrenmek için getCurrentPositon methodunu kullandık ve bizden iki parametre istedi:
 todo 1.Kullanıcı konum iznini verdiğinde çalışacak fonksiyondur.
 todo 2.Kullanıcı konum iznini vermediğinde çalışacak fonksiyondur.
 */

navigator.geolocation.getCurrentPosition(loadMap, errorFunction);
function errorFunction() {
  ("hata");
}
//todo Haritaya tıklanınca çalışır.
function onMapClick(e) {
  //todo Haritaya tıklandığında form bileşenin display özelliğini flex yaptık.
  form.style.display = "flex";
  e;
  //todo Haritada tıkladığımız yerin koordinatlarını coords dizisi içerisine aktardık.
  coords = [e.latlng.lat, e.latlng.lng];
  coords;
}
//todo Kullanıcının konumuna göre haritayı ekrana aktarır.
function loadMap(e) {
  //todo 1.Haritanın kurulumu
  map = L.map("map").setView([e.coords.latitude, e.coords.longitude], 10);
  L.control;
  //todo 2.Haritanın nasıl gözükeceğini belirler
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
  //todo 3.Harita da ekrana basılacak imleçleri tutacağımız katman
  layerGroup = L.layerGroup().addTo(map);

  //todo Local'den gelen notesları listeleme
  renderNoteList(notes);

  //todo Haritada bir tıklanma olduğunda çalışacak fonksiyon
  map.on("click", onMapClick);
}

function renderMarker(item) {
  // L.marker([50.505, 30.57], { icon: myIcon }).addTo(map);
  // Markerı oluşturur
  L.marker(item.coords, { icon: detecIcon(item.status) })
    .addTo(layerGroup) // imleçlerin olduğu katmana ekler
    .bindPopup(`${item.desc}`); // üzerine tıklanınca açılacak popup ekleme
}

function handleSubmit(e) {
  e.preventDefault(); //todo Sayfanın yenilenmesini engeller
  e;
  const desc = e.target[0].value; // Formun içerisindeki text inputun değerini alma
  const date = e.target[1].value; // Formun içerisindeki date inputunun değerini alma
  const status = e.target[2].value; // Formun içerisindeki select yapısının değerini alma

  notes.push({
    id: uuidv4(),
    desc,
    date,
    status,
    coords,
  });

  //todo Local storage güncelle
//   setStorage(notes);
  //todo renderNoteList fonksiyonuna parametre olarak notes dizisini gönderdik.
  renderNoteList(notes);

  //todo Form gönderildiğinde kapat
  form.style.display = "none";
}

//todo Ekrana notları aktaracak fonksiyon
function renderNoteList(item) {
  //todo Notlar(list) alanını temizle
  list.innerHTML = "";
  //todo Markerlerı temizler
  layerGroup.clearLayers();
  //todo Herbir not için li etiketi oluşturur ve içerisini günceller.
  item.forEach((item) => {
    const listElement = document.createElement("li"); //todo bir li etiketi oluşturur
    listElement.dataset.id = item.id; //todo li etiketine data-id özelliği ekleme
    listElement;
    listElement.innerHTML = `
    <div>
        <p>${item.desc}</p>
        <p><span>Tarih:</span>${item.date}</p>
        <p><span>Durum:</span>${detecType(item.status)}</p>
    </div>
    <i class="bi bi-x" id="delete"></i>
    <i class="bi bi-airplane-fill" id="fly"></i>
    
    `;

    list.insertAdjacentElement("afterbegin", listElement);

    renderMarker(item);
  });
}

//todo Notes alanında tıklanma olayını izler
function handleClick(e) {
  //todo Güncellenecek elemanın id'sini öğrenmek için parentElement yöntemini kullandık.
  const id = e.target.parentElement.dataset.id;
  console.log(id);
  if (e.target.id === "delete") {
    //todo idsini bildiğimiz elemanı diziden filter yöntemi kullanarak kaldırdık
    notes = notes.filter((note) => note.id != id);
    console.log(notes);
    setStorage(notes); //todo localStoragea güncelle
    renderNoteList(notes); //todo ekranı güncelle
  }


  if (e.target.id === "fly") {
    //todo Tıkladığımız elemanın idsi ile dizi içerindeki elemanlardan herhangi birinin idsi eşleşirse bul.
    const note = notes.find((note) => note.id == id);
    console.log(note);
    map.flyTo(note.coords); //todo Haritayı bulduğumuz elemana yönlendirmesi için flyTo methodunu kullandık.
  }
}