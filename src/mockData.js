const now = Date.now();
const ts = (hoursAgo = 0, minutesAgo = 0) =>
  new Date(now - (hoursAgo * 3600 + minutesAgo * 60) * 1000).toISOString();

export const MOCK_CATEGORIES_LIST = [
  { id: 1, slug: 'bache',     label: 'Bache',             short: 'Bache',     color: '#D97706', soft: '#FEF3E0', emoji: '🕳' },
  { id: 2, slug: 'seguridad', label: 'Inseguridad',       short: 'Seguridad', color: '#DC2626', soft: '#FDE7E7', emoji: '⚠' },
  { id: 3, slug: 'alumbrado', label: 'Alumbrado público', short: 'Alumbrado', color: '#4F46E5', soft: '#E7E6FB', emoji: '💡' },
  { id: 4, slug: 'basura',    label: 'Basura / limpieza', short: 'Basura',    color: '#65A30D', soft: '#EEF6E1', emoji: '🗑' },
  { id: 5, slug: 'agua',      label: 'Fuga de agua',      short: 'Agua',      color: '#0284C7', soft: '#DFF0FB', emoji: '💧' },
  { id: 6, slug: 'anuncio',   label: 'Anuncio vecinal',   short: 'Anuncio',   color: '#7C3AED', soft: '#EEE6FD', emoji: '📣' },
  { id: 7, slug: 'mascota',   label: 'Mascota perdida',   short: 'Mascota',   color: '#E11D8C', soft: '#FCE1EF', emoji: '🐾' },
];

const CATS = Object.fromEntries(MOCK_CATEGORIES_LIST.map(c => [c.slug, c]));

const A = {
  daniel:    { id: 1, nickname: 'DanielR',           avatar_color: '#2E7D5B', letter: 'DR', is_verified: true,  is_official: false },
  marisol:   { id: 2, nickname: 'MarisolR',          avatar_color: '#F4A261', letter: 'MR', is_verified: true,  is_official: false },
  rodrigo:   { id: 3, nickname: 'RodrigoV',          avatar_color: '#2A9D8F', letter: 'RV', is_verified: false, is_official: false },
  ana:       { id: 4, nickname: 'AnaP',              avatar_color: '#E76F51', letter: 'AN', is_verified: true,  is_official: false },
  luis:      { id: 5, nickname: 'LuisM',             avatar_color: '#457B9D', letter: 'LM', is_verified: true,  is_official: false },
  carmen:    { id: 6, nickname: 'CarmenG',           avatar_color: '#E76F51', letter: 'CG', is_verified: true,  is_official: false },
  colectivo: { id: 7, nickname: 'ColectivoRoma',     avatar_color: '#264653', letter: 'CR', is_verified: true,  is_official: false },
  alcaldia:  { id: 8, nickname: 'AlcaldiaCuauhtemoc',avatar_color: '#2E7D5B', letter: 'AC', is_verified: true,  is_official: true  },
};

const c = (id, author, body, hoursAgo, minutesAgo = 0, anon = false) => ({
  id, author: anon ? { ...author, nickname: 'Anónimo', avatar_color: '#6C757D', letter: 'AN' } : author,
  body, is_anonymous: anon, created_at: ts(hoursAgo, minutesAgo),
});

export const MOCK_REPORTS_SOURCE = [
  {
    id: 1, category: CATS.bache,
    lat: 19.4168, lng: -99.1625, address_hint: 'Álvaro Obregón, entre Orizaba y Córdoba',
    title: 'Bache grande en Álvaro Obregón',
    body: 'En el carril derecho sentido al poniente, entre Orizaba y Córdoba. Ya se llevó dos llantas esta semana.',
    author: A.marisol, is_anonymous: false, is_verified: true, is_urgent: false, status: 'active',
    created_at: ts(2), confirmation_count: 12, comment_count: 8, dispute_count: 0, media: [],
    comments: [
      c(1,  A.luis,      'Confirmo, pasé esta mañana y sigue ahí. Reportado a la app de 311 también.',               1, 30),
      c(2,  A.carmen,    'Qué bueno que lo reportaron. A ver si ahora sí hacen caso.',                               1),
      c(3,  A.daniel,    'Acabo de pasar en bici, el bache sigue igual. Pusieron un cono pero no lo arreglaron.',     0, 50),
      c(4,  A.rodrigo,   'Mandé foto a la cuenta de Twitter de la alcaldía. Me dijeron que esta semana lo atienden.', 0, 20),
      c(5,  A.marisol,   'Ya es el segundo bache en esta cuadra. El de Orizaba lo taparon al mes... esperemos.',      0, 15),
      c(6,  A.colectivo, 'Lo añadimos al mapa del colectivo. Si acumulamos reportes la alcaldía prioriza la zona.',   0, 10),
      c(7,  A.ana,       'Casi me caigo en bici ahí anoche. Por favor que pongan algo más visible que un cono.',      0, 7),
      c(8,  A.luis,      'Actualización: la alcaldía respondió en Twitter que el cuadrante de bacheo pasa el jueves.', 0, 3),
    ],
  },
  {
    id: 2, category: CATS.alumbrado,
    lat: 19.4148, lng: -99.1655, address_hint: 'Parque Pushkin, lado sur',
    title: 'Luminaria fundida en Parque Pushkin',
    body: 'Desde hace 3 noches no prende la luminaria del lado sur. Se siente inseguro pasar por ahí.',
    author: A.rodrigo, is_anonymous: false, is_verified: false, is_urgent: false, status: 'active',
    created_at: ts(5), confirmation_count: 8, comment_count: 6, dispute_count: 0, media: [],
    comments: [
      c(9,  A.daniel,    'Ya reporté también en la app del gobierno. Ojalá hagan caso pronto.',                       4),
      c(10, A.marisol,   'Es la tercera vez en el año. Deberían cambiar la luminaria completa, no solo el foco.',     3),
      c(11, A.carmen,    'Yo le doy la vuelta al parque para no pasar por ahí de noche. No se siente seguro.',        2, 30),
      c(12, A.colectivo, 'Sumamos este punto al informe de infraestructura que mandamos mensualmente a la alcaldía.', 2),
      c(13, A.ana,       '¿Alguien sabe el número directo de alumbrado público? Lo busqué y no encontré.',            1, 15),
      c(14, A.alcaldia,  'Estimada comunidad: el ticket de mantenimiento fue generado. Atención estimada: 72 h.',     1),
    ],
  },
  {
    id: 3, category: CATS.mascota,
    lat: 19.4162, lng: -99.1648, address_hint: 'Colima y Frontera',
    title: 'Se perdió Momo 🐕',
    body: 'Cocker spaniel café, lleva collar azul. Última vez visto en Colima y Frontera. Si lo ves avísame porfa.',
    author: A.ana, is_anonymous: false, is_verified: true, is_urgent: true, status: 'active',
    created_at: ts(0, 30), confirmation_count: 24, comment_count: 11, dispute_count: 0, media: [],
    comments: [
      c(15, A.luis,      'Creo que vi uno parecido cerca de Plaza Río de Janeiro hace como una hora. Iba solo.',       0, 25),
      c(16, A.carmen,    'Voy saliendo a buscarlo por Colima, les aviso si lo veo 🙏',                                0, 18),
      c(17, A.ana,       'Gracias a todos 😭 Sigo buscando, si ven algo avisen por favor.',                           0, 15),
      c(18, A.daniel,    'Vi un cocker parecido en Orizaba hace rato, pero tenía collar rojo. ¿Puede ser él?',        0, 12),
      c(19, A.rodrigo,   'Preguntando a los vecinos de mi edificio, a ver si alguien lo vio.',                        0, 10),
      c(20, A.colectivo, 'Compartido en nuestra red. ¡Ánimo @AnaP, lo vamos a encontrar! 💪',                        0, 8),
      c(21, A.marisol,   'Puse un cartel en el puesto de periódicos de Álvaro Obregón por si alguien lo ve.',         0, 5),
      c(22, A.luis,      'Actualización: alguien lo recogió y lo llevó al veterinario de Sonora.',                    0, 4),
      c(23, A.carmen,    '¡Qué alivio! @AnaP ¿ya tienes el teléfono del vet? Puedo acompañarte.',                    0, 3),
      c(24, A.ana,       '¡Sí, ya me contactaron! Voy para allá. ¡Gracias vecinos, son los mejores! 🥹❤️',           0, 2),
      c(25, A.colectivo, '¡Qué noticia tan bonita! Esto es lo mejor del vecindario 🏘️',                             0, 1),
    ],
  },
  {
    id: 4, category: CATS.basura,
    lat: 19.4143, lng: -99.1628, address_hint: 'Calle Tabasco',
    title: 'Acumulación de basura en Tabasco',
    body: 'El camión no ha pasado en 3 días. Ya hay olor y fauna nociva.',
    author: A.colectivo, is_anonymous: false, is_verified: true, is_urgent: false, status: 'active',
    created_at: ts(24), confirmation_count: 19, comment_count: 7, dispute_count: 0, media: [],
    comments: [
      c(26, A.marisol,  'La ruta completa está fallando. En Sonora también llevan 4 días sin servicio.',               20),
      c(27, A.carmen,   'Hay ratas desde anteanoche. Ojalá ya no regresen ahora que limpiaron.',                       22),
      c(28, A.daniel,   'Llamé al número de quejas del gobierno. Me dijeron que en 24 h pasa el camión.',              18),
      c(29, A.rodrigo,  '¿Alguien sabe si hay horario fijo del camión en esta calle? Nunca sé cuándo sacarlo.',        16),
      c(30, A.alcaldia, 'El horario en Tabasco es lunes, miércoles y viernes de 7 a 9 am. Disculpen la falla.',        14),
      c(31, A.colectivo,'Gracias por responder @AlcaldiaCuauhtemoc. Lo difundimos en el grupo.',                       12),
      c(32, A.luis,     'Actualización: ya pasó el camión esta tarde. Gracias a todos por reportar 👍',                2),
    ],
  },
  {
    id: 5, category: CATS.agua,
    lat: 19.4172, lng: -99.1660, address_hint: 'Chihuahua esquina con Tonalá',
    title: 'Fuga en la esquina',
    body: 'Sale agua desde ayer en Chihuahua esquina con Tonalá. SACMEX ya tiene el reporte pero no han venido.',
    author: A.luis, is_anonymous: false, is_verified: false, is_urgent: false, status: 'active',
    created_at: ts(0, 40), confirmation_count: 5, comment_count: 5, dispute_count: 0, media: [],
    comments: [
      c(33, A.carmen,   'Puedo ver la fuga desde mi ventana, ya está afectando el pavimento. Que vengan pronto.',      0, 30),
      c(34, A.marisol,  'Avisé a mi casero por si afecta las tomas interiores. Hay que estar atentos.',                0, 25),
      c(35, A.daniel,   'Ya levantamos reporte en SACMEX. Número de folio: 2024-58821.',                               0, 20),
      c(36, A.rodrigo,  'El agua ya llegó al otro lado de la calle. ¿Alguien puede llamar de nuevo?',                  0, 10),
      c(37, A.alcaldia, 'Cuadrilla de SACMEX en camino. Estimado de atención: 45 minutos. Gracias por reportar.',      0, 5),
    ],
  },
  {
    id: 6, category: CATS.anuncio,
    lat: 19.4158, lng: -99.1615, address_hint: 'Plaza Río de Janeiro',
    title: 'Tianguis de trueque sábado',
    body: 'Este sábado 20 de abril de 9am a 2pm en Plaza Río de Janeiro. Trae lo que ya no uses y lleva algo nuevo.',
    author: A.alcaldia, is_anonymous: false, is_verified: true, is_urgent: false, status: 'active',
    created_at: ts(3), confirmation_count: 41, comment_count: 8, dispute_count: 0, media: [],
    comments: [
      c(38, A.marisol,   '¡Qué buena iniciativa! ¿Aceptan ropa también?',                                             2, 30),
      c(39, A.colectivo, 'Claro que sí, cualquier artículo en buen estado. ¡Nos vemos el sábado! 🎉',                 2),
      c(40, A.ana,       'Voy con vecinas del edificio. ¿Hay estacionamiento cerca?',                                  1, 30),
      c(41, A.daniel,    'El estacionamiento de Liverpool está a 2 cuadras. Suelo dejar el carro ahí.',                1),
      c(42, A.rodrigo,   '¿Habrá comida? Le pregunto porque si no desayuno primero jaja.',                             0, 55),
      c(43, A.colectivo, 'Habrá un puesto de café y tamales. ¡Ven con hambre!',                                       0, 50),
      c(44, A.luis,      'Llevo libros de arquitectura y algo de ropa. ¿Alguien quiere coordinar llegada?',            0, 35),
      c(45, A.marisol,   'Yo llego a las 9 en punto con mi carrito. Te veo en la entrada @LuisM 👋',                  0, 20),
    ],
  },
  {
    id: 7, category: CATS.seguridad,
    lat: 19.4138, lng: -99.1643, address_hint: 'Guanajuato',
    title: 'Auto sospechoso vigilando casas',
    body: 'Un Jetta gris estuvo estacionado varias horas en Guanajuato sin placas. Ya se fue pero aviso por si regresa.',
    author: A.rodrigo, is_anonymous: true, is_verified: false, is_urgent: false, status: 'under_review',
    created_at: ts(8), confirmation_count: 15, comment_count: 10, dispute_count: 4, media: [],
    disputes_summary: {
      count: 4, status: 'en revisión',
      reasons: [
        { label: 'Información falsa o imprecisa', count: 2 },
        { label: 'Incita a la discriminación',    count: 1 },
        { label: 'No es un problema real',        count: 1 },
      ],
    },
    comments: [
      c(46, A.carmen,    'Ese coche es de un repartidor que trabaja en la zona, ya había preguntado.',                 6),
      c(47, A.luis,      'Yo lo vi también pero la persona estaba esperando a alguien. Cuidado con estigmatizar.',     5),
      c(48, A.marisol,   'Aún así, gracias por avisar. Mejor estar atentos.',                                          4),
      c(49, A.ana,       'Entiendo la preocupación. El barrio se siente diferente últimamente.',                        3),
      c(50, A.rodrigo,   'El coche ya no está pero anoté la descripción por si regresa.', 2, 0, true),
      c(51, A.daniel,    'El reporte quedó bajo revisión. La plataforma está evaluando.',                              1),
      c(52, A.colectivo, 'Recordemos que cualquier denuncia debe basarse en hechos concretos, no en apariencias.',     0, 55),
      c(53, A.carmen,    'Totalmente de acuerdo. Hay que reportar hechos, no suposiciones.',                           0, 45),
      c(54, A.luis,      'Hablé con el dueño: es técnico del edificio de enfrente. Todo bien.',                       0, 30),
      c(55, A.daniel,    'Bien que se aclaró. Gracias @LuisM por investigar. El reporte debería cerrarse.',            0, 15),
    ],
  },
];

export const MOCK_USERS_BY_PHONE = {
  '+525512345678': {
    id: 1, public_id: '48291', nickname: 'DanielR', avatar_color: '#2E7D5B', letter: 'DR',
    bio: null,
    neighborhood: { id: 1, slug: 'roma-norte', name: 'Roma Norte', city: 'Ciudad de México', state: 'CDMX' },
    joined_at: '2023-01-15T00:00:00Z',
    is_verified: true, is_official: false, is_organization: false,
    stats: { reports: 14, confirmations: 87, karma: 312 },
    badges: [
      { slug: 'active',   label: 'Vecino activo', emoji: '🌟', description: 'Más de 10 reportes publicados' },
      { slug: 'reliable', label: 'Confiable',      emoji: '✓',  description: '90%+ de reportes confirmados' },
      { slug: 'helper',   label: 'Buen vecino',    emoji: '🤝', description: 'Ayudó a resolver 5 casos' },
    ],
    phone: '+525512345678',
    settings: { anon_by_default: false, notif_security: true, notif_replies: true, notif_announcements: false },
    followed_categories: ['seguridad', 'bache', 'alumbrado'],
  },
  '+525598765432': {
    id: 2, public_id: '09238', nickname: 'MarisolR', avatar_color: '#F4A261', letter: 'MR',
    bio: 'Vecina desde hace 8 años. Reporto todo lo que me encuentro.',
    neighborhood: { id: 1, slug: 'roma-norte', name: 'Roma Norte', city: 'Ciudad de México', state: 'CDMX' },
    joined_at: '2022-08-10T00:00:00Z',
    is_verified: true, is_official: false, is_organization: false,
    stats: { reports: 22, confirmations: 140, karma: 465 },
    badges: [
      { slug: 'active',   label: 'Vecino activo', emoji: '🌟', description: 'Más de 10 reportes publicados' },
      { slug: 'reliable', label: 'Confiable',      emoji: '✓',  description: '90%+ de reportes confirmados' },
    ],
    phone: '+525598765432',
    settings: { anon_by_default: false, notif_security: true, notif_replies: true, notif_announcements: false },
    followed_categories: ['bache', 'basura'],
  },
};

export const MOCK_NEIGHBORHOODS = [
  { id: 1, slug: 'roma-norte', name: 'Roma Norte', city: 'Ciudad de México', state: 'CDMX', lat_center: 19.4155, lng_center: -99.1640 },
  { id: 2, slug: 'roma-sur',   name: 'Roma Sur',   city: 'Ciudad de México', state: 'CDMX', lat_center: 19.4100, lng_center: -99.1640 },
  { id: 3, slug: 'condesa',    name: 'Condesa',    city: 'Ciudad de México', state: 'CDMX', lat_center: 19.4120, lng_center: -99.1720 },
  { id: 4, slug: 'juarez',     name: 'Juárez',     city: 'Ciudad de México', state: 'CDMX', lat_center: 19.4220, lng_center: -99.1640 },
];

export const MOCK_DISPUTE_REASONS = [
  { id: 1, slug: 'false-info',     label: 'Información falsa o imprecisa' },
  { id: 2, slug: 'spam',           label: 'Spam o repetido' },
  { id: 3, slug: 'discrimination', label: 'Incita a la discriminación' },
  { id: 4, slug: 'offensive',      label: 'Contenido ofensivo' },
  { id: 5, slug: 'not-real',       label: 'No es un problema real' },
];
