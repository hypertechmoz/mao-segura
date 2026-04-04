/**
 * Helper to send a push notification through Expo's API.
 * 
 * @param {string} expoPushToken - The target device's Expo push token.
 * @param {string} title - The notification title.
 * @param {string} body - The notification body.
 * @param {object} data - Extra data to be handled by the app when tapped.
 */
export async function sendPushNotification(expoPushToken, title, body, data = {}) {
  if (!expoPushToken || typeof expoPushToken !== 'string') return;

  const message = {
    to: expoPushToken,
    sound: 'default',
    title: title,
    body: body,
    data: data,
  };

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    
    // Detailed logs for debugging
    if (!response.ok) {
        const errorBody = await response.text();
        console.warn(`[Push Service] Erro na resposta do Expo Push: ${response.status}`, errorBody);
    } else {
        const result = await response.json();
        console.log('[Push Service] Notificação enviada com sucesso:', result);
    }
    return true;
  } catch (error) {
    console.error('Erro de rede ao enviar push notification:', error);
    return false;
  }
}
