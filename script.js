// REST Countries API - JavaScript Funcional
// Aplicación completamente funcional con API real

// Variables globales
let allCountries = [];
let filteredCountries = [];
let currentTheme = 'light';

// Elementos del DOM
const searchInput = document.getElementById('searchInput');
const regionFilter = document.getElementById('regionFilter');
const countriesGrid = document.getElementById('countriesGrid');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');
const themeToggle = document.getElementById('themeToggle');
const countryModal = document.getElementById('countryModal');
const modalBody = document.getElementById('modalBody');
const closeModal = document.getElementById('closeModal');

// API Configuration
const API_BASE_URL = 'https://restcountries.com/v3.1';

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando REST Countries API...');
    initializeApp();
});

/**
 * Inicializa la aplicación
 */
function initializeApp() {
    setupEventListeners();
    loadCountries();
    loadTheme();
}

/**
 * Configura todos los event listeners
 */
function setupEventListeners() {
    // Búsqueda
    searchInput.addEventListener('input', handleSearch);
    
    // Filtro por región
    regionFilter.addEventListener('change', handleRegionFilter);
    
    // Toggle de tema
    themeToggle.addEventListener('click', toggleTheme);
    
    // Modal
    closeModal.addEventListener('click', closeCountryModal);
    countryModal.addEventListener('click', function(e) {
        if (e.target === countryModal) {
            closeCountryModal();
        }
    });
    
    // Escape para cerrar modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeCountryModal();
        }
    });
}

/**
 * Carga todos los países desde la API
 */
async function loadCountries() {
    try {
        showLoading(true);
        console.log('🌍 Cargando países desde la API...');
        
        const response = await fetch(`${API_BASE_URL}/all`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        allCountries = await response.json();
        filteredCountries = [...allCountries];
        
        console.log(`✅ ${allCountries.length} países cargados desde la API`);
        renderCountries(filteredCountries);
        
    } catch (error) {
        console.error('❌ Error al cargar países desde la API:', error);
        console.log('🔄 Intentando cargar datos locales...');
        
        // Fallback con datos locales
        try {
            await loadLocalCountries();
        } catch (localError) {
            console.error('❌ Error al cargar datos locales:', localError);
            showError('Error al cargar los países. Verifica tu conexión a internet.');
        }
    } finally {
        showLoading(false);
    }
}

/**
 * Carga países desde datos locales como fallback
 */
async function loadLocalCountries() {
    try {
        const response = await fetch('./rest-countries-api-with-color-theme-switcher-master/rest-countries-api-with-color-theme-switcher-master/data.json');
        
        if (!response.ok) {
            throw new Error('No se pudieron cargar los datos locales');
        }
        
        allCountries = await response.json();
        filteredCountries = [...allCountries];
        
        console.log(`✅ ${allCountries.length} países cargados desde datos locales`);
        renderCountries(filteredCountries);
        
    } catch (error) {
        console.error('❌ Error al cargar datos locales:', error);
        
        // Último recurso: datos de ejemplo
        loadSampleCountries();
    }
}

/**
 * Carga países de ejemplo como último recurso
 */
function loadSampleCountries() {
    console.log('🔄 Cargando países de ejemplo...');
    
    allCountries = [
        {
            name: { common: "Spain", official: "Kingdom of Spain" },
            population: 47351567,
            region: "Europe",
            capital: ["Madrid"],
            flags: { png: "https://flagcdn.com/w320/es.png" },
            cca3: "ESP",
            currencies: { EUR: { name: "Euro" } },
            languages: { spa: "Spanish" },
            borders: ["AND", "FRA", "GIB", "PRT", "MAR"]
        },
        {
            name: { common: "France", official: "French Republic" },
            population: 67391582,
            region: "Europe",
            capital: ["Paris"],
            flags: { png: "https://flagcdn.com/w320/fr.png" },
            cca3: "FRA",
            currencies: { EUR: { name: "Euro" } },
            languages: { fra: "French" },
            borders: ["AND", "BEL", "DEU", "ITA", "LUX", "MCO", "ESP", "CHE"]
        },
        {
            name: { common: "Germany", official: "Federal Republic of Germany" },
            population: 83240525,
            region: "Europe",
            capital: ["Berlin"],
            flags: { png: "https://flagcdn.com/w320/de.png" },
            cca3: "DEU",
            currencies: { EUR: { name: "Euro" } },
            languages: { deu: "German" },
            borders: ["AUT", "BEL", "CZE", "DNK", "FRA", "LUX", "NLD", "POL", "CHE"]
        },
        {
            name: { common: "Italy", official: "Italian Republic" },
            population: 59554023,
            region: "Europe",
            capital: ["Rome"],
            flags: { png: "https://flagcdn.com/w320/it.png" },
            cca3: "ITA",
            currencies: { EUR: { name: "Euro" } },
            languages: { ita: "Italian" },
            borders: ["AUT", "FRA", "SMR", "SVN", "CHE", "VAT"]
        },
        {
            name: { common: "United States", official: "United States of America" },
            population: 329484123,
            region: "Americas",
            capital: ["Washington, D.C."],
            flags: { png: "https://flagcdn.com/w320/us.png" },
            cca3: "USA",
            currencies: { USD: { name: "United States dollar" } },
            languages: { eng: "English" },
            borders: ["CAN", "MEX"]
        },
        {
            name: { common: "Canada", official: "Canada" },
            population: 38005238,
            region: "Americas",
            capital: ["Ottawa"],
            flags: { png: "https://flagcdn.com/w320/ca.png" },
            cca3: "CAN",
            currencies: { CAD: { name: "Canadian dollar" } },
            languages: { eng: "English", fra: "French" },
            borders: ["USA"]
        },
        {
            name: { common: "Japan", official: "Japan" },
            population: 125836021,
            region: "Asia",
            capital: ["Tokyo"],
            flags: { png: "https://flagcdn.com/w320/jp.png" },
            cca3: "JPN",
            currencies: { JPY: { name: "Japanese yen" } },
            languages: { jpn: "Japanese" },
            borders: []
        },
        {
            name: { common: "China", official: "People's Republic of China" },
            population: 1439323776,
            region: "Asia",
            capital: ["Beijing"],
            flags: { png: "https://flagcdn.com/w320/cn.png" },
            cca3: "CHN",
            currencies: { CNY: { name: "Chinese yuan" } },
            languages: { zho: "Chinese" },
            borders: ["AFG", "BTN", "MMR", "HKG", "IND", "KAZ", "PRK", "KGZ", "LAO", "MAC", "MNG", "PAK", "RUS", "TJK", "VNM"]
        }
    ];
    
    filteredCountries = [...allCountries];
    
    console.log(`✅ ${allCountries.length} países de ejemplo cargados`);
    
    // Mostrar mensaje informativo
    const infoMessage = document.createElement('div');
    infoMessage.className = 'info-message';
    infoMessage.style.cssText = `
        background: #e3f2fd;
        color: #1976d2;
        padding: 1rem;
        border-radius: 0.5rem;
        margin-bottom: 2rem;
        text-align: center;
        border-left: 4px solid #1976d2;
    `;
    infoMessage.innerHTML = `
        <strong>ℹ️ Modo Demo:</strong> Se están mostrando países de ejemplo porque la API no está disponible. 
        <br>Conecta a internet para ver todos los países del mundo.
    `;
    
    const main = document.querySelector('.main');
    main.insertBefore(infoMessage, main.firstChild);
    
    renderCountries(filteredCountries);
}

/**
 * Maneja la búsqueda de países
 */
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        filteredCountries = [...allCountries];
    } else {
        filteredCountries = allCountries.filter(country => 
            country.name.common.toLowerCase().includes(searchTerm) ||
            country.name.official.toLowerCase().includes(searchTerm)
        );
    }
    
    // Aplicar filtro de región si está activo
    const selectedRegion = regionFilter.value;
    if (selectedRegion) {
        filteredCountries = filteredCountries.filter(country => 
            country.region === selectedRegion
        );
    }
    
    renderCountries(filteredCountries);
}

/**
 * Maneja el filtro por región
 */
function handleRegionFilter() {
    const selectedRegion = regionFilter.value;
    
    if (selectedRegion === '') {
        filteredCountries = [...allCountries];
    } else {
        filteredCountries = allCountries.filter(country => 
            country.region === selectedRegion
        );
    }
    
    // Aplicar búsqueda si está activa
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (searchTerm) {
        filteredCountries = filteredCountries.filter(country => 
            country.name.common.toLowerCase().includes(searchTerm) ||
            country.name.official.toLowerCase().includes(searchTerm)
        );
    }
    
    renderCountries(filteredCountries);
}

/**
 * Renderiza los países en la grilla
 */
function renderCountries(countries) {
    if (!countries || countries.length === 0) {
        showError('No se encontraron países. Intenta una búsqueda diferente.');
        return;
    }
    
    hideError();
    
    countriesGrid.innerHTML = countries.map(country => `
        <div class="country-card" onclick="showCountryDetail('${country.cca3}')">
            <img src="${country.flags.png}" alt="${country.name.common}" class="country-flag" loading="lazy" onerror="this.src='https://via.placeholder.com/320x200?text=Flag+Not+Found'">
            <div class="country-info">
                <h3 class="country-name">${country.name.common}</h3>
                <div class="country-details">
                    <p><strong>Population:</strong> ${formatNumber(country.population)}</p>
                    <p><strong>Region:</strong> ${country.region}</p>
                    <p><strong>Capital:</strong> ${country.capital ? country.capital.join(', ') : 'N/A'}</p>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Muestra los detalles de un país en el modal
 */
async function showCountryDetail(countryCode) {
    try {
        showLoading(true);
        console.log(`🔍 Mostrando detalles del país: ${countryCode}`);
        
        const country = allCountries.find(c => c.cca3 === countryCode);
        if (!country) {
            throw new Error('País no encontrado');
        }
        
        // Obtener países fronterizos
        let borderCountries = [];
        if (country.borders && country.borders.length > 0) {
            const borderCodes = country.borders.join(',');
            const borderResponse = await fetch(`${API_BASE_URL}/alpha?codes=${borderCodes}`);
            if (borderResponse.ok) {
                borderCountries = await borderResponse.json();
            }
        }
        
        renderCountryDetail(country, borderCountries);
        countryModal.classList.add('show');
        
    } catch (error) {
        console.error('❌ Error al mostrar detalles:', error);
        showError('Error al cargar los detalles del país.');
    } finally {
        showLoading(false);
    }
}

/**
 * Renderiza los detalles del país en el modal
 */
function renderCountryDetail(country, borderCountries) {
    modalBody.innerHTML = `
        <img src="${country.flags.png}" alt="${country.name.common}" class="modal-flag">
        <h2 class="modal-title">${country.name.common}</h2>
        <div class="modal-details">
            <div>
                <p><strong>Native Name:</strong> ${Object.values(country.name.nativeName || {})[0]?.common || 'N/A'}</p>
                <p><strong>Population:</strong> ${formatNumber(country.population)}</p>
                <p><strong>Region:</strong> ${country.region}</p>
                <p><strong>Sub Region:</strong> ${country.subregion || 'N/A'}</p>
                <p><strong>Capital:</strong> ${country.capital ? country.capital.join(', ') : 'N/A'}</p>
            </div>
            <div>
                <p><strong>Top Level Domain:</strong> ${country.tld ? country.tld.join(', ') : 'N/A'}</p>
                <p><strong>Currencies:</strong> ${Object.values(country.currencies || {}).map(c => c.name).join(', ') || 'N/A'}</p>
                <p><strong>Languages:</strong> ${Object.values(country.languages || {}).join(', ') || 'N/A'}</p>
            </div>
        </div>
        ${borderCountries.length > 0 ? `
            <div class="borders">
                <p><strong>Border Countries:</strong></p>
                <div class="border-countries">
                    ${borderCountries.map(border => `
                        <span class="border-country" onclick="showCountryDetail('${border.cca3}')">
                            ${border.name.common}
                        </span>
                    `).join('')}
                </div>
            </div>
        ` : ''}
    `;
}

/**
 * Cierra el modal de detalles del país
 */
function closeCountryModal() {
    countryModal.classList.remove('show');
}

/**
 * Alterna entre tema claro y oscuro
 */
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    const themeIcon = themeToggle.querySelector('.theme-icon');
    const themeText = themeToggle.querySelector('.theme-text');
    
    if (currentTheme === 'dark') {
        themeIcon.textContent = '☀️';
        themeText.textContent = 'Light Mode';
    } else {
        themeIcon.textContent = '🌙';
        themeText.textContent = 'Dark Mode';
    }
    
    // Guardar tema en localStorage
    localStorage.setItem('theme', currentTheme);
}

/**
 * Carga el tema guardado
 */
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        currentTheme = savedTheme;
        document.documentElement.setAttribute('data-theme', currentTheme);
        
        const themeIcon = themeToggle.querySelector('.theme-icon');
        const themeText = themeToggle.querySelector('.theme-text');
        
        if (currentTheme === 'dark') {
            themeIcon.textContent = '☀️';
            themeText.textContent = 'Light Mode';
        } else {
            themeIcon.textContent = '🌙';
            themeText.textContent = 'Dark Mode';
        }
    }
}

/**
 * Muestra el indicador de carga
 */
function showLoading(show) {
    if (show) {
        loading.style.display = 'block';
        countriesGrid.style.display = 'none';
    } else {
        loading.style.display = 'none';
        countriesGrid.style.display = 'grid';
    }
}

/**
 * Muestra un mensaje de error
 */
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    countriesGrid.style.display = 'none';
}

/**
 * Oculta el mensaje de error
 */
function hideError() {
    errorMessage.style.display = 'none';
    countriesGrid.style.display = 'grid';
}

/**
 * Formatea números con comas
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

console.log('✅ Script JavaScript cargado correctamente');
