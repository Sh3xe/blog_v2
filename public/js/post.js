let last = document.getElementById("last");
let next = document.getElementById("next");
let container = document.querySelector(".comments");

const urlParams = new URLSearchParams(window.location.search);
let curr_start = parseInt(urlParams.get("start")) || 0;

next.addEventListener("click", e=>{
    e.preventDefault();
    if(container.childElementCount == 6){
        curr_start += 6;
        window.location.replace(`${window.location.pathname}?start=${curr_start}`);
    }
});

last.addEventListener("click", e=>{
    e.preventDefault();
    if(curr_start >= 6 ){
        curr_start -= 6;
        window.location.replace(`${window.location.pathname}?start=${curr_start}`);
    }
});

if(container.childElementCount == 0){
    if(curr_start >= 6 ) {curr_start -= 6;window.location.replace(`${window.location.pathname}?start=${curr_start}`);}
}