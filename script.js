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
            const idd = data[0].idd;
            const root = idd.root || "";
            const suffixes = idd.suffixes || [];
            const fullCode = suffixes.length > 0 ? root + suffixes[0] : root;

            const optionExists = Array.from(countryCodeInput.options).some(opt => opt.value === fullCode);

            if (optionExists) {
                countryCodeInput.value = fullCode;
            } else {
                const newOption = document.createElement("option");
                newOption.value = fullCode;
                newOption.textContent = `${fullCode} (${countryName})`;
                countryCodeInput.appendChild(newOption);
                countryCodeInput.value = fullCode;
            }
        })
        .catch(error => {
            console.error('Wystąpił błąd:', error);
        });
}

(async () => {
    // nasłuchiwania na zdarzenie kliknięcia myszką
    document.addEventListener('click', handleClick);

    await fetchAndFillCountries();
    getCountryByIP();
})()

document.querySelectorAll('.custom-radio-group').forEach(group => {
    const radios = group.querySelectorAll('input[type="radio"]');
    group.addEventListener('keydown', e => {
        const current = document.activeElement;
        if (!current || current.tagName !== 'LABEL') return;
        let idx = Array.from(group.querySelectorAll('label')).indexOf(current);
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            let next = (idx + 1) % radios.length;
            radios[next].focus();
            group.querySelectorAll('label')[next].focus();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            let prev = (idx - 1 + radios.length) % radios.length;
            radios[prev].focus();
            group.querySelectorAll('label')[prev].focus();
        } else if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            radios[idx].checked = true;
        }
    });
    group.querySelectorAll('label').forEach((label, i) => {
        label.addEventListener('focus', () => radios[i].focus());
        label.addEventListener('click', () => radios[i].checked = true);
    });
});
