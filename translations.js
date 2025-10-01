// translations.js - Create this as a new file

const translations = {
    ru: {
        'tagline': 'Теглайн на русском',
        'listen-now': 'Треки на площадках',
        'latest-releases': 'Последние релизы',
        'socials': 'Соц. сети',
        'new-single': 'Новый сингл',
        'footer-rights': 'Все права защищены',
        'press-kit': 'Пресс-кит',
        'contact': 'Связаться',
        'privacy': 'Конфиденциальность'
    },
    en: {
        'tagline': 'Tagline english',
        'listen-now': 'Listen Now',
        'latest-releases': 'Latest Releases',
        'socials': 'Connect',
        'new-single': 'New Single',
        'footer-rights': 'All rights reserved',
        'press-kit': 'Press Kit',
        'contact': 'Contact',
        'privacy': 'Privacy'
    },
    de: {
        'tagline': 'Tagline auf Deutsch',
        'listen-now': 'Jetzt anhören',
        'latest-releases': 'Neueste Veröffentlichungen',
        'socials': 'Verbinden',
        'new-single': 'Neue Single',
        'footer-rights': 'Alle Rechte vorbehalten',
        'press-kit': 'Pressekit',
        'contact': 'Kontakt',
        'privacy': 'Datenschutz'
    }
};

// Browser global
if (typeof window !== "undefined") {
  window.translations = translations;
}

// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = translations;
}