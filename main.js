(function () {
    let baseURL = `https://pokeapi.co/api/v2/pokemon-shape`;
    document.addEventListener('DOMContentLoaded', async function () {
        await loadDivs("", "", baseURL, "results");
    });
})();

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

async function getDataFromURL(url) {
    let rawRes = await fetch(url);
    return rawRes.json();
}

async function loadDivs(grandparentURL, parentURL, selfURL, enrty) {
    console.log(selfURL, enrty);
    let data = await getDataFromURL(selfURL);
    for (let obj of data[enrty]) {
        let newDiv = document.createElement("div");
        newDiv.innerText = obj.name !== undefined ? capitalize(obj.name) : capitalize(obj.pokemon.name);
        newDiv.setAttribute("grandparent-info", grandparentURL);
        newDiv.setAttribute("parent-info", parentURL);
        newDiv.setAttribute("self-info", selfURL);
        newDiv.setAttribute("next-info", obj.url || obj.pokemon.url);
        newDiv.addEventListener("click", divClicked);
        newDiv.className = `option-div`;
        document.getElementById("container-div").append(newDiv);
    }
}

function divClicked(event) {
    document.getElementById("back-btn").disabled = false;
    (async () => {
        const progBar = document.getElementById("prog");
        progBar.value += 100 / 3;
        let nextURL = event.target.getAttribute("next-info");

        if (Math.floor(progBar.value) < 80) {
            document.getElementById("container-div").innerHTML = '';
            await loadDivs(event.target.getAttribute("parent-info"), event.target.getAttribute("self-info"), nextURL, Math.floor(progBar.value) < 40 ? "pokemon_species" : "varieties");
        }
        else {
            showPokemon(nextURL)
        }
    })();
}

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

function updateTooltip(event) {
    let x = event.clientX;
    let y = event.clientY;
    let tooltip = document.getElementById("tooltip-span");
    tooltip.style.top = (y + 20) + 'px';
    tooltip.style.left = (x + 20) + 'px';
}

function mouseHover(event) {
    updateTooltip(event);
    let tooltip = document.getElementById("tooltip-span");
    tooltip.style.display = "block";
    tooltip.innerText = event.target.value;
    document.addEventListener("mousemove", updateTooltip);
}

function mouseExit(event) {
    document.removeEventListener("mousemove", updateTooltip);
    document.getElementById("tooltip-span").style.display = "none";
}

function toggleShiny(event) {
    let curSrc = event.target.getAttribute('src');
    if (curSrc.lastIndexOf('shiny') < 0) {
        event.target.setAttribute('src', curSrc.slice(0, 73) + 'shiny/' + curSrc.slice(73))
    }
    else {
        event.target.setAttribute('src', curSrc.slice(0, 73) + curSrc.slice(79))
    }
}

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

function closeModal() {
    document.getElementById("prog").value -= 100 / 3;
    document.getElementById("pokeModal").style.display = "none";
}

function goBack(btn) {
    const progBar = document.getElementById("prog");
    progBar.value -= 100 / 3;
    if (progBar.value < 10) {
        btn.disabled = true;
    }

    let firstDiv = document.getElementById("container-div").firstChild;
    let parentURL = firstDiv.getAttribute("parent-info");
    let grandparentURL = firstDiv.getAttribute("grandparent-info");
    document.getElementById("container-div").innerHTML = '';
    (async () => {
        await loadDivs("", grandparentURL, parentURL, Math.floor(progBar.value) < 20 ? "results" : "pokemon_species");
    })();
}