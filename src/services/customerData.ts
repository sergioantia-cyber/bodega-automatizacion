import { Customer } from '../types';

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'c-1',
    name: 'Doña Rosa Flores',
    phone: '987-112-233',
    debt: 18.50,
    lastPaymentDate: '2026-09-10',
    notes: 'Vecina del 2do piso, paga quincenal'
  },
  {
    id: 'c-2',
    name: 'Don Carlos Mendoza',
    phone: '955-443-322',
    debt: 42.00,
    lastPaymentDate: '2026-09-08',
    notes: 'Dueño del taller mecánico'
  },
  {
    id: 'c-3',
    name: 'Doña Carmen Salazar',
    phone: '944-887-766',
    debt: 0.00,
    lastPaymentDate: '2026-09-11',
    notes: 'Cliente puntual'
  },
  {
    id: 'c-4',
    name: 'Juan "El Vecino" Pérez',
    phone: '912-334-455',
    debt: -5.00, // Saldo a favor
    lastPaymentDate: '2026-09-12',
    notes: 'Dejó vuelto a cuenta de futuras compras'
  },
  {
    id: 'c-5',
    name: 'Miguel Ángel Romero',
    phone: '966-221-199',
    debt: 8.20,
    lastPaymentDate: '2026-09-05',
    notes: 'Fiado de gaseosas y pan'
  }
];
