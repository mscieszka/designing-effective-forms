let clickCount = 0;
let choicesInstance;

const countryInput = document.getElementById('country');
const myForm = document.getElementById('form');
const modal = document.getElementById('form-feedback-modal');
const clicksInfo = document.getElementById('click-count');
const countryCodeInput = document.getElementById('countryCode')

function handleClick() {
    clickCount++;
    clicksInfo.innerText = clickCount;
}

async function fetchAndFillCountries() {
    try {
        const response = await fetch('https://restcountries.com/v3.1/all');
        if (!response.ok) {
            throw new Error('Błąd pobierania danych');
        }
        const data = await response.json();
        const countries = data.map(country => country.name.common).sort();
        countryInput.innerHTML = '<option value="">Wybierz kraj</option>' +
            countries.map(country => `<option value="${country}">${country}</option>`).join('');

        // Inicjalizacja Choices.js
        if (choicesInstance) {
            choicesInstance.destroy();
        }
        choicesInstance = new Choices(countryInput, {
            searchEnabled: true,
            itemSelectText: '',
            shouldSort: false,
        });
        countryInput.addEventListener('change', (e) => {
            const selectedCountry = e.target.value;
            if (selectedCountry) {
                getCountryCode(selectedCountry);
            }
        });
    } catch (error) {
        console.error('Wystąpił błąd:', error);
    }
}

function getCountryByIP() {
    fetch('https://get.geojs.io/v1/ip/geo.json')
        .then(response => response.json())
        .then(data => {
            const country = data.country;

            if (choicesInstance) {
                const option = Array.from(countryInput.options).find(opt => opt.value === country);
                if (option) {
                    choicesInstance.setChoiceByValue(country);
                    getCountryCode(country);
                }
            } else {
                countryInput.value = country;
                getCountryCode(country);
            }
        })
        .catch(error => {
            console.error('Błąd pobierania danych z serwera GeoJS:', error);
        });
}
function getCountryCode(countryName) {
    const apiUrl = `https://restcountries.com/v3.1/name/${countryName}?fullText=true`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Błąd pobierania danych');
            }
            return response.json();
        })
        .then(data => {
            const code = data[0].idd.root; // Only the root
            const optionExists = Array.from(countryCodeInput.options).some(opt => opt.value === code);

            if (optionExists) {
                countryCodeInput.value = code;
            } else {
                const newOption = document.createElement("option");
                newOption.value = code;
                newOption.textContent = `${code} (${countryName})`;
                countryCodeInput.appendChild(newOption);
                countryCodeInput.value = code;
            }
        })
        .catch(error => {
            console.error('Wystąpił błąd:', error);
        });
}

(() => {
    // nasłuchiwania na zdarzenie kliknięcia myszką
    document.addEventListener('click', handleClick);

    fetchAndFillCountries();
    getCountryByIP();
})()
