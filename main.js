let pastInfo = [];

(function () {
    let baseURL = `https://pokeapi.co/api/v2/pokemon-shape`;
    document.addEventListener('DOMContentLoaded', async function () {
        await loadDivs(baseURL, "results");
    });
})();

// capitalizes the first letter of the word
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// fetching data from a given url
async function getDataFromURL(url) {
    let rawRes = await fetch(url);
    return rawRes.json();
}

// loading the current divs on screen from selfURL
async function loadDivs(dataURL, enrty) {
    let data = await getDataFromURL(dataURL);

    for (let obj of data[enrty]) {
        let newDiv = document.createElement("div");
        newDiv.innerText = obj.name !== undefined ? capitalize(obj.name) : capitalize(obj.pokemon.name);
        newDiv.setAttribute("next-info", obj.url || obj.pokemon.url);
        newDiv.setAttribute("self-info", dataURL);
        newDiv.addEventListener("click", divClicked);
        newDiv.className = `option-div`;
        document.getElementById("container-div").append(newDiv);
    }
}

// handeling of div clicking
function divClicked(event) {
    document.getElementById("back-btn").disabled = false;
    (async () => {
        const progBar = document.getElementById("prog");
        progBar.value += 100 / 3;
        let nextURL = event.target.getAttribute("next-info");

        if (Math.floor(progBar.value) < 80) {
            document.getElementById("container-div").innerHTML = '';
            pastInfo.push(event.target.getAttribute("self-info"));
            await loadDivs(nextURL, Math.floor(progBar.value) < 40 ? "pokemon_species" : "varieties");
        }
        else {
            showPokemon(nextURL)
        }
    })();
}

// displaying the selected pokemon modal
function showPokemon(url) {
    (async () => {
        let pokemon = await getDataFromURL(url);

        document.getElementById("pokeName").innerHTML = `${capitalize(pokemon.name)} <span class="pokedex-id">#${pokemon.id}</span>`;

        let image = document.getElementById("pokeImage");
        image.setAttribute("src", pokemon.sprites.front_default);
        image.addEventListener("click", toggleShiny);

        let types = document.getElementById("type-div");
        types.innerHTML = '';
        for (let t of pokemon.types) {
            let newType = document.createElement("div");
            newType.innerText = t.type.name.toUpperCase();
            newType.className = `background-color-${t.type.name} round`;
            types.appendChild(newType);
        }

        let weight = document.getElementById("pokeWeight");
        weight.innerText = `${pokemon.weight / 10} Kg`;
        weight.addEventListener("click", wUnitConvert)

        let height = document.getElementById("pokeHeight");
        height.innerText = `${pokemon.height * 10} Cm`;
        height.addEventListener("click", hUnitConvert)

        let abilityRow = document.getElementById("ability-row");
        abilityRow.innerHTML = '<th>Abilities:</th>';
        for (let a of pokemon.abilities) {
            let cell = document.createElement("td");
            cell.innerText = capitalize(a.ability.name);
            abilityRow.appendChild(cell);
        }
        for (let s of pokemon.stats) {
            let statProg = document.getElementById(`${s.stat.name}-stat`);
            statProg.addEventListener("mouseover", mouseHover)
            statProg.addEventListener("mouseleave", mouseExit)
            statProg.value = s.base_stat;
        }

        document.getElementById("pokeModal").style.display = "block";
    })();
}

// updating tooltip place
function updateTooltip(event) {
    let x = event.clientX;
    let y = event.clientY;
    let tooltip = document.getElementById("tooltip-span");
    tooltip.style.top = (y + 20) + 'px';
    tooltip.style.left = (x + 20) + 'px';
}

// showing tooltip
function mouseHover(event) {
    updateTooltip(event);
    let tooltip = document.getElementById("tooltip-span");
    tooltip.style.display = "block";
    tooltip.innerText = event.target.value;
    document.addEventListener("mousemove", updateTooltip);
}

// hiding tooltip and stopping update
function mouseExit(event) {
    document.removeEventListener("mousemove", updateTooltip);
    document.getElementById("tooltip-span").style.display = "none";
}

// toggling between shiny and default images
function toggleShiny(event) {
    let curSrc = event.target.getAttribute('src');
    if (curSrc.lastIndexOf('shiny') < 0) {
        event.target.setAttribute('src', curSrc.slice(0, 73) + 'shiny/' + curSrc.slice(73))
    }
    else {
        event.target.setAttribute('src', curSrc.slice(0, 73) + curSrc.slice(79))
    }
}

// unit convertion for weight
function wUnitConvert(event) {
    let quantity = parseFloat(event.target.innerText.split(' ')[0]);
    let units = event.target.innerText.split(' ')[1];
    if (units === "Kg") {
        document.getElementById('pokeWeight').innerText = `${Math.floor(100 * quantity * 2.2) / 100} Lbs`;
    }
    else {
        document.getElementById('pokeWeight').innerText = `${Math.round(10 * quantity / 2.2) / 10} Kg`;
    }
}

// unit convertion for height
function hUnitConvert(event) {
    let quantity = parseFloat(event.target.innerText.split(' ')[0]);
    let units = event.target.innerText.split(' ')[1];
    if (units === "Cm") {
        document.getElementById('pokeHeight').innerText = `${Math.round(10 * quantity / 2.54) / 10} In`;
    }
    else {
        document.getElementById('pokeHeight').innerText = `${Math.round(quantity * 2.54)} Cm`;
    }
}

// closing the modal
function closeModal() {
    document.getElementById("prog").value -= 100 / 3;
    document.getElementById("pokeModal").style.display = "none";
}

// handaling back button press
function goBack(btn) {
    const progBar = document.getElementById("prog");
    progBar.value -= 100 / 3;
    if (progBar.value < 10) {
        btn.disabled = true;
    }

    let firstDiv = document.getElementById("container-div").firstChild;
    document.getElementById("container-div").innerHTML = '';
    (async () => {
        await loadDivs(pastInfo.pop(), Math.floor(progBar.value) < 20 ? "results" : "pokemon_species");
    })();
}