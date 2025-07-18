const content = document.querySelector('main')
const pageTitle = document.querySelector('title')
const pageFavIcon = document.querySelector('link[rel="shortcut icon"]')

function getPokemonIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

async function loadPokemonDetails() {
    const pokemonId = getPokemonIdFromUrl();

    if (pokemonId) {
        const [pokemonData, speciesData] = await Promise.all([
            fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`).then(res => res.json()),
            fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`).then(res => res.json())
        ]);

        content.innerHTML += renderPokemonDetails(pokemonData, speciesData);
        document.getElementById('backButton').addEventListener('click', () => {
            history.back()
        })

        const [type] = pokemonData.types.map((typeSlot) => typeSlot.type.name);
        content.className = type;
        pageTitle.innerHTML = pokemonData.name;
        pageFavIcon.href = pokemonData.sprites.other.dream_world.front_default;
    }
}

function renderPokemonDetails(pokemonData, speciesData) {
    const types = pokemonData.types.map((typeSlot) => typeSlot.type.name)
    const abilities = pokemonData.abilities.map((abilitySlot) => abilitySlot.ability.name)
    const eggGroups = speciesData.egg_groups.map((group) => group.name)
    const genera = speciesData.genera.filter((specie) => specie.language.name === "en").map((specie) => specie.genus)

    const height = pokemonData.height / 10;

    // Converte para pés
    const totalFeet = height * 3.28084;

    // Separa pés e polegadas
    const feet = Math.floor(totalFeet);
    const inches = Math.round((totalFeet - feet) * 12);

    const weight = pokemonData.weight / 10;
    const weightInLbs = (weight * 2.20462).toFixed(1);

    const femalePercentage = speciesData.gender_rate * 12.5;
    const malePercentage = 100 - femalePercentage;

    return `
        <section class="pokemon-basic-informations">
            <h1>${pokemonData.name}</h1>

            <ol>
                ${types.map((type) => `<li class="${type}">${type}</li>`).join('')}
            </ol>

            <p>#${pokemonData.id}</p>
        </section>

        <img class="pokemon-img" src="${pokemonData.sprites.other.dream_world.front_default}" alt="${pokemonData.name}">

        <section class="pokemon-details">
            <nav>
                <ol>
                    <li><button class="details-button" id="current-info" onclick="switchTab('about', this)">About</button></li>
                    <li><button class="details-button" onclick="switchTab('stats', this)">Base Stats</button></li>
                    <li><button class="details-button" onclick="switchTab('evolution', this)">Evolution</button></li>
                    <li><button class="details-button" onclick="switchTab('moves', this)">Moves</button></li>
                </ol>
            </nav>

            <div class="details" id='about'>
                <div>
                    <strong>Species</strong>
                    <p>${genera}</p>
                    <strong>Height</strong>
                    <p>${feet}'${inches} (${height} m)</p>
                    <strong>Weight</strong>
                    <p>${weightInLbs} lbs (${weight} kg)</p>
                    <strong>Abilities</strong>
                    <p>${abilities.map((ability) => `${ability}`).join(', ')}</p>
                </div>

                <h2>Breeding</h2>

                <div>
                    <strong>Gender</strong>
                    <div class="gender-info">
                        <div>
                            <img src="assets/images/male.png" alt="Símbolo de Gênero Masculino">
                            <p>${malePercentage}%</p>
                        </div>
                        <div>
                            <img src="assets/images/female.png" alt="Símbolo de Gênero Feminino">
                            <p>${femalePercentage}%</p>
                        </div>
                    </div>
                    <strong>Egg Groups</strong>
                    <p>${eggGroups.map((group) => `${group}`).join(', ')}</p>
                    <strong>Egg Cycle</strong>
                    <p>${speciesData.hatch_counter}</p>
                </div>
            </div>

            <div class="details" id="stats" hidden>
                <p>Base Stats</p>
            </div>

            <div class="details" id="evolution" hidden>
                <p>Evolution</p>
            </div>

            <div class="details" id="moves" hidden>
                <p>Moves</p>
            </div>
        </section>
    `
}

loadPokemonDetails();

function switchTab(tabId, clickedButton) {
    const content = document.querySelectorAll('.details');
    content.forEach(element => element.hidden = true);

    const button = document.querySelectorAll('.details-button');
    button.forEach(element => element.removeAttribute('id'))

    document.getElementById(tabId).hidden = false;
    clickedButton.id = 'current-info';
}