export const CATEGORIES = {
  bache:     { id: 'bache',     label: 'Bache',             short: 'Bache',     color: '#D97706', soft: '#FEF3E0', emoji: '🕳' },
  seguridad: { id: 'seguridad', label: 'Inseguridad',       short: 'Seguridad', color: '#DC2626', soft: '#FDE7E7', emoji: '⚠' },
  alumbrado: { id: 'alumbrado', label: 'Alumbrado público', short: 'Alumbrado', color: '#4F46E5', soft: '#E7E6FB', emoji: '💡' },
  basura:    { id: 'basura',    label: 'Basura / limpieza', short: 'Basura',    color: '#65A30D', soft: '#EEF6E1', emoji: '🗑' },
  agua:      { id: 'agua',      label: 'Fuga de agua',      short: 'Agua',      color: '#0284C7', soft: '#DFF0FB', emoji: '💧' },
  anuncio:   { id: 'anuncio',   label: 'Anuncio vecinal',   short: 'Anuncio',   color: '#7C3AED', soft: '#EEE6FD', emoji: '📣' },
  mascota:   { id: 'mascota',   label: 'Mascota perdida',   short: 'Mascota',   color: '#E11D8C', soft: '#FCE1EF', emoji: '🐾' },
};

export const USER_LOCATION = { lat: 19.4155, lng: -99.1640 };

export const CURRENT_USER = {
  nickname: 'DanielR',
  userId: '48291',
  phone: '+52 55 1234 5678',
  avatar: '#2E7D5B',
  letter: 'DR',
  neighborhood: 'Roma Norte',
  joined: 'Enero 2024',
  verified: true,
  stats: { reports: 14, confirmations: 87, karma: 312 },
  badges: [
    { id: 'active',   label: 'Vecino activo', emoji: '🌟', desc: 'Más de 10 reportes publicados' },
    { id: 'reliable', label: 'Confiable',      emoji: '✓', desc: '90%+ de reportes confirmados' },
    { id: 'helper',   label: 'Buen vecino',    emoji: '🤝', desc: 'Ayudó a resolver 5 casos' },
  ],
  followedCategories: ['seguridad', 'bache', 'alumbrado'],
};

export const USER_PROFILES = {
  'Ana P.':     { nickname: 'AnaP',       userId: '12047', joined: 'Marzo 2023',     verified: true,  neighborhood: 'Roma Norte', stats: { reports: 8,   confirmations: 52,   karma: 180  }, bio: 'Mamá de Momo 🐕. Me encanta caminar por el barrio.' },
  'Marisol R.': { nickname: 'MarisolR',   userId: '09238', joined: 'Agosto 2022',    verified: true,  neighborhood: 'Roma Norte', stats: { reports: 22,  confirmations: 140,  karma: 465  }, bio: 'Vecina desde hace 8 años. Reporto todo lo que me encuentro.' },
  'Rodrigo V.': { nickname: 'RodrigoV',   userId: '33921', joined: 'Mayo 2024',      verified: false, neighborhood: 'Roma Norte', stats: { reports: 3,   confirmations: 11,   karma: 42   } },
  'Luis M.':    { nickname: 'LuisM',      userId: '17558', joined: 'Febrero 2023',   verified: true,  neighborhood: 'Condesa',    stats: { reports: 6,   confirmations: 38,   karma: 120  } },
  'Colectivo Roma':       { nickname: 'ColectivoRoma',       userId: '00412', joined: 'Enero 2021',  verified: true,  neighborhood: 'Roma Norte',  stats: { reports: 58,  confirmations: 410,  karma: 1240 }, bio: 'Colectivo vecinal de Roma Norte. Organizamos tianguis, limpiezas y reportes.', organization: true },
  'Alcaldía Cuauhtémoc':  { nickname: 'AlcaldiaCuauhtemoc',  userId: '00001', joined: 'Enero 2020',  verified: true,  official: true, neighborhood: 'Cuauhtémoc', stats: { reports: 312, confirmations: 2840, karma: 9100 }, bio: 'Cuenta oficial de la Alcaldía Cuauhtémoc.', organization: true },
  'Carmen G.':  { nickname: 'CarmenG',    userId: '29104', joined: 'Noviembre 2023', verified: true,  neighborhood: 'Roma Norte', stats: { reports: 11,  confirmations: 45,   karma: 160  } },
  'Anónimo':    { anonymous: true },
};

export const DEMO_REPORTS = [
  {
    id: 'r1', cat: 'bache', lat: 19.4168, lng: -99.1625,
    author: 'Marisol R.', avatar: '#F4A261', time: 'hace 2 h',
    title: 'Bache grande en Álvaro Obregón',
    body: 'En el carril derecho sentido al poniente, entre Orizaba y Córdoba. Ya se llevó dos llantas esta semana.',
    photo: '#3a3532', confirmations: 12, comments: 4, verified: true,
  },
  {
    id: 'r2', cat: 'alumbrado', lat: 19.4148, lng: -99.1655,
    author: 'Rodrigo V.', avatar: '#2A9D8F', time: 'hace 5 h',
    title: 'Luminaria fundida en Parque Pushkin',
    body: 'Desde hace 3 noches no prende la luminaria del lado sur. Se siente inseguro pasar por ahí.',
    confirmations: 8, comments: 2, verified: false,
  },
  {
    id: 'r3', cat: 'mascota', lat: 19.4162, lng: -99.1648,
    author: 'Ana P.', avatar: '#E76F51', time: 'hace 30 min',
    title: 'Se perdió Momo 🐕',
    body: 'Cocker spaniel café, lleva collar azul. Última vez visto en Colima y Frontera. Si lo ves avísame porfa.',
    photo: '#8B5A3C', confirmations: 24, comments: 9, verified: true, urgent: true,
    messages: [
      { a: 'Luis M.',   c: '#457B9D', t: 'Creo que vi uno parecido cerca de Plaza Río de Janeiro hace como una hora. Iba solo.', time: 'hace 25 min' },
      { a: 'Carmen G.', c: '#E76F51', t: 'Voy saliendo a buscarlo por Colima, les aviso si lo veo 🙏', time: 'hace 18 min' },
      { a: 'Pablo T.',  c: '#F4A261', t: '¿Tiene placa con teléfono? Comparto en el grupo de vecinos.', time: 'hace 12 min' },
    ],
  },
  {
    id: 'r4', cat: 'basura', lat: 19.4143, lng: -99.1628,
    author: 'Colectivo Roma', avatar: '#264653', time: 'hace 1 día',
    title: 'Acumulación de basura en Tabasco',
    body: 'El camión no ha pasado en 3 días. Ya hay olor y fauna nociva.',
    confirmations: 19, comments: 7, verified: true,
  },
  {
    id: 'r5', cat: 'agua', lat: 19.4172, lng: -99.1660,
    author: 'Luis M.', avatar: '#457B9D', time: 'hace 40 min',
    title: 'Fuga en la esquina',
    body: 'Sale agua desde ayer en Chihuahua esquina con Tonalá. SACMEX ya tiene el reporte pero no han venido.',
    confirmations: 5, comments: 1, verified: false,
  },
  {
    id: 'r6', cat: 'anuncio', lat: 19.4158, lng: -99.1615,
    author: 'Alcaldía Cuauhtémoc', avatar: '#2E7D5B', official: true, time: 'hace 3 h',
    title: 'Tianguis de trueque sábado',
    body: 'Este sábado 20 de abril de 9am a 2pm en Plaza Río de Janeiro. Trae lo que ya no uses y lleva algo nuevo.',
    confirmations: 41, comments: 12, verified: true,
  },
  {
    id: 'r7', cat: 'seguridad', lat: 19.4138, lng: -99.1643,
    author: 'Anónimo', avatar: '#6C757D', time: 'hace 8 h',
    title: 'Auto sospechoso vigilando casas',
    body: 'Un Jetta gris estuvo estacionado varias horas en Guanajuato sin placas. Ya se fue pero aviso por si regresa.',
    confirmations: 15, comments: 6, verified: false,
    disputes: {
      count: 4,
      reasons: [
        { label: 'Información imprecisa', count: 2 },
        { label: 'Incita a la discriminación', count: 1 },
        { label: 'No es un problema real', count: 1 },
      ],
      status: 'en revisión',
    },
    messages: [
      { a: 'Elena R.',   c: '#9B7EDE', t: 'Ese coche es de un repartidor que trabaja en la zona, ya había preguntado. No me parece que sea "sospechoso".', time: 'hace 6 h' },
      { a: 'Jorge H.',   c: '#2A9D8F', t: 'Yo lo vi también pero la persona estaba esperando a alguien. Cuidado con estigmatizar.', time: 'hace 5 h' },
      { a: 'Marisol R.', c: '#F4A261', t: 'Aún así, gracias por avisar. Mejor estar atentos.', time: 'hace 4 h' },
    ],
  },
];
