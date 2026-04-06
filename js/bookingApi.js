const API_URL = 'https://api.yclients.com/api/v1';
const TOKEN = ''; // Partner API token из кабинета YCLIENTS
const USER_TOKEN = ''; // User token сотрудника YCLIENTS (если используется)
const COMPANY_ID = ''; // ID компании/филиала в YCLIENTS

export async function createBooking(data) {
  if (!TOKEN || !COMPANY_ID) {
    throw new Error('YCLIENTS API не подключен');
  }

  if (!data?.phone || !data?.fullname || !Array.isArray(data?.appointments) || !data.appointments.length) {
    throw new Error('Недостаточно данных для записи');
  }

  const authValue = USER_TOKEN
    ? `Bearer ${TOKEN}, User ${USER_TOKEN}`
    : `Bearer ${TOKEN}`;

  let response;
  try {
    response = await fetch(`${API_URL}/book_record/${COMPANY_ID}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: authValue
      },
      body: JSON.stringify(data)
    });
  } catch (_networkError) {
    throw new Error('Ошибка сети при обращении к YCLIENTS');
  }

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = result?.meta?.message || result?.errors?.message || 'Ошибка при создании записи в YCLIENTS';
    throw new Error(message);
  }

  if (result?.success === false) {
    const message = result?.meta?.message || result?.errors?.message || 'YCLIENTS вернул ошибку';
    throw new Error(message);
  }

  return result;
}
