(function(){
    window.ENV = window.ENV || {
        // Fill these at deploy-time; do not commit secrets
        TURNSTILE_SITE_KEY: '',
        GAS_ENDPOINT: ''
    };
})();
