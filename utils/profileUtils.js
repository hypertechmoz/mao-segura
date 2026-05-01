/**
 * Calcula a percentagem de completude de um perfil.
 * Centraliza a lógica que estava duplicada em home.js e profile.js.
 *
 * @param {Object} userData - Dados base do utilizador (coleção 'users')
 * @param {Object} profileData - Dados do perfil específico (worker_profiles / employer_profiles)
 * @param {string} role - 'WORKER' ou 'EMPLOYER'
 * @returns {number} - Percentagem de 0 a 100
 */
export function calculateCompleteness(userData = {}, profileData = {}, role = 'WORKER') {
    const mergedData = { ...userData, ...profileData };

    const requiredFields = role === 'EMPLOYER'
        ? ['name', 'phone', 'province', 'city', 'bairro', 'description', 'contact_preference', 'profile_photo']
        : ['name', 'phone', 'province', 'city', 'bairro', 'description', 'contact_preference', 'profile_photo', 'work_types'];

    let filled = 0;
    requiredFields.forEach(field => {
        const val = mergedData[field];
        if (val !== null && val !== undefined && val !== '' &&
            (Array.isArray(val) ? val.length > 0 : String(val).trim() !== '')) {
            filled++;
        }
    });

    return Math.round((filled / requiredFields.length) * 100);
}

/**
 * Converte um Firestore Timestamp ou valor de data para Date.
 * Resolve o bug de `new Date(timestamp)` sem conversão de `.seconds`.
 *
 * @param {*} value - Firestore Timestamp, Date, string, ou número
 * @returns {Date} - Objecto Date válido
 */
export function toDate(value) {
    if (!value) return new Date(0);
    if (value.toDate) return value.toDate(); // Firestore Timestamp
    if (value.seconds) return new Date(value.seconds * 1000); // Serialized Timestamp
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date(0) : d;
}

/**
 * Formata uma data para exibição em listas (Hoje → hora, Ontem, ou dd/mm).
 * Centraliza a lógica que estava duplicada em messages.js e chat/[id].js.
 *
 * @param {*} date - Firestore Timestamp ou Date
 * @returns {string} - Texto formatado
 */
export function formatRelativeTime(date) {
    if (!date) return '';
    const d = toDate(date);
    if (isNaN(d.getTime())) return '...';
    
    const now = new Date();
    const diffMs = now - d;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffSec < 60) return 'Agora';
    if (diffMin < 60) return `há ${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'}`;
    if (diffHr < 24) return `há ${diffHr} ${diffHr === 1 ? 'hora' : 'horas'}`;
    if (diffDay < 7) return `há ${diffDay} ${diffDay === 1 ? 'dia' : 'dias'}`;
    
    return d.toLocaleDateString('pt-MZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatTime(date) {
    return formatRelativeTime(date);
}
