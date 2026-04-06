import { createBooking } from './bookingApi.js';

// Вставьте реальные ID из YCLIENTS напротив каждой позиции
const SERVICE_ID_MAP = {
  'Снятие + маникюр + гель-лак': null,
  'Маникюр с покрытием гель-лак': null,
  'Классический маникюр': null,
  'Японский маникюр': null,
  'Наращивание + маникюр + гель-лак': null,
  'Коррекция наращивания + маникюр': null,
  'SMART педикюр + снятие + гель-лак': null,
  'SMART педикюр + гель-лак': null,
  'SMART педикюр': null,
  'Пальчики + гель-лак': null,
  'Пальчики': null,
  'Японский педикюр': null,
  'Мужской педикюр': null,
  'Долговременная укладка': null,
  'Окрашивание хной': null,
  'Окрашивание краской': null,
  'Архитектура бровей': null,
  'Коррекция бровей': null,
  'Комплекс (коррекция + окрашивание)': null,
  'Окрашивание ресниц': null,
  'Ламинирование': null,
  'Ламинирование + ботокс': null,
  'Наращивание 1.5D': null,
  'Наращивание 2D': null,
  'Наращивание 3D': null,
  'Наращивание 4D': null,
  'Экспресс наращивание': null,
  'Снятие гель-лака': null,
  'Снятие наращенных ногтей': null,
  'Лечебное покрытие': null
};

const STAFF_ID_MAP = {
  Светлана: null,
  Илаха: null,
  Екатерина: null,
  Снежана: null,
  Виктория: null,
  Руфина: null,
  Полина: null,
  'Светлана Крюкова': null
};

const RU_MONTHS = {
  января: '01',
  февраля: '02',
  марта: '03',
  апреля: '04',
  мая: '05',
  июня: '06',
  июля: '07',
  августа: '08',
  сентября: '09',
  октября: '10',
  ноября: '11',
  декабря: '12'
};

function getSummaryValue(labelText) {
  const rows = document.querySelectorAll('#bookingSummary .booking-summary-row');
  for (const row of rows) {
    const label = row.querySelector('.booking-summary-label');
    const value = row.querySelector('.booking-summary-value');
    if (!label || !value) continue;
    if (label.textContent.trim() === labelText) {
      return value.textContent.trim();
    }
  }
  return '';
}

function normalizeDateTime(raw) {
  const [datePartRaw = '', timePartRaw = ''] = String(raw).split(',');
  const datePart = datePartRaw.trim().toLowerCase();
  const timePart = timePartRaw.trim();
  const dateMatch = datePart.match(/^(\d{1,2})\s+([а-яё]+)\s+(\d{4})$/i);
  const timeMatch = timePart.match(/^(\d{2}):(\d{2})$/);

  if (!dateMatch || !timeMatch) return '';

  const day = dateMatch[1].padStart(2, '0');
  const month = RU_MONTHS[dateMatch[2]];
  const year = dateMatch[3];
  const hh = timeMatch[1];
  const mm = timeMatch[2];

  if (!month) return '';

  return `${year}-${month}-${day} ${hh}:${mm}:00`;
}

function collectBookingData() {
  const name = (document.getElementById('bookingName') || { value: '' }).value.trim();
  const phone = (document.getElementById('bookingPhone') || { value: '' }).value.trim();
  const serviceName = getSummaryValue('Услуга');
  const staffName = getSummaryValue('Мастер');
  const datetimeText = getSummaryValue('Дата и время');
  const datetime = normalizeDateTime(datetimeText);

  return {
    name,
    phone,
    serviceName,
    staffName,
    datetime
  };
}

function resolveIds(formData) {
  const serviceId = SERVICE_ID_MAP[formData.serviceName];
  const staffId = STAFF_ID_MAP[formData.staffName];

  if (!serviceId) {
    throw new Error(`Не задан service_id для услуги: "${formData.serviceName}"`);
  }
  if (!staffId) {
    throw new Error(`Не задан staff_id для мастера: "${formData.staffName}"`);
  }
  if (!formData.datetime) {
    throw new Error('Некорректная дата/время записи');
  }

  return { serviceId, staffId };
}

function buildPayload(formData) {
  const { serviceId, staffId } = resolveIds(formData);

  return {
    phone: formData.phone,
    fullname: formData.name,
    appointments: [
      {
        id: serviceId,
        staff_id: staffId,
        datetime: formData.datetime
      }
    ]
  };
}

async function onBookingClick(event) {
  event.preventDefault();
  event.stopImmediatePropagation();

  try {
    const formData = collectBookingData();
    const bookingData = buildPayload(formData);
    await createBooking(bookingData);
    alert('Вы успешно записаны');
  } catch (error) {
    if (String(error?.message || '').includes('YCLIENTS API не подключен')) {
      alert('Запись пока не работает — API YCLIENTS не подключен');
      return;
    }
    alert(`Ошибка записи: ${error?.message || 'неизвестная ошибка'}`);
  }
}

function initBookingForm() {
  const submitBtn = document.getElementById('submitBooking');
  if (!submitBtn) return;
  submitBtn.addEventListener('click', onBookingClick, true);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBookingForm);
} else {
  initBookingForm();
}
