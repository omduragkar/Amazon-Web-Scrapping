let rangefrom = document.querySelector("input[name=rangefrom]");
let rangeto = document.querySelector("input[name=rangeto]");
let na = document.querySelector("input[name=name]");
let pincode = document.querySelector("input[name=pincode]");
let btn = document.querySelector("button[type=submit]");

btn.addEventListener('click',async function(e){
    e.preventDefault();
    let obj = {
        name:na.value,
        rangefrom:rangefrom.value,
        rangeto:rangeto.value,
        pincode:pincode.value,
    }
    console.log(obj);
    var url = "http://localhost:5000/workon";

    // var xhr = new XMLHttpRequest();
    // xhr.open("POST", url);

    // xhr.setRequestHeader("Accept", "application/json");
    // xhr.setRequestHeader("Content-Type", "application/json");

    // xhr.onreadystatechange = function () {
    // if (xhr.readyState === 4) {
    //     console.log(xhr.responseText);
    // }};
    // xhr.send(obj);
    const response = await fetch(url, {
    method: 'POST',
    headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
    },
    body: JSON.stringify(obj),
    });

    response.json().then(data => {
    console.log(data);
    });

})