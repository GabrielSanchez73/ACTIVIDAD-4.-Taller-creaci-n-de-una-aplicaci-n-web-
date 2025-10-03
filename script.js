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
const API_ENDPOINTS = [
    'https://restcountries.com/v3.1',
    'https://api.allorigins.win/raw?url=https://restcountries.com/v3.1',
    'https://cors-anywhere.herokuapp.com/https://restcountries.com/v3.1',
    'https://api.codetabs.com/v1/proxy?quest=https://restcountries.com/v3.1'
];
let currentEndpointIndex = 0;
const API_TIMEOUT = 10000; // 10 segundos de timeout
const USE_LOCAL_DATA_FIRST = true; // Usar datos locales primero debido a problemas de CORS

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
        
        // Estrategia: Usar datos locales primero debido a problemas de CORS
        if (USE_LOCAL_DATA_FIRST) {
            console.log('📁 Intentando cargar datos locales primero...');
            try {
                await loadLocalCountries();
                console.log('✅ Datos locales cargados exitosamente');
                return;
            } catch (localError) {
                console.warn('⚠️ Datos locales fallaron, intentando API...');
            }
        }
        
        // Si los datos locales fallan, intentar API
        console.log('🌐 Intentando conectar a la API...');
        for (let i = currentEndpointIndex; i < API_ENDPOINTS.length; i++) {
            try {
                console.log(`🔄 Intentando endpoint ${i + 1}/${API_ENDPOINTS.length}: ${API_ENDPOINTS[i]}`);
                
                const result = await tryApiEndpoint(API_ENDPOINTS[i]);
                if (result) {
                    allCountries = result;
                    filteredCountries = [...allCountries];
                    
                    console.log(`✅ ${allCountries.length} países cargados desde endpoint ${i + 1}`);
                    renderCountries(filteredCountries);
                    hideDemoMessage();
                    return; // Éxito, salir de la función
                }
            } catch (endpointError) {
                console.warn(`❌ Endpoint ${i + 1} falló:`, endpointError.message);
                currentEndpointIndex = i + 1; // Intentar siguiente endpoint
                continue;
            }
        }
        
        // Si todos los endpoints fallaron, intentar datos locales como fallback
        console.log('🔄 Todos los endpoints fallaron, intentando datos locales...');
        try {
            await loadLocalCountries();
        } catch (localError) {
            console.error('❌ Error al cargar datos locales:', localError);
            console.log('🔄 Cargando países de ejemplo...');
            loadSampleCountries();
        }
        
    } catch (error) {
        console.error('❌ Error general al cargar países:', error);
        console.log('🔄 Cargando países de ejemplo...');
        loadSampleCountries();
    } finally {
        showLoading(false);
    }
}

/**
 * Intenta conectar a un endpoint específico de la API
 */
async function tryApiEndpoint(baseUrl) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
    
    try {
        const url = baseUrl.includes('allorigins.win') || baseUrl.includes('cors-anywhere') || baseUrl.includes('codetabs') 
            ? baseUrl + '/all' 
            : `${baseUrl}/all`;
            
        console.log(`🌐 Conectando a: ${url}`);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            signal: controller.signal,
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'omit'
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Validar que los datos sean válidos
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('Respuesta inválida de la API');
        }
        
        // Verificar que los datos tengan la estructura esperada
        const firstCountry = data[0];
        if (!firstCountry.name || !firstCountry.flags || !firstCountry.population) {
            throw new Error('Estructura de datos inválida');
        }
        
        return data;
        
    } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
            throw new Error('Timeout: La solicitud tardó demasiado tiempo');
        } else if (fetchError.message.includes('Failed to fetch') || fetchError.message.includes('NetworkError')) {
            throw new Error('Error de red: No se pudo conectar');
        } else if (fetchError.message.includes('CORS') || fetchError.message.includes('blocked')) {
            throw new Error('Error CORS: Acceso bloqueado');
        } else {
            throw new Error(fetchError.message || 'Error desconocido');
        }
    }
}

/**
 * Carga países desde datos locales como fallback
 */
async function loadLocalCountries() {
    try {
        console.log('📁 Cargando datos locales...');
        const response = await fetch('./data.json');
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} - No se pudieron cargar los datos locales`);
        }
        
        const localData = await response.json();
        
        // Convertir formato de datos locales al formato esperado por la aplicación
        allCountries = localData.map(country => ({
            name: {
                common: country.name,
                official: country.name,
                nativeName: country.nativeName ? { [country.alpha2Code]: { common: country.nativeName } } : {}
            },
            population: country.population,
            region: country.region,
            capital: country.capital ? [country.capital] : [],
            flags: {
                png: country.flags.png,
                svg: country.flags.svg
            },
            cca3: country.alpha3Code,
            currencies: country.currencies ? 
                country.currencies.reduce((acc, curr) => {
                    acc[curr.code] = { name: curr.name, symbol: curr.symbol };
                    return acc;
                }, {}) : {},
            languages: country.languages ? 
                country.languages.reduce((acc, curr) => {
                    acc[curr.iso639_1] = curr.name;
                    return acc;
                }, {}) : {},
            borders: country.borders || [],
            subregion: country.subregion,
            tld: country.topLevelDomain || []
        }));
        
        filteredCountries = [...allCountries];
        
        console.log(`✅ ${allCountries.length} países cargados desde datos locales`);
        
        // Mostrar mensaje informativo sobre el uso de datos locales
        showLocalDataMessage();
        
        renderCountries(filteredCountries);
        
    } catch (error) {
        console.error('❌ Error al cargar datos locales:', error);
        
        // Último recurso: datos de ejemplo
        loadSampleCountries();
    }
}

/**
 * Muestra mensaje informativo sobre el uso de datos locales
 */
function showLocalDataMessage() {
    const infoMessage = document.createElement('div');
    infoMessage.className = 'info-message local-data';
    infoMessage.style.cssText = `
        background: #e8f5e8;
        color: #2e7d32;
        padding: 1rem;
        border-radius: 0.5rem;
        margin-bottom: 2rem;
        text-align: center;
        border-left: 4px solid #4caf50;
        animation: slideIn 0.5s ease-out;
    `;
    infoMessage.innerHTML = `
        <strong>📁 Datos Locales:</strong> Se están mostrando ${allCountries.length} países desde datos locales. 
        <br>La aplicación funciona completamente con búsqueda, filtros y detalles.
        <br><br>
        <button onclick="retryApiConnection()" style="
            background: #4caf50;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 0.25rem;
            cursor: pointer;
            font-size: 0.9rem;
            margin-top: 0.5rem;
        ">🌐 Intentar conectar a la API</button>
    `;
    
    const main = document.querySelector('.main');
    main.insertBefore(infoMessage, main.firstChild);
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
    
    // Mostrar mensaje de demo
    showDemoMessage();
    
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
                <h2 class="country-name">${country.name.common}</h2>
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
            try {
                const borderCodes = country.borders.join(',');
                
                // Intentar con el primer endpoint disponible
                const baseUrl = API_ENDPOINTS[0];
                const url = baseUrl.includes('allorigins.win') || baseUrl.includes('cors-anywhere') || baseUrl.includes('codetabs') 
                    ? `${baseUrl}/alpha?codes=${borderCodes}` 
                    : `${baseUrl}/alpha?codes=${borderCodes}`;
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
                
                const borderResponse = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    signal: controller.signal,
                    mode: 'cors',
                    cache: 'no-cache',
                    credentials: 'omit'
                });
                
                clearTimeout(timeoutId);
                
                if (borderResponse.ok) {
                    borderCountries = await borderResponse.json();
                }
            } catch (error) {
                console.warn('No se pudieron cargar los países fronterizos:', error);
                // Usar nombres de países fronterizos desde los datos locales si están disponibles
                borderCountries = country.borders.map(code => ({
                    cca3: code,
                    name: { common: code } // Fallback al código del país
                }));
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
 * Oculta el mensaje de demo
 */
function hideDemoMessage() {
    const demoMessage = document.querySelector('.info-message');
    if (demoMessage) {
        demoMessage.remove();
    }
}

/**
 * Muestra el mensaje de demo
 */
function showDemoMessage() {
    // Verificar si ya existe el mensaje
    const existingMessage = document.querySelector('.info-message');
    if (existingMessage) {
        return;
    }
    
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
        animation: slideIn 0.5s ease-out;
    `;
    infoMessage.innerHTML = `
        <strong>ℹ️ Modo Demo:</strong> Se están mostrando países de ejemplo porque la API no está disponible. 
        <br>Conecta a internet para ver todos los países del mundo.
        <br><br>
        <button onclick="retryConnection()" style="
            background: #1976d2;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 0.25rem;
            cursor: pointer;
            font-size: 0.9rem;
            margin-top: 0.5rem;
        ">🔄 Intentar conectar nuevamente</button>
    `;
    
    const main = document.querySelector('.main');
    main.insertBefore(infoMessage, main.firstChild);
}

/**
 * Formatea números con comas
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Intenta reconectar a la API (función original)
 */
async function retryConnection() {
    console.log('🔄 Intentando reconectar a la API...');
    
    // Mostrar indicador de carga en el botón
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = '🔄 Conectando...';
    button.disabled = true;
    
    try {
        // Limpiar datos actuales
        allCountries = [];
        filteredCountries = [];
        
        // Resetear el índice de endpoints para probar desde el principio
        currentEndpointIndex = 0;
        
        // Intentar cargar desde la API nuevamente
        await loadCountries();
        
        console.log('✅ Reconexión exitosa');
        
        // Actualizar el texto del botón si la conexión fue exitosa
        if (allCountries.length > 8) { // Más que los países de ejemplo
            button.textContent = '✅ Conectado';
            button.style.background = '#4caf50';
            
            // Remover el botón después de 2 segundos
            setTimeout(() => {
                const infoMessage = document.querySelector('.info-message');
                if (infoMessage) {
                    infoMessage.remove();
                }
            }, 2000);
        }
        
    } catch (error) {
        console.error('❌ Error en la reconexión:', error);
        
        // Restaurar botón
        button.textContent = originalText;
        button.disabled = false;
        
        // Mostrar mensaje de error temporal
        const errorMsg = document.createElement('div');
        errorMsg.style.cssText = `
            background: #ffebee;
            color: #c62828;
            padding: 0.5rem;
            border-radius: 0.25rem;
            margin-top: 0.5rem;
            font-size: 0.8rem;
            border-left: 3px solid #c62828;
        `;
        errorMsg.textContent = `No se pudo conectar (intentado ${API_ENDPOINTS.length} endpoints). Verifica tu conexión a internet.`;
        
        button.parentNode.appendChild(errorMsg);
        
        // Remover mensaje después de 5 segundos
        setTimeout(() => {
            if (errorMsg.parentNode) {
                errorMsg.remove();
            }
        }, 5000);
    }
}

/**
 * Intenta conectar a la API desde datos locales
 */
async function retryApiConnection() {
    console.log('🌐 Intentando conectar a la API desde datos locales...');
    
    // Mostrar indicador de carga en el botón
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = '🔄 Conectando a API...';
    button.disabled = true;
    
    try {
        // Limpiar datos actuales
        allCountries = [];
        filteredCountries = [];
        
        // Cambiar temporalmente a intentar API primero
        const originalSetting = USE_LOCAL_DATA_FIRST;
        
        // Resetear el índice de endpoints para probar desde el principio
        currentEndpointIndex = 0;
        
        // Intentar cargar desde la API
        console.log('🌐 Intentando conectar a la API...');
        let apiSuccess = false;
        
        for (let i = 0; i < API_ENDPOINTS.length; i++) {
            try {
                console.log(`🔄 Intentando endpoint ${i + 1}/${API_ENDPOINTS.length}: ${API_ENDPOINTS[i]}`);
                
                const result = await tryApiEndpoint(API_ENDPOINTS[i]);
                if (result) {
                    allCountries = result;
                    filteredCountries = [...allCountries];
                    
                    console.log(`✅ ${allCountries.length} países cargados desde endpoint ${i + 1}`);
                    renderCountries(filteredCountries);
                    hideDemoMessage();
                    
                    // Mostrar mensaje de éxito
                    button.textContent = '✅ Conectado a API';
                    button.style.background = '#4caf50';
                    
                    setTimeout(() => {
                        const infoMessage = document.querySelector('.info-message');
                        if (infoMessage) {
                            infoMessage.remove();
                        }
                    }, 3000);
                    
                    apiSuccess = true;
                    break;
                }
            } catch (endpointError) {
                console.warn(`❌ Endpoint ${i + 1} falló:`, endpointError.message);
                continue;
            }
        }
        
        if (!apiSuccess) {
            throw new Error('Todos los endpoints de API fallaron');
        }
        
    } catch (error) {
        console.error('❌ Error al conectar a la API:', error);
        
        // Restaurar botón y recargar datos locales
        button.textContent = originalText;
        button.disabled = false;
        
        // Mostrar mensaje de error y recargar datos locales
        const errorMsg = document.createElement('div');
        errorMsg.style.cssText = `
            background: #ffebee;
            color: #c62828;
            padding: 0.5rem;
            border-radius: 0.25rem;
            margin-top: 0.5rem;
            font-size: 0.8rem;
            border-left: 3px solid #c62828;
        `;
        errorMsg.textContent = 'No se pudo conectar a la API. Recargando datos locales...';
        
        button.parentNode.appendChild(errorMsg);
        
        // Recargar datos locales después de 2 segundos
        setTimeout(async () => {
            if (errorMsg.parentNode) {
                errorMsg.remove();
            }
            
            try {
                await loadLocalCountries();
            } catch (localError) {
                console.error('Error al recargar datos locales:', localError);
                loadSampleCountries();
            }
        }, 2000);
    }
}

console.log('✅ Script JavaScript cargado correctamente');
