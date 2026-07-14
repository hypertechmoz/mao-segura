import { useAlertStore } from '../store/alertStore';

/**
 * Traduz e exibe erros técnicos de forma amigável para o utilizador.
 * @param {Error|Object|string} error - O erro capturado.
 * @param {string} context - Onde o erro ocorreu (ex: 'Carregamento de Perfil').
 */
export const handleError = (error, context = 'Operação') => {
    console.error(`[${context}] Error:`, error);

    let title = 'Ocorreu um problema';
    let message = 'Não foi possível completar a ação. Verifique a sua ligação.';

    const errorStr = typeof error === 'string' ? error : (error.message || '');
    const errorCode = error?.code;

    // Tradução de erros comuns do Supabase/Auth
    if (errorCode === 'PGRST116') {
        message = 'Utilizador não encontrado na base de dados.';
    } else if (errorCode === '42501') {
        message = 'Não tem permissão para realizar esta ação (Erro de RLS).';
    } else if (errorStr.includes('User not found')) {
        message = 'O seu perfil de utilizador não foi localizado.';
    } else if (errorStr.includes('network')) {
        message = 'Falha de rede. Verifique a sua internet.';
    } else if (errorStr.includes('JSON Parse error')) {
        message = 'Erro de resposta do servidor. Tente novamente mais tarde.';
    } else if (errorStr) {
        message = errorStr;
    }

    // Exibe o alerta global que já temos no projeto
    useAlertStore.getState().showAlert(context, message, 'error');
};
