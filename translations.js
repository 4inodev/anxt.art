// translations.js - Create this as a new file

const translations = {
    ru: {
        'tagline': '.',
        'listen-now': 'Лорем ипсум',
        'latest-releases': 'Лорем ипсум',
        'socials': 'Лорем ипсум',
        'new-single': 'Лорем ипсум',
        'footer-rights': 'Лорем ипсум',
        'press-kit': 'Лорем ипсум',
        'contact': 'Лорем ипсум',
        'privacy': 'Лорем ипсум',
    },
    en: {
        'tagline': 'Lorem ipsum',
        'listen-now': 'Lorem ipsum',
        'latest-releases': 'Lorem ipsum',
        'socials': 'Lorem ipsum',
        'new-single': 'Lorem ipsum',
        'footer-rights': 'Lorem ipsum',
        'press-kit': 'Lorem ipsum',
        'contact': 'Lorem ipsum',
        'privacy': 'Lorem ipsum',
    },
    de: {
        'tagline': 'Das Lorem von ipsum',
        'listen-now': 'Das Lorem von ipsum',
        'latest-releases': 'Das Lorem von ipsum',
        'socials': 'Das Lorem von ipsum',
        'new-single': 'Das Lorem von ipsum',
        'footer-rights': 'Das Lorem von ipsum',
        'press-kit': 'Das Lorem von ipsum',
        'contact': 'Das Lorem von ipsum',
        'privacy': 'Das Lorem von ipsum'
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