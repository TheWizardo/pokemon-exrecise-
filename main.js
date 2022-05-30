(function() {
    document.addEventListener('DOMContentLoaded', async function() {
        let pokeShapes = await getDataFromURL(`https://pokeapi.co/api/v2/pokemon-shape`);
        console.table(pokeShapes.results);

        loadDivs(pokeShapes, "results")
    });
})();

async function getDataFromURL(url){
    let rawRes = await fetch(url)
    return rawRes.json();
}

function loadDivs(objs, entry){
    for (let obj of objs[entry]) {
        let newDiv = document.createElement("div");
        newDiv.innerText = obj.name;
        newDiv.setAttribute("next-info", obj.url)
        newDiv.addEventListener("click", divClicked)
        document.getElementById("container-div").append(newDiv);
    };
}

function divClicked(event){
    document.getElementById("prog").value += 1/3 * 100;
    console.dir(event.target.getAttribute("next-info"));
}