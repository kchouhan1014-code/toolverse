const $ = id => document.getElementById(id);
const params = new URLSearchParams(location.search);
let slug = params.get("tool") || "word-counter";
const aliases = {
  "base64": "base64-encoder-decoder",
  "url-encoder": "url-encoder-decoder",
  "html-previewer": "html-formatter",
  "qr-generator": "qr-code-generator",
  "percentage": "percentage-calculator",
  "bmi": "bmi-calculator",
  "temperature": "temperature-converter",
  "length": "unit-converter"
};
slug = aliases[slug] || slug;

const tools = {
"word-counter":["Word Counter","Count words, characters, sentences and paragraphs."],
"case-converter":["Case Converter","Convert text into different letter cases."],
"character-counter":["Character Counter","Count characters with and without spaces."],
"text-reverser":["Text Reverser","Reverse text or the order of words."],
"json-formatter":["JSON Formatter","Format and validate JSON data."],
"base64-encoder-decoder":["Base64 Encoder / Decoder","Encode or decode Base64 text."],
"url-encoder-decoder":["URL Encoder / Decoder","Encode or decode URL components."],
"html-formatter":["HTML Formatter","Format and inspect HTML source."],
"password-generator":["Password Generator","Generate a secure random password."],
"qr-code-generator":["QR Code Generator","Create a QR code from text or a URL."],
"uuid-generator":["UUID Generator","Generate unique UUID identifiers."],
"lorem-ipsum-generator":["Lorem Ipsum Generator","Generate placeholder text."],
"age-calculator":["Age Calculator","Calculate your age from your birth date."],
"percentage-calculator":["Percentage Calculator","Calculate percentages easily."],
"bmi-calculator":["BMI Calculator","Calculate your Body Mass Index."],
"gst-calculator":["GST Calculator","Calculate GST and total amounts."],
"image-compressor":["Image Compressor","Compress an image in your browser."],
"image-resizer":["Image Resizer","Resize an image in your browser."],
"unit-converter":["Unit Converter","Convert common length and weight units."],
"temperature-converter":["Temperature Converter","Convert Celsius, Fahrenheit and Kelvin."]
};


tools["random-number"] = ["Random Number Generator", "Generate random numbers within a chosen range."];
tools["scientific-calculator"] = ["Scientific Calculator", "Calculate expressions using scientific functions."];
const info = tools[slug] || tools["word-counter"];
$("heading").textContent = info[0];
$("description").textContent = info[1];

const workspace = $("workspace");
const result = $("result");

function field(id,label,type="text",placeholder="") {
 return `<label>${label}</label><input id="${id}" type="${type}" placeholder="${placeholder}">`;
}
function area(placeholder="Enter your text here...") {
 return `<textarea id="input" placeholder="${placeholder}"></textarea>`;
}
function button(label,action="run") {
 return `<button id="${action}">${label}</button>`;
}
function show(value) {
 result.textContent = value;
}
function setup(html,handler) {
 workspace.innerHTML=html;
 $("run")?.addEventListener("click",handler);
}
function downloadBlob(blob,name) {
 const url=URL.createObjectURL(blob);
 const a=document.createElement("a");
 a.href=url;a.download=name;a.click();
 URL.revokeObjectURL(url);
}

if(slug==="word-counter" || slug==="character-counter") {
 workspace.innerHTML=area()+`<div class="stats" id="stats"></div><button id="clear">Clear</button>`;
 const input=$("input");
 function count(){
  const t=input.value,trim=t.trim();
  const words=trim?trim.split(/\s+/).length:0;
  $("stats").innerHTML=`
  <p>Words: <b>${words}</b></p>
  <p>Characters: <b>${t.length}</b></p>
  <p>Without spaces: <b>${t.replace(/\s/g,"").length}</b></p>
  <p>Sentences: <b>${(t.match(/[.!?]+/g)||[]).length}</b></p>
  <p>Paragraphs: <b>${trim?trim.split(/\n\s*\n/).filter(Boolean).length:0}</b></p>`;
 }
 input.addEventListener("input",count);
 $("clear").onclick=()=>{input.value="";count();};
 count();
}
else if(slug==="case-converter") {
 setup(area()+`<button id="upper">UPPERCASE</button><button id="lower">lowercase</button><button id="title">Title Case</button><button id="sentence">Sentence case</button><button id="copy">Copy</button>`,()=>{});
 $("upper").onclick=()=> $("input").value=$("input").value.toUpperCase();
 $("lower").onclick=()=> $("input").value=$("input").value.toLowerCase();
 $("title").onclick=()=> $("input").value=$("input").value.toLowerCase().replace(/\b\w/g,c=>c.toUpperCase());
 $("sentence").onclick=()=> $("input").value=$("input").value.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g,c=>c.toUpperCase());
 $("copy").onclick=()=>navigator.clipboard.writeText($("input").value).then(()=>show("Copied!"));
}
else if(slug==="text-reverser") {
 setup(area()+button("Reverse text")+button("Copy","copy"),()=>{
  show($("input").value.split("").reverse().join(""));
 });
 $("copy").onclick=()=>navigator.clipboard.writeText(result.textContent).then(()=>show("Copied!"));
}
else if(slug==="json-formatter") {
 setup(area("Paste JSON here...")+button("Format JSON")+button("Minify","minify"),()=>{
  try{show(JSON.stringify(JSON.parse($("input").value),null,2));}
  catch(e){show("Invalid JSON: "+e.message);}
 });
 $("minify").onclick=()=>{try{show(JSON.stringify(JSON.parse($("input").value)));}catch(e){show("Invalid JSON: "+e.message);}};
}
else if(slug==="base64-encoder-decoder") {
 setup(area()+button("Encode")+button("Decode","decode"),()=>{
  try{show(btoa(unescape(encodeURIComponent($("input").value))));}
  catch(e){show("Could not encode this text.");}
 });
 $("decode").onclick=()=>{try{show(decodeURIComponent(escape(atob($("input").value.trim()))));}catch(e){show("Invalid Base64 input.");}};
}
else if(slug==="url-encoder-decoder") {
 setup(area()+button("Encode URL")+button("Decode URL","decode"),()=>{
  show(encodeURIComponent($("input").value));
 });
 $("decode").onclick=()=>{try{show(decodeURIComponent($("input").value));}catch(e){show("Invalid encoded URL.");}};
}
else if(slug==="html-formatter") {
 setup(area("Paste HTML code here...")+button("Format HTML"),()=>{
  const html=$("input").value;
  let indent=0;
  show(html.replace(/>\s*</g,">\n<").split("\n").map(line=>{
   const s=line.trim();
   if(/^<\/.+>/.test(s)) indent=Math.max(0,indent-1);
   const out="  ".repeat(indent)+s;
   if(/^<[^/!][^>]*[^/]?>$/.test(s)&&!/<\/[^>]+>$/.test(s)&&!/^<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)\b/i.test(s))indent++;
   return out;
  }).join("\n"));
 });
}
else if(slug==="password-generator") {
 setup(field("length","Password length","number","16")+`<label><input type="checkbox" id="symbols" checked> Include symbols</label>`+button("Generate Password")+button("Copy","copy"),()=>{
  const n=Math.max(4,Math.min(128,Number($("length").value)||16));
  const chars="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"+($("symbols").checked?"!@#$%^&*()-_=+?":"");
  let p="";
  const bytes=new Uint32Array(n);crypto.getRandomValues(bytes);
  for(const b of bytes)p+=chars[b%chars.length];
  show(p);
 });
 $("copy").onclick=()=>navigator.clipboard.writeText(result.textContent).then(()=>show("Copied!"));
}
else if(slug==="qr-code-generator") {
 setup(field("input","Text or URL","text","https://example.com")+button("Generate QR Code"),()=>{
  const value=$("input").value;
  if(!value){show("Enter text or a URL first.");return;}
  result.innerHTML=`<img alt="QR Code" style="max-width:260px;background:white;padding:12px;border-radius:12px" src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(value)}"><p>QR code generated. Long-press the image to save it.</p>`;
 });
}
else if(slug==="uuid-generator") {
 setup(field("amount","Number of UUIDs","number","5")+button("Generate UUIDs")+button("Copy","copy"),()=>{
  const n=Math.max(1,Math.min(100,Number($("amount").value)||5));
  show(Array.from({length:n},()=>crypto.randomUUID()).join("\n"));
 });
 $("copy").onclick=()=>navigator.clipboard.writeText(result.textContent).then(()=>show("Copied!"));
}
else if(slug==="lorem-ipsum-generator") {
 setup(field("amount","Number of paragraphs","number","3")+button("Generate")+button("Copy","copy"),()=>{
  const sample="Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
  const n=Math.max(1,Math.min(30,Number($("amount").value)||3));
  show(Array.from({length:n},()=>Array.from({length:5},()=>sample).join(" ")).join("\n\n"));
 });
 $("copy").onclick=()=>navigator.clipboard.writeText(result.textContent).then(()=>show("Copied!"));
}
else if(slug==="age-calculator") {
 setup(field("birth","Date of birth","date")+button("Calculate Age"),()=>{
  const d=new Date($("birth").value),now=new Date();
  if(!$("birth").value||d>now){show("Please enter a valid birth date.");return;}
  let years=now.getFullYear()-d.getFullYear(),months=now.getMonth()-d.getMonth(),days=now.getDate()-d.getDate();
  if(days<0){months--;days+=new Date(now.getFullYear(),now.getMonth(),0).getDate();}
  if(months<0){years--;months+=12;}
  show(`${years} years, ${months} months and ${days} days`);
 });
}
else if(slug==="percentage-calculator") {
 setup(field("a","What is this percentage?","number","20")+field("b","Of this number","number","200")+button("Calculate"),()=>{
  const a=Number($("a").value),b=Number($("b").value);
  show(Number.isFinite(a*b/100)?`${a}% of ${b} = ${a*b/100}`:"Enter valid numbers.");
 });
}
else if(slug==="bmi-calculator") {
 setup(field("weight","Weight (kg)","number","70")+field("height","Height (cm)","number","175")+button("Calculate BMI"),()=>{
  const w=Number($("weight").value),h=Number($("height").value)/100;
  if(w<=0||h<=0){show("Enter valid weight and height.");return;}
  const bmi=w/(h*h);
  show(`BMI: ${bmi.toFixed(1)}\nThis is a screening estimate, not a medical diagnosis.`);
 });
}
else if(slug==="gst-calculator") {
 setup(field("amount","Amount before GST","number","1000")+field("rate","GST rate (%)","number","18")+button("Calculate GST"),()=>{
  const a=Number($("amount").value),r=Number($("rate").value);
  if(a<0||r<0){show("Enter valid positive values.");return;}
  show(`GST: ${(a*r/100).toFixed(2)}\nTotal: ${(a+a*r/100).toFixed(2)}`);
 });
}
else if(slug==="image-compressor"||slug==="image-resizer") {
 setup(field("file","Choose an image","file")+ (slug==="image-resizer"?field("width","New width (pixels)","number","800")+field("height","New height (pixels)","number","600"):"")+field("quality","Image quality (0.1–1)","number","0.7")+button("Process Image"));
 $("quality").step="0.1";$("quality").min="0.1";$("quality").max="1";
 $("run").onclick=()=>{
  const file=$("file").files[0];
  if(!file||!file.type.startsWith("image/")){show("Choose a valid image.");return;}
  const img=new Image(),url=URL.createObjectURL(file);
  img.onload=()=>{
   const canvas=document.createElement("canvas");
   const w=slug==="image-resizer"?(Number($("width").value)||800):img.width;
   const h=slug==="image-resizer"?(Number($("height").value)||600):Math.round(img.height*w/img.width);
   canvas.width=w;canvas.height=h;
   canvas.getContext("2d").drawImage(img,0,0,w,h);
   canvas.toBlob(blob=>{
    if(!blob){show("Image processing failed.");return;}
    const out=URL.createObjectURL(blob);
    result.innerHTML=`<p>Original: ${(file.size/1024).toFixed(1)} KB</p><p>New: ${(blob.size/1024).toFixed(1)} KB</p><a style="color:#55e5f5" href="${out}" download="toolverse-image.jpg">Download processed image</a>`;
    URL.revokeObjectURL(url);
   },"image/jpeg",Math.max(.1,Math.min(1,Number($("quality").value)||.7)));
  };
  img.src=url;
 };
}
else if(slug==="random-number") {
 setup(field("minimum","Minimum number","number","1")+field("maximum","Maximum number","number","100")+button("Generate Number"),()=>{
  const min=Number($("minimum").value),max=Number($("maximum").value);
  if(!Number.isInteger(min)||!Number.isInteger(max)||max<min){show("Enter valid whole numbers. Maximum must be at least minimum.");return;}
  show(String(Math.floor(Math.random()*(max-min+1))+min));
 });
}
else if(slug==="scientific-calculator") {
 setup(field("input","Enter a calculation","text","sqrt(25) + sin(30)")+button("Calculate"),()=>{
  let expression=$("input").value.trim();
  const funcs=["sqrt","sin","cos","tan","log","abs","round","floor","ceil"];
  for(const name of funcs) expression=expression.replace(new RegExp("\\b"+name+"\\b","g"),"Math."+name);
  expression=expression.replace(/\\bpi\\b/gi,"Math.PI").replace(/\\be\\b/g,"Math.E");
  if(!/^[0-9+*/().,%\\sMathsqr tincogflab]+$/i.test(expression)){show("Unsupported expression. Use numbers, operators and functions such as sqrt(), sin(), cos() and log().");return;}
  try {
   const value=Function('"use strict";return ('+expression+')')();
   show(Number.isFinite(value)?String(value):"Invalid calculation.");
  } catch(e) { show("Invalid calculation. Check your expression."); }
 });
}
else if(slug==="unit-converter") {
 setup(`<label>Conversion</label><select id="kind"><option value="m-km">Metres to kilometres</option><option value="km-m">Kilometres to metres</option><option value="kg-g">Kilograms to grams</option><option value="g-kg">Grams to kilograms</option><option value="cm-in">Centimetres to inches</option><option value="in-cm">Inches to centimetres</option><option value="mi-km">Miles to kilometres</option></select>`+field("value","Value","number","100")+button("Convert"),()=>{
  const v=Number($("value").value),k=$("kind").value;
  const factors={"m-km":.001,"km-m":1000,"kg-g":1000,"g-kg":.001,"cm-in":1/2.54,"in-cm":2.54,"mi-km":1.609344};
  show((v*factors[k]).toLocaleString(undefined,{maximumFractionDigits:6}));
 });
}
else if(slug==="temperature-converter") {
 setup(`<label>Convert from</label><select id="from"><option>Celsius</option><option>Fahrenheit</option><option>Kelvin</option></select><label>Convert to</label><select id="to"><option>Celsius</option><option>Fahrenheit</option><option>Kelvin</option></select>`+field("value","Temperature","number","25")+button("Convert"),()=>{
  const v=Number($("value").value),f=$("from").value,t=$("to").value;
  let c=f==="Celsius"?v:f==="Fahrenheit"?(v-32)*5/9:v-273.15;
  const out=t==="Celsius"?c:t==="Fahrenheit"?c*9/5+32:c+273.15;
  show(`${out.toFixed(2)} ${t}`);
 });
}
else {
 show("Tool not found. Return to the TOOLVERSE homepage.");
}
