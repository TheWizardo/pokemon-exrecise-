(function () {
    document.addEventListener('DOMContentLoaded', async function () {
        let pokeShapes = await getDataFromURL(`https://pokeapi.co/api/v2/pokemon-shape`);
        loadDivs(pokeShapes, "results")
    });
})();

async function getDataFromURL(url) {
    let rawRes = await fetch(url)
    return rawRes.json();
}

function loadDivs(objs, enrty) {
    for (let obj of objs[enrty]) {
        let newDiv = document.createElement("div");
        if (obj.name !== undefined) {
            newDiv.innerText = obj.name.charAt(0).toUpperCase() + obj.name.slice(1)
        }
        else {
            newDiv.innerText = obj.pokemon.name.charAt(0).toUpperCase() + obj.pokemon.name.slice(1);
        }
        newDiv.setAttribute("next-info", obj.url || obj.pokemon.url)
        newDiv.addEventListener("click", divClicked)
        newDiv.className = `option-div`;
        document.getElementById("container-div").append(newDiv);
    };
}

function divClicked(event) {
    (async () => {
        const progBar = document.getElementById("prog");
        progBar.value += 100 / 3;
        let nextURL = event.target.getAttribute("next-info");

        if (Math.floor(progBar.value) < 80) {
            document.getElementById("container-div").innerHTML = '';
            let data = await getDataFromURL(nextURL);
            loadDivs(data, Math.floor(progBar.value) < 40 ? "pokemon_species" : "varieties");
        }
        else {
            showPokemon(nextURL)
        }
    })();
}

function showPokemon(url) {
    (async () => {
        let pokemon = await getDataFromURL(url);
        document.getElementById("pokeName").innerHTML = `${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} <span class="pokedex-id">#${pokemon.id}</span>`;
        document.getElementById("pokeImage").setAttribute("src", pokemon.sprites.front_default)
        let types = document.getElementById("type-div");
        types.innerHTML = '';
        for (let t of pokemon.types) {
            let newType = document.createElement("div");
            newType.innerText = t.type.name.toUpperCase();
            newType.className = `background-color-${t.type.name} round`;
            types.appendChild(newType);
        }

        document.getElementById("pokeModal").style.display = "block";
    })();
}

function closeModal() {
    document.getElementById("pokeModal").style.display = "none";
}