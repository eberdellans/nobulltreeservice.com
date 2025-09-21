/* Public client config. Do NOT put secrets here. */
(function(){
    var existing = window.ENV || {};
    var cfg = {
        // Replace at deploy-time or override via window.ENV before this file loads
        TURNSTILE_SITE_KEY: existing.TURNSTILE_SITE_KEY || '0x4AAAAAAB11coLebqiD70Sx-RLdHAIAiEI',
        GAS_ENDPOINT: existing.GAS_ENDPOINT || 'https://script.google.com/macros/s/AKfycby7xtqMFAxUuNiCN-ORuzwM185Onk_tk8N-zQf9PWmpcPf3B6OefHUoBXap4t6usuwH/exec'
    };
    window.ENV = cfg;
    if (!cfg.TURNSTILE_SITE_KEY) console.warn('ENV: TURNSTILE_SITE_KEY is missing');
    if (!cfg.GAS_ENDPOINT) console.warn('ENV: GAS_ENDPOINT is missing');
})();
