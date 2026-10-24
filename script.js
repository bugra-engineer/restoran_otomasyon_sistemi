const MENU={
 "Yiyecek":{"Et":[["Izgara Köfte",220],["Kuzu Pirzola",380],["Antrikot",450],["Adana Kebap",260]],
  "Balık":[["Levrek Izgara",340],["Çipura",320],["Somon",400],["Hamsi Tava",240]],
  "Tavuk":[["Tavuk Şiş",210],["Tavuk Sote",200],["Izgara Tavuk Göğsü",220],["Kremalı Tavuk",230]],
  "Makarna":[["Spagetti Bolonez",190],["Penne Arrabbiata",175],["Fettuccine Alfredo",205],["Ton Balıklı Makarna",195]],
  "Çorba":[["Mercimek Çorbası",70],["Ezogelin Çorbası",75],["Domates Çorbası",70],["Yayla Çorbası",75]],
  "Tatlı":[["Künefe",140],["Sütlaç",90],["Baklava",150],["Tiramisu",120],["Cheesecake",125],["Dondurma (3 top)",80]]},
 "İçecek":{"Sıcak Kahve":[["Türk Kahvesi",60],["Espresso",60],["Filtre Kahve",70],["Latte",85],["Cappuccino",85]],
  "Soğuk Kahve":[["Ice Latte",95],["Ice Americano",85],["Cold Brew",100],["Frappe",95]],
  "Meşrubat":[["Kola",50],["Fanta",50],["Ayran",35]],
  "Şarap":[["Kırmızı Şarap (Kadeh)",120],["Beyaz Şarap (Kadeh)",110],["Roze Şarap (Kadeh)",110],["Kırmızı Şarap (Şişe)",650],["Beyaz Şarap (Şişe)",600]]}};
let orders={};
try{orders=JSON.parse(localStorage.getItem("bugra_orders")||"{}")}catch(e){}
const save=()=>{try{localStorage.setItem("bugra_orders",JSON.stringify(orders))}catch(e){}};
const $=id=>document.getElementById(id);
const list=n=>orders[n]||(orders[n]=[]);
const total=n=>list(n).reduce((s,i)=>s+i.price*i.qty,0);
const tl=v=>v.toLocaleString("tr-TR")+" ₺";
const today=()=>new Date().toLocaleDateString("tr-TR");
let rev={date:today(),total:0,count:0};
try{const r=JSON.parse(localStorage.getItem("bugra_rev")||"null");if(r&&r.date===today())rev=r}catch(e){}
const saveRev=()=>{try{localStorage.setItem("bugra_rev",JSON.stringify(rev))}catch(e){}};
function renderSum(){
 if(rev.date!==today())rev={date:today(),total:0,count:0};
 let open=0,busy=0;
 for(let n=1;n<=20;n++){const t=total(n);open+=t;if(t>0)busy++}
 $("sum").innerHTML=`<div><small>Günlük Ciro</small><b>${tl(rev.total)}</b></div><div><small>Ödenen Hesap</small><b>${rev.count}</b></div><div><small>Açık Masa</small><b>${busy}</b></div><div><small>Açık Hesaplar</small><b>${tl(open)}</b></div>`;
}
let cur=null;

function renderGrid(){
 renderSum();
 $("grid").innerHTML="";
 for(let n=1;n<=20;n++){
  const d=document.createElement("div");
  const busy=list(n).length>0;
  d.className="table"+(busy?" busy":"");
  d.innerHTML=`${n}. Masa${busy?`<small>${tl(total(n))}</small>`:""}`;
  d.onclick=()=>{cur=n;show("menu")};
  $("grid").appendChild(d);
 }
}
function open(h){$("modal").innerHTML=h;$("ov").classList.add("on")}
function closeModal(){$("ov").classList.remove("on");cur=null;renderGrid()}
$("ov").onclick=e=>{if(e.target.id==="ov")closeModal()};

function show(view,a,b){
 const n=cur;
 if(view==="menu"){
  open(`<h2>${n}. Masa</h2><div class="btns">
  <button onclick="show('type')">Sipariş Ekle</button>
  <button class="alt" onclick="show('del')">Ürün Sil</button>
  <button class="alt" onclick="show('bill')">Hesabı Göster</button>
  <button class="ok" onclick="paid()">Hesap Ödendi</button>
  <button class="alt" onclick="closeModal()">Kapat</button></div>`);
 }else if(view==="type"){
  open(`<h2>${n}. Masa – Sipariş Ekle</h2><div class="btns">
  ${Object.keys(MENU).map(t=>`<button onclick="show('cat','${t}')">${t}</button>`).join("")}
  </div><button class="alt back" onclick="show('menu')">← Geri</button>`);
 }else if(view==="cat"){
  open(`<h2>${a}</h2><div class="btns">
  ${Object.keys(MENU[a]).map(c=>`<button class="alt" onclick="show('items','${a}','${c}')">${c}</button>`).join("")}
  </div><button class="alt back" onclick="show('type')">← Geri</button>`);
 }else if(view==="items"){
  open(`<h2>${b}</h2><div class="items">
  ${MENU[a][b].map((p,i)=>`<button class="alt" onclick="add('${a}','${b}',${i})">${p[0]}<br>${tl(p[1])}</button>`).join("")}
  </div><div class="total" id="tt">Toplam: ${tl(total(n))}</div>
  <button class="alt back" onclick="show('cat','${a}')">← Geri</button>`);
 }else if(view==="del"){
  const l=list(n);
  open(`<h2>${n}. Masa – Ürün Sil</h2>${l.length?l.map((i,k)=>`<div class="row"><span>${i.qty} × ${i.name} (${tl(i.price*i.qty)})</span><button class="bad" style="padding:6px 12px" onclick="del(${k})">Sil</button></div>`).join(""):"<p>Siparişte ürün yok.</p>"}
  <div class="total">Toplam: ${tl(total(n))}</div><button class="alt back" onclick="show('menu')">← Geri</button>`);
 }else if(view==="bill"){
  const l=list(n);
  open(`<h2>${n}. Masa – Hesap</h2>${l.length?l.map(i=>`<div class="row"><span>${i.qty} × ${i.name}</span><b>${tl(i.price*i.qty)}</b></div>`).join(""):"<p>Henüz sipariş yok.</p>"}
  <div class="total">Toplam: ${tl(total(n))}</div><button class="alt back" onclick="show('menu')">← Geri</button>`);
 }
}
function add(a,b,i){
 const p=MENU[a][b][i],l=list(cur),f=l.find(x=>x.name===p[0]);
 f?f.qty++:l.push({name:p[0],price:p[1],qty:1});
 save();$("tt").textContent="Toplam: "+tl(total(cur))+"  ✓ "+p[0]+" eklendi";
}
function del(k){
 const l=list(cur);
 l[k].qty--; if(l[k].qty<=0)l.splice(k,1);
 save();show("del");
}
function paid(){
 const t=total(cur);
 if(t>0){if(rev.date!==today())rev={date:today(),total:0,count:0};rev.total+=t;rev.count++;saveRev()}
 orders[cur]=[];save();closeModal()
}
function resetRev(){
 if(confirm("Günlük ciro sıfırlansın mı?")){
  rev={date:today(),total:0,count:0};
  saveRev();
  renderSum();
 }
}
renderGrid();