const map=L.map('map',{zoomControl:false}).setView([36.366,3.9],7);
const layers={
 street:L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}),
 topo:L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',{maxZoom:17,attribution:'© OpenTopoMap contributors'}),
 satellite:L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,attribution:'Tiles © Esri'})
};
let current='street',marker=null;layers.street.addTo(map);
const $=id=>document.getElementById(id);
function setMessage(t){$('message').textContent=t}
function updateLocation(lat,lon){$('lat').textContent=lat.toFixed(5);$('lon').textContent=lon.toFixed(5);$('mapCoords').textContent=lat.toFixed(4)+'°, '+lon.toFixed(4)+'°';if(marker)map.removeLayer(marker);marker=L.marker([lat,lon]).addTo(map);fetchElevation(lat,lon)}
async function fetchElevation(lat,lon){$('elevation').textContent='جارٍ التحميل...';try{const r=await fetch('https://api.open-meteo.com/v1/elevation?latitude='+lat+'&longitude='+lon);if(!r.ok)throw Error();const d=await r.json();const v=d.elevation?.[0];$('elevation').textContent=Number.isFinite(v)?Math.round(v)+' متر':'غير متاح'}catch{$('elevation').textContent='غير متاح'}}
document.querySelectorAll('.layer').forEach(btn=>btn.addEventListener('click',()=>{const key=btn.dataset.layer;if(key===current)return;map.removeLayer(layers[current]);layers[key].addTo(map);current=key;document.querySelectorAll('.layer').forEach(x=>x.classList.toggle('active',x===btn))}));
$('searchForm').addEventListener('submit',async e=>{e.preventDefault();const q=$('searchInput').value.trim();if(!q)return;setMessage('جارٍ البحث عن المكان...');try{const r=await fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q='+encodeURIComponent(q),{headers:{'Accept-Language':'ar'}});if(!r.ok)throw Error();const d=await r.json();if(!d.length){setMessage('لم يتم العثور على المكان. جرّب اسماً آخر.');return}const lat=Number(d[0].lat),lon=Number(d[0].lon);map.flyTo([lat,lon],13);updateLocation(lat,lon);setMessage(d[0].display_name)}catch{setMessage('تعذر البحث حالياً. تحقق من الاتصال وحاول مجدداً.')}});
$('locateBtn').addEventListener('click',()=>{if(!navigator.geolocation){setMessage('المتصفح لا يدعم تحديد الموقع.');return}setMessage('جارٍ تحديد موقعك...');navigator.geolocation.getCurrentPosition(p=>{const {latitude:lat,longitude:lon}=p.coords;map.flyTo([lat,lon],14);updateLocation(lat,lon);setMessage('تم تحديد موقعك الحالي.')},()=>setMessage('لم نتمكن من تحديد الموقع. تحقق من إذن الموقع في المتصفح.'),{enableHighAccuracy:true,timeout:12000})});
$('zoomReset').addEventListener('click',()=>map.flyTo([36.366,3.9],7));
map.on('click',e=>{updateLocation(e.latlng.lat,e.latlng.lng);setMessage('تم اختيار نقطة على الخريطة.')});
map.on('move',()=>{const c=map.getCenter();$('mapCoords').textContent=c.lat.toFixed(4)+'°, '+c.lng.toFixed(4)+'°'});