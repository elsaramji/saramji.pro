const state = {
    lang: localStorage.getItem('lang') || 'en',
    data: null
};

// DOM Elements
const elements = {
    html: document.documentElement,
    langToggle: document.getElementById('lang-toggle'),
    controls: document.querySelector('.controls'),
    hero: document.getElementById('hero'),
    about: document.getElementById('about'),
   // education: document.getElementById('education'),
    experience: document.getElementById('experience'),
    services: document.getElementById('services'),
    projects: document.getElementById('projects'),
    contact: document.getElementById('contact'),
    navLinks: document.getElementById('nav-links'),
    logo: document.getElementById('nav-logo'),
    footerText: document.getElementById('footer-text'),
    footerSocial: document.getElementById('footer-social'),
    mobileMenuBtn: document.getElementById('mobile-menu-btn')
};

// Initialization
async function init() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error('Failed to load data');
        state.data = await response.json();

        // Initial State (Checked = EN, Unchecked = AR)
        elements.langToggle.checked = state.lang === 'en';
        applyLanguage();
        renderAll();

        // Event Listeners
        elements.langToggle.addEventListener('change', toggleLanguage);
        elements.mobileMenuBtn.addEventListener('click', toggleMobileMenu);

    } catch (error) {
        console.error('Error initializing:', error);
        document.body.innerHTML = '<h1 style="text-align:center; padding-top: 50px;">Failed to load content. Please try again later.</h1>';
    }
}

// Language Handling
// Language Handling
function toggleLanguage() {
    state.lang = elements.langToggle.checked ? 'en' : 'ar';
    localStorage.setItem('lang', state.lang);
    applyLanguage();
    renderAll();
}

function applyLanguage() {
    elements.html.setAttribute('lang', state.lang);
    elements.html.setAttribute('dir', state.lang === 'en' ? 'ltr' : 'rtl');

    // Checkbox state is source of truth for UI, no text update needed
}

function getLocalizedText(obj) {
    if (!obj) return '';
    return obj[state.lang] || obj['en'] || '';
}

// Rendering Functions
function renderAll() {
    if (!state.data) return;

    renderNav();
    renderHero();
    renderAbout();
    renderEducation();
    renderExperience();
    renderServices();
    renderProjects();
    renderContact();
    renderFooter();
}

function renderNav() {
    // Logo
    elements.logo.textContent = getLocalizedText(state.data.profile.name);

    // Links
    const sections = ['about', 'education', 'experience', 'services', 'projects', 'contact'];
    const navHTML = sections.map(sec => {
        const title = state.data[sec]?.title ? getLocalizedText(state.data[sec].title) : sec;
        return `<a href="#${sec}">${title}</a>`;
    }).join('');

    elements.navLinks.innerHTML = navHTML;
}

function renderHero() {
    const { hero } = state.data;
    elements.hero.innerHTML = `
        <div class="container">
            <div class="hero-content">
                <h1>${getLocalizedText(hero.headline)}</h1>
                <p class="subtitle">${getLocalizedText(hero.subheadline)}</p>
                <div class="btn-group">
                    <a href="#projects" class="btn">${getLocalizedText(hero.cta)}</a>
                </div>
            </div>
            <div class="hero-image-container">
                <img src="${hero.image}" alt="Profile" class="hero-img">
            </div>
        </div>
    `;
}

function renderAbout() {
    const { about } = state.data;
    elements.about.innerHTML = `
        <div class="container">
            <h2 class="section-title">${getLocalizedText(about.title)}</h2>
            <p style="text-align: center; max-width: 800px; margin: 0 auto; font-size: 1.1rem;">
                ${getLocalizedText(about.description)}
            </p>
        </div>
    `;
}

function renderEducation() {
    const { education } = state.data;
    const itemsHTML = education.items.map(item => `
        <div class="card timeline-item">
            <h3>${getLocalizedText(item.degree)}</h3>
            <h4>${getLocalizedText(item.institution)}</h4>
            <span class="date">${item.year}</span>
        </div>
    `).join('');

    elements.education.innerHTML = `
        <div class="container">
            <h2 class="section-title">${getLocalizedText(education.title)}</h2>
            <div class="timeline">
                ${itemsHTML}
            </div>
        </div>
    `;
}

function renderExperience() {
    const { experience } = state.data;
    const itemsHTML = experience.items.map(item => `
        <div class="card timeline-item">
            <h3>${getLocalizedText(item.role)}</h3>
            <h4>${getLocalizedText(item.company)}</h4>
            <span class="date">${getLocalizedText(item.period)}</span>
            <p style="margin-top: 0.5rem;">${getLocalizedText(item.description)}</p>
        </div>
    `).join('');

    elements.experience.innerHTML = `
        <div class="container">
            <h2 class="section-title">${getLocalizedText(experience.title)}</h2>
            <div class="timeline">
                ${itemsHTML}
            </div>
        </div>
    `;
}

function renderServices() {
    const { services } = state.data;
    const itemsHTML = services.items.map(item => `
        <div class="card">
            <h3>${getLocalizedText(item.name)}</h3>
            <p>${getLocalizedText(item.description)}</p>
        </div>
    `).join('');

    elements.services.innerHTML = `
        <div class="container">
            <h2 class="section-title">${getLocalizedText(services.title)}</h2>
            <div class="grid">
                ${itemsHTML}
            </div>
        </div>
    `;
}

function renderProjects() {
    const { projects } = state.data;
    const itemsHTML = projects.items.map(item => `
        <div class="card project-card">
            <img src="${item.image}" alt="${getLocalizedText(item.title)}" class="project-image">
            <div class="project-content">
                <h3>${getLocalizedText(item.title)}</h3>
                <p>${getLocalizedText(item.description)}</p>
                <div class="tech-stack">
                    ${item.tech.map(t => `<span class="tech-badge">${t}</span>`).join('')}
                </div>
                <div style="margin-top: 1.5rem; display: flex; gap: 0.5rem;">
                    ${item.githubLink ? `<a href="${item.githubLink}" target="_blank" class="btn btn-outline" style="padding: 0.5rem 1rem; font-size: 0.9rem;">
                        <i class="fab fa-github"></i> GitHub
                    </a>` : ''}
                    ${item.liveDemoLink ? `<a href="${item.liveDemoLink}" target="_blank" class="btn" style="padding: 0.5rem 1rem; font-size: 0.9rem;">
                        <i class="fas fa-external-link-alt"></i> Demo
                    </a>` : ''}
                </div>
            </div>
        </div>
    `).join('');

    elements.projects.innerHTML = `
        <div class="container">
            <h2 class="section-title">${getLocalizedText(projects.title)}</h2>
            <div class="grid">
                ${itemsHTML}
            </div>
        </div>
    `;
}

function renderContact() {
    const { contact } = state.data;
    const form = contact.form || { nameLabel: {}, emailLabel: {}, messageLabel: {}, btnLabel: {}, action: "#" };

    // Fallback for button label if upgrading from old JSON
    const btnText = form.btnLabel ? getLocalizedText(form.btnLabel) : getLocalizedText(contact.button);

    elements.contact.innerHTML = `
        <div class="container" style="text-align: center;">
            <h2 class="section-title">${getLocalizedText(contact.title)}</h2>
            <p>${getLocalizedText(contact.text)}</p>
            
            <form action="${form.action || '#'}" method="POST" class="contact-form">
                <div class="form-group">
                    <input type="text" name="name" placeholder="${getLocalizedText(form.nameLabel)}" required>
                </div>
                <div class="form-group">
                    <input type="email" name="email" placeholder="${getLocalizedText(form.emailLabel)}" required>
                </div>
                <div class="form-group">
                    <textarea name="message" rows="5" placeholder="${getLocalizedText(form.messageLabel)}" required></textarea>
                </div>
                <button type="submit" class="btn btn-submit">
                    ${btnText} <i class="fas fa-paper-plane"></i>
                </button>
            </form>
            
            <div class="contact-links">
                ${contact.whatsapp ? `
                <a href="${contact.whatsapp}" target="_blank" class="contact-item">
                    <i class="fab fa-whatsapp"></i> WhatsApp
                </a>` : ''}
                
                ${contact.linkedin ? `
                <a href="${contact.linkedin}" target="_blank" class="contact-item">
                    <i class="fab fa-linkedin"></i> LinkedIn
                </a>` : ''}
            </div>
        </div>
    `;
}

function renderFooter() {
    elements.footerText.textContent = `© ${new Date().getFullYear()} ${getLocalizedText(state.data.profile.name)}. All rights reserved.`;

    elements.footerSocial.innerHTML = state.data.profile.social.map(s => `
        <a href="${s.url}" target="_blank" aria-label="${s.platform}" class="social-btn">
            <i class="${s.icon}"></i>
        </a>
    `).join('');
}

function toggleMobileMenu() {
    elements.navLinks.classList.toggle('active');
}

// Start
init();
