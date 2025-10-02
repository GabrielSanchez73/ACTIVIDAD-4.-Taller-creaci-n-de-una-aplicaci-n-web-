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
        console.log('🌍 Cargando países...');
        
        const response = await fetch(`${API_BASE_URL}/all`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        allCountries = await response.json();
        filteredCountries = [...allCountries];
        
        console.log(`✅ ${allCountries.length} países cargados`);
        renderCountries(filteredCountries);
        
    } catch (error) {
        console.error('❌ Error al cargar países:', error);
        showError('Error al cargar los países. Inténtalo de nuevo.');
    } finally {
        showLoading(false);
    }
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
    if (countries.length === 0) {
        showError('No se encontraron países. Intenta una búsqueda diferente.');
        return;
    }
    
    hideError();
    
    countriesGrid.innerHTML = countries.map(country => `
        <div class="country-card" onclick="showCountryDetail('${country.cca3}')">
            <img src="${country.flags.png}" alt="${country.name.common}" class="country-flag" loading="lazy">
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
