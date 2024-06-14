document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('details.html')) {
        fetchAndDisplayCountryDetails();
    } else {
        // Set up routing
        window.addEventListener('popstate', handleRoute);
        handleRoute();

        // Event listener for search input
        document.getElementById('search-input').addEventListener('input', handleSearch);
    }
});

// Function to show loading indicator
function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
}

// Function to hide loading indicator
function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}

// Function to fetch country data from the API with a timeout
async function fetchCountryData(countryName) {
    try {
        showLoading();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

        const response = await fetch(`https://restcountries.com/v3.1/name/${countryName}`, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error('Country not found');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching country data:', error);
        throw error;
    } finally {
        hideLoading();
    }
}

// Function to fetch multiple country data concurrently with a timeout
async function fetchMultipleCountryData(countryNames) {
    try {
        showLoading();
        const promises = countryNames.map(name => fetchCountryData(name));
        const countries = await Promise.all(promises);
        return countries;
    } catch (error) {
        console.error('Error fetching multiple country data:', error);
        throw error;
    } finally {
        hideLoading();
    }
}

// Function to display country data
function displayCountryData(countries) {
    const countryList = document.getElementById('country-list');
    countryList.innerHTML = '';

    countries.flat().forEach(country => {
        const countryItem = document.createElement('div');
        countryItem.className = 'country-item p-4 bg-white rounded shadow-md';

        const countryName = country.name.common;
        const capital = country.capital ? country.capital[0] : 'N/A';
        const region = country.region;
        const flag = country.flags.svg;

        countryItem.innerHTML = `
            <img src="${flag}" alt="${countryName} flag" class="w-full h-32 object-cover mb-4">
            <h2 class="text-xl font-bold mb-2">${countryName}</h2>
            <p><strong>Capital:</strong> ${capital}</p>
            <p><strong>Region:</strong> ${region}</p>
            <button class="details-btn" onclick="showDetails('${countryName}')">Details</button>
        `;

        countryList.appendChild(countryItem);
    });
}

// Function to handle search input
function handleSearch() {
    const searchInput = document.getElementById('search-input');
    const query = searchInput.value.trim();
    const errorMessage = document.getElementById('error-message');

    if (query) {
        const countryNames = query.split(',').map(name => name.trim());
        fetchMultipleCountryData(countryNames).then(data => {
            if (data) {
                displayCountryData(data);
                errorMessage.classList.add('hidden');
            }
        }).catch(error => {
            errorMessage.classList.remove('hidden');
        });
    }
}

// Function to handle routing
function handleRoute() {
    const path = window.location.pathname;
    const countryDetails = document.getElementById('country-details');
    const searchSection = document.getElementById('search-section');
    const countryList = document.getElementById('country-list');

    if (path.startsWith('/country/')) {
        const countryName = path.split('/country/')[1];
        fetchCountryData(countryName).then(data => {
            if (data && data.length > 0) {
                displayCountryDetails(data[0]);
            } else {
                searchSection.classList.remove('hidden');
                countryList.classList.remove('hidden');
                countryDetails.classList.add('hidden');
            }
        }).catch(error => {
            searchSection.classList.remove('hidden');
            countryList.classList.remove('hidden');
            countryDetails.classList.add('hidden');
        });
    } else {
        searchSection.classList.remove('hidden');
        countryList.classList.remove('hidden');
        countryDetails.classList.add('hidden');
    }
}

// Function to show details page
function showDetails(countryName) {
    window.location.href = `details.html?country=${countryName}`;
}

// Fetch and display country details on the details page
function fetchAndDisplayCountryDetails() {
    const params = new URLSearchParams(window.location.search);
    const countryName = params.get('country');
    if (countryName) {
        fetchCountryData(countryName).then(data => {
            if (data && data.length > 0) {
                displayCountryDetails(data[0]);
                document.getElementById('country-details').classList.remove('hidden');
            }
        }).catch(error => {
            console.error('Error fetching country data:', error);
        });
    }
}

// Function to display detailed country data
function displayCountryDetails(country) {
    document.getElementById('country-name').innerText = country.name.common;
    document.getElementById('country-flag').src = country.flags.svg;
    document.getElementById('common-name').innerText = country.name.common;
    document.getElementById('official-name').innerText = country.name.official;
    document.getElementById('common-native-name').innerText = country.nativeName ? Object.values(country.nativeName)[0].common : 'N/A';
    document.getElementById('official-native-name').innerText = country.nativeName ? Object.values(country.nativeName)[0].official : 'N/A';
    document.getElementById('alt-spelling').innerText = country.altSpellings.join(', ');
    document.getElementById('translations').innerText = Object.values(country.translations).map(t => t.common).join(', ');
    document.getElementById('iso-alpha-2').innerText = country.cca2;
    document.getElementById('iso-alpha-3').innerText = country.cca3;
    document.getElementById('iso-numeric').innerText = country.ccn3;
    document.getElementById('intl-calling').innerText = country.idd.root + country.idd.suffixes[0];
    document.getElementById('currency-code').innerText = Object.keys(country.currencies).join(', ');
    document.getElementById('tld').innerText = country.tld.join(', ');
    document.getElementById('region').innerText = country.region;
    document.getElementById('subregion').innerText = country.subregion;
    document.getElementById('capital').innerText = country.capital ? country.capital[0] : 'N/A';
    document.getElementById('demonym').innerText = country.demonyms ? country.demonyms.eng.m : 'N/A';
    document.getElementById('latlng').innerText = country.latlng.join(', ');
    document.getElementById('area').innerText = country.area.toLocaleString() + ' sq km';
    document.getElementById('borders').innerText = country.borders ? country.borders.join(', ') : 'N/A';
    document.getElementById('native-language').innerText = Object.values(country.languages)[0];
    document.getElementById('languages').innerText = Object.values(country.languages).join(', ');
}
