// Configuration
const GITHUB_API_BASE = 'https://api.github.com';
const REPO_OWNER = 'pipetapiab-byte';
const REPO_NAME = 'Ia';

// DOM Elements
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const repoInfoSection = document.getElementById('repoInfo');
const statsSection = document.getElementById('statsSection');
const languagesSection = document.getElementById('languagesSection');
const featuresSection = document.getElementById('featuresSection');
const linksSection = document.getElementById('linksSection');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    fetchRepositoryData();
});

/**
 * Fetch all repository data
 */
async function fetchRepositoryData() {
    try {
        loadingEl.style.display = 'flex';
        errorEl.style.display = 'none';
        hideAllSections();

        // Fetch repository data and languages in parallel
        const [repoData, languagesData] = await Promise.all([
            fetchRepoInfo(),
            fetchLanguages()
        ]);

        // Populate UI with data
        populateRepositoryInfo(repoData);
        populateLanguages(languagesData);
        populateFeatures(repoData);
        populateStats(repoData, languagesData);
        populateLinks(repoData);
        updateLastUpdated();

        // Show sections
        loadingEl.style.display = 'none';
        showAllSections();

    } catch (error) {
        console.error('Error fetching data:', error);
        showError(`Error al cargar los datos: ${error.message}`);
        loadingEl.style.display = 'none';
    }
}

/**
 * Fetch repository information
 */
async function fetchRepoInfo() {
    const response = await fetch(`${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}`);
    if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
}

/**
 * Fetch repository languages
 */
async function fetchLanguages() {
    const response = await fetch(`${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/languages`);
    if (!response.ok) {
        throw new Error(`Error fetching languages: ${response.status}`);
    }
    return await response.json();
}

/**
 * Populate repository information
 */
function populateRepositoryInfo(repo) {
    document.getElementById('repoName').textContent = repo.name;
    document.getElementById('repoOwner').textContent = repo.owner.login;
    document.getElementById('repoDescription').textContent = repo.description || 'Sin descripción';
    document.getElementById('repoBranch').textContent = repo.default_branch;
    document.getElementById('repoStars').textContent = formatNumber(repo.stargazers_count);
    document.getElementById('repoWatchers').textContent = formatNumber(repo.watchers_count);
    document.getElementById('repoForks').textContent = formatNumber(repo.forks_count);
    document.getElementById('repoIssues').textContent = formatNumber(repo.open_issues_count);
    document.getElementById('repoSize').textContent = formatNumber(repo.size);
    document.getElementById('repoStatus').textContent = repo.archived ? '🔒 Archivado' : '✅ Activo';
    document.getElementById('repoPrivacy').textContent = repo.private ? 'Privado' : 'Público';
    document.getElementById('repoLastPush').textContent = formatDate(repo.pushed_at);
}

/**
 * Populate languages section
 */
function populateLanguages(languages) {
    const container = document.getElementById('languagesContainer');
    
    if (!languages || Object.keys(languages).length === 0) {
        container.innerHTML = '<p class="no-data">No hay datos de lenguajes disponibles</p>';
        return;
    }

    const total = Object.values(languages).reduce((sum, val) => sum + val, 0);
    const sortedLanguages = Object.entries(languages)
        .sort((a, b) => b[1] - a[1]);

    container.innerHTML = sortedLanguages.map(([lang, bytes]) => {
        const percentage = ((bytes / total) * 100).toFixed(1);
        const color = getLanguageColor(lang);
        
        return `
            <div class="language-item">
                <div class="language-name">
                    <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background-color: ${color};"></span>
                    ${lang}
                </div>
                <div class="language-bar-container">
                    <div class="language-bar" style="width: ${percentage}%; background: ${color};"></div>
                </div>
                <div class="language-percent">${percentage}%</div>
            </div>
        `;
    }).join('');
}

/**
 * Populate features section
 */
function populateFeatures(repo) {
    const features = [
        { name: 'Issues', enabled: repo.has_issues, icon: '📋' },
        { name: 'Wiki', enabled: repo.has_wiki, icon: '📖' },
        { name: 'Descargas', enabled: repo.has_downloads, icon: '⬇️' },
        { name: 'Proyectos', enabled: repo.has_projects, icon: '📊' },
        { name: 'Discusiones', enabled: repo.has_discussions, icon: '💬' },
        { name: 'Páginas', enabled: repo.has_pages, icon: '📄' }
    ];

    const enabledFeatures = features.filter(f => f.enabled);
    
    const grid = document.getElementById('featuresGrid');
    grid.innerHTML = enabledFeatures.map(feature => 
        `<div class="feature-item">
            <span class="feature-icon">${feature.icon}</span>
            <span>${feature.name}</span>
        </div>`
    ).join('');
}

/**
 * Populate stats section
 */
function populateStats(repo, languages) {
    const languageCount = Object.keys(languages).length;
    const mergeOptionsCount = [
        repo.allow_merge_commit,
        repo.allow_rebase_merge,
        repo.allow_squash_merge
    ].filter(Boolean).length;

    document.getElementById('statLanguages').textContent = languageCount;
    document.getElementById('statMergeOptions').textContent = mergeOptionsCount;
}

/**
 * Populate links section
 */
function populateLinks(repo) {
    document.getElementById('repoLink').href = repo.html_url;
    document.getElementById('ownerLink').href = repo.owner.html_url;
}

/**
 * Show error message
 */
function showError(message) {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
}

/**
 * Hide all sections
 */
function hideAllSections() {
    [repoInfoSection, statsSection, languagesSection, featuresSection, linksSection].forEach(section => {
        section.style.display = 'none';
    });
}

/**
 * Show all sections
 */
function showAllSections() {
    [repoInfoSection, statsSection, languagesSection, featuresSection, linksSection].forEach(section => {
        section.style.display = 'block';
    });
}

/**
 * Format number with K, M notation
 */
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

/**
 * Format date to readable format
 */
function formatDate(dateString) {
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

/**
 * Update last updated timestamp
 */
function updateLastUpdated() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('es-ES');
    const dateString = now.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('lastUpdated').textContent = 
        `Última actualización: ${dateString} a las ${timeString}`;
}

/**
 * Get color for programming language
 */
function getLanguageColor(language) {
    const colors = {
        'JavaScript': '#f1e05a',
        'TypeScript': '#3178c6',
        'Python': '#3572A5',
        'Java': '#b07219',
        'C++': '#f34b7d',
        'C#': '#239120',
        'Go': '#00ADD8',
        'Rust': '#ce422b',
        'Ruby': '#cc342d',
        'PHP': '#777bb4',
        'HTML': '#e34c26',
        'CSS': '#563d7c',
        'SQL': '#336791',
        'JSON': '#f7df1e',
        'YAML': '#cb171e',
        'Markdown': '#083fa1',
        'Shell': '#89e051',
        'Kotlin': '#7f52ff',
        'Swift': '#fa7343',
        'Objective-C': '#438eff',
    };
    
    return colors[language] || '#30363d';
}

// Refresh data every 5 minutes
setInterval(() => {
    console.log('Refreshing repository data...');
    fetchRepositoryData();
}, 5 * 60 * 1000);
