"""
Pobla la base de datos con los datos de demo del prototipo.
Ejecutar: python seed.py
"""
from datetime import datetime, timezone
from app import create_app
from db import db
from models import (
    Neighborhood, Category, BadgeCatalog, DisputeReason,
    User, UserBadge, UserFollowedCategory,
    Report, ReportConfirmation, ReportDispute, Comment
)


def seed():
    app = create_app()
    with app.app_context():
        db.drop_all()
        db.create_all()

        # ── Colonias ──────────────────────────────────────────────────────────
        colonias = [
            Neighborhood(slug='roma-norte',  name='Roma Norte',  lat_center=19.4155, lng_center=-99.1640),
            Neighborhood(slug='roma-sur',    name='Roma Sur',    lat_center=19.4100, lng_center=-99.1640),
            Neighborhood(slug='condesa',     name='Condesa',     lat_center=19.4120, lng_center=-99.1720),
            Neighborhood(slug='juarez',      name='Juárez',      lat_center=19.4220, lng_center=-99.1640),
            Neighborhood(slug='cuauhtemoc',  name='Cuauhtémoc',  lat_center=19.4400, lng_center=-99.1490),
            Neighborhood(slug='san-rafael',  name='San Rafael',  lat_center=19.4300, lng_center=-99.1650),
        ]
        db.session.add_all(colonias)
        db.session.flush()
        roma = next(c for c in colonias if c.slug == 'roma-norte')
        condesa = next(c for c in colonias if c.slug == 'condesa')
        cuauh = next(c for c in colonias if c.slug == 'cuauhtemoc')

        # ── Categorías ────────────────────────────────────────────────────────
        cats_data = [
            ('bache',     'Bache',             'Bache',     '#D97706', '#FEF3E0', '🕳', 0),
            ('seguridad', 'Inseguridad',       'Seguridad', '#DC2626', '#FDE7E7', '⚠', 1),
            ('alumbrado', 'Alumbrado público', 'Alumbrado', '#4F46E5', '#E7E6FB', '💡', 2),
            ('basura',    'Basura / limpieza', 'Basura',    '#65A30D', '#EEF6E1', '🗑', 3),
            ('agua',      'Fuga de agua',      'Agua',      '#0284C7', '#DFF0FB', '💧', 4),
            ('anuncio',   'Anuncio vecinal',   'Anuncio',   '#7C3AED', '#EEE6FD', '📣', 5),
            ('mascota',   'Mascota perdida',   'Mascota',   '#E11D8C', '#FCE1EF', '🐾', 6),
        ]
        cats = {}
        for slug, label, short, color, soft, emoji, order in cats_data:
            c = Category(slug=slug, label=label, short=short, color=color, soft=soft, emoji=emoji, sort_order=order)
            db.session.add(c)
            cats[slug] = c
        db.session.flush()

        # ── Razones de denuncia ───────────────────────────────────────────────
        for slug, label in [
            ('false-info',       'Información falsa o imprecisa'),
            ('spam',             'Spam o repetido'),
            ('discrimination',   'Incita a la discriminación'),
            ('offensive',        'Contenido ofensivo'),
            ('not-real',         'No es un problema real'),
        ]:
            db.session.add(DisputeReason(slug=slug, label=label))
        db.session.flush()
        reasons = {r.slug: r for r in DisputeReason.query.all()}

        # ── Catálogo de insignias ─────────────────────────────────────────────
        badges_data = [
            ('active',   'Vecino activo', '🌟', 'Más de 10 reportes publicados',       10, None, None),
            ('reliable', 'Confiable',     '✓',  '90%+ de reportes confirmados',         5, 45,  None),
            ('helper',   'Buen vecino',   '🤝', 'Ayudó a resolver 5 casos',             5, None, None),
            ('pioneer',  'Pionero',       '🚀', 'Uno de los primeros 100 usuarios',     1, None, None),
        ]
        badge_catalog = {}
        for slug, label, emoji, desc, mr, mc, mk in badges_data:
            b = BadgeCatalog(slug=slug, label=label, emoji=emoji, description=desc,
                             min_reports=mr, min_confirmations=mc, min_karma=mk)
            db.session.add(b)
            badge_catalog[slug] = b
        db.session.flush()

        # ── Usuarios demo ─────────────────────────────────────────────────────
        def make_user(public_id, nickname, phone, color, hood, karma, reports, confs,
                      verified=True, official=False, org=False, bio=None):
            return User(
                public_id=public_id, nickname=nickname, phone=phone,
                avatar_color=color, neighborhood_id=hood.id,
                karma=karma, report_count=reports, confirmation_count=confs,
                is_verified=verified, is_official=official, is_organization=org,
                bio=bio,
                joined_at=datetime(2023, 1, 15, tzinfo=timezone.utc),
            )

        daniel   = make_user('48291', 'DanielR',           '+525512345678', '#2E7D5B', roma,  312,  14, 87)
        marisol  = make_user('09238', 'MarisolR',          '+525598765432', '#F4A261', roma,  465,  22, 140, bio='Vecina desde hace 8 años. Reporto todo lo que me encuentro.')
        rodrigo  = make_user('33921', 'RodrigoV',          '+525511112222', '#2A9D8F', roma,   42,   3,  11, verified=False)
        ana      = make_user('12047', 'AnaP',              '+525533334444', '#E76F51', roma,  180,   8,  52, bio='Mamá de Momo 🐕. Me encanta caminar por el barrio.')
        luis     = make_user('17558', 'LuisM',             '+525555556666', '#457B9D', condesa, 120, 6, 38)
        carmen   = make_user('29104', 'CarmenG',           '+525577778888', '#E76F51', roma,  160,  11,  45)
        colectivo = make_user('00412', 'ColectivoRoma',    '+525599990000', '#264653', roma, 1240, 58, 410,
                              org=True, bio='Colectivo vecinal de Roma Norte. Organizamos tianguis, limpiezas y reportes.')
        alcaldia  = make_user('00001', 'AlcaldiaCuauhtemoc', '+525500000001', '#2E7D5B', cuauh, 9100, 312, 2840,
                              official=True, org=True, bio='Cuenta oficial de la Alcaldía Cuauhtémoc.')

        all_users = [daniel, marisol, rodrigo, ana, luis, carmen, colectivo, alcaldia]
        db.session.add_all(all_users)
        db.session.flush()

        # badges para daniel
        for badge_slug in ['active', 'reliable', 'helper']:
            db.session.add(UserBadge(user_id=daniel.id, badge_id=badge_catalog[badge_slug].id))

        # categorías seguidas por daniel
        for cat_slug in ['seguridad', 'bache', 'alumbrado']:
            db.session.add(UserFollowedCategory(user_id=daniel.id, category_id=cats[cat_slug].id))

        db.session.flush()

        # ── Reportes demo ─────────────────────────────────────────────────────
        def ts(days_ago=0, hours_ago=0, minutes_ago=0):
            from datetime import timedelta
            return datetime.now(timezone.utc) - timedelta(days=days_ago, hours=hours_ago, minutes=minutes_ago)

        r1 = Report(
            user_id=marisol.id, category_id=cats['bache'].id, neighborhood_id=roma.id,
            lat=19.4168, lng=-99.1625, address_hint='Álvaro Obregón, entre Orizaba y Córdoba',
            title='Bache grande en Álvaro Obregón',
            body='En el carril derecho sentido al poniente, entre Orizaba y Córdoba. Ya se llevó dos llantas esta semana.',
            is_verified=True, confirmation_count=12, comment_count=8,
            created_at=ts(hours_ago=2), updated_at=ts(hours_ago=2),
        )
        r2 = Report(
            user_id=rodrigo.id, category_id=cats['alumbrado'].id, neighborhood_id=roma.id,
            lat=19.4148, lng=-99.1655, address_hint='Parque Pushkin, lado sur',
            title='Luminaria fundida en Parque Pushkin',
            body='Desde hace 3 noches no prende la luminaria del lado sur. Se siente inseguro pasar por ahí.',
            is_verified=False, confirmation_count=8, comment_count=6,
            created_at=ts(hours_ago=5), updated_at=ts(hours_ago=5),
        )
        r3 = Report(
            user_id=ana.id, category_id=cats['mascota'].id, neighborhood_id=roma.id,
            lat=19.4162, lng=-99.1648, address_hint='Colima y Frontera',
            title='Se perdió Momo 🐕',
            body='Cocker spaniel café, lleva collar azul. Última vez visto en Colima y Frontera. Si lo ves avísame porfa.',
            is_verified=True, is_urgent=True, confirmation_count=24, comment_count=11,
            created_at=ts(minutes_ago=30), updated_at=ts(minutes_ago=30),
        )
        r4 = Report(
            user_id=colectivo.id, category_id=cats['basura'].id, neighborhood_id=roma.id,
            lat=19.4143, lng=-99.1628, address_hint='Calle Tabasco',
            title='Acumulación de basura en Tabasco',
            body='El camión no ha pasado en 3 días. Ya hay olor y fauna nociva.',
            is_verified=True, confirmation_count=19, comment_count=7,
            created_at=ts(days_ago=1), updated_at=ts(days_ago=1),
        )
        r5 = Report(
            user_id=luis.id, category_id=cats['agua'].id, neighborhood_id=roma.id,
            lat=19.4172, lng=-99.1660, address_hint='Chihuahua esquina con Tonalá',
            title='Fuga en la esquina',
            body='Sale agua desde ayer en Chihuahua esquina con Tonalá. SACMEX ya tiene el reporte pero no han venido.',
            is_verified=False, confirmation_count=5, comment_count=5,
            created_at=ts(minutes_ago=40), updated_at=ts(minutes_ago=40),
        )
        r6 = Report(
            user_id=alcaldia.id, category_id=cats['anuncio'].id, neighborhood_id=roma.id,
            lat=19.4158, lng=-99.1615, address_hint='Plaza Río de Janeiro',
            title='Tianguis de trueque sábado',
            body='Este sábado 20 de abril de 9am a 2pm en Plaza Río de Janeiro. Trae lo que ya no uses y lleva algo nuevo.',
            is_verified=True, confirmation_count=41, comment_count=8,
            created_at=ts(hours_ago=3), updated_at=ts(hours_ago=3),
        )
        r7 = Report(
            user_id=rodrigo.id, category_id=cats['seguridad'].id, neighborhood_id=roma.id,
            lat=19.4138, lng=-99.1643, address_hint='Guanajuato',
            title='Auto sospechoso vigilando casas',
            body='Un Jetta gris estuvo estacionado varias horas en Guanajuato sin placas. Ya se fue pero aviso por si regresa.',
            is_anonymous=True, is_verified=False, confirmation_count=15, comment_count=10,
            dispute_count=4, status='under_review',
            created_at=ts(hours_ago=8), updated_at=ts(hours_ago=8),
        )

        all_reports = [r1, r2, r3, r4, r5, r6, r7]
        db.session.add_all(all_reports)
        db.session.flush()

        # ── Comentarios ─────────────────────────── total debe coincidir con comment_count ──
        comments = [
            # r1 (bache) — 8 comentarios
            Comment(report_id=r1.id, user_id=luis.id,     body='Confirmo, pasé esta mañana y sigue ahí. Reportado a la app de 311 también.',               created_at=ts(hours_ago=1, minutes_ago=30)),
            Comment(report_id=r1.id, user_id=carmen.id,   body='Qué bueno que lo reportaron. A ver si ahora sí hacen caso.',                               created_at=ts(hours_ago=1)),
            Comment(report_id=r1.id, user_id=daniel.id,   body='Acabo de pasar en bici, el bache sigue igual. Pusieron un cono pero no lo arreglaron.',     created_at=ts(minutes_ago=50)),
            Comment(report_id=r1.id, user_id=rodrigo.id,  body='Mandé foto a la cuenta de Twitter de la alcaldía. Me dijeron que esta semana lo atienden.', created_at=ts(minutes_ago=20)),
            Comment(report_id=r1.id, user_id=marisol.id,  body='Ya es el segundo bache en esta misma cuadra. El de Orizaba lo taparon al mes... esperemos.',  created_at=ts(minutes_ago=15)),
            Comment(report_id=r1.id, user_id=colectivo.id, body='Lo añadimos al mapa del colectivo. Si acumulamos reportes es más fácil que la alcaldía priorice la zona.', created_at=ts(minutes_ago=10)),
            Comment(report_id=r1.id, user_id=ana.id,       body='Casi me caigo en bici ahí anoche. Por favor que pongan algo más visible que un cono.',      created_at=ts(minutes_ago=7)),
            Comment(report_id=r1.id, user_id=luis.id,      body='Actualización: la alcaldía respondió en Twitter que el cuadrante de bacheo pasa el jueves.', created_at=ts(minutes_ago=3)),

            # r2 (luminaria) — 6 comentarios
            Comment(report_id=r2.id, user_id=daniel.id,   body='Ya reporté también en la app del gobierno. Ojalá hagan caso pronto.',                       created_at=ts(hours_ago=4)),
            Comment(report_id=r2.id, user_id=marisol.id,  body='Es la tercera vez en el año. Deberían cambiar la luminaria completa, no solo el foco.',      created_at=ts(hours_ago=3)),
            Comment(report_id=r2.id, user_id=carmen.id,   body='Yo le doy la vuelta al parque para no pasar por ahí de noche. No se siente seguro.',         created_at=ts(hours_ago=2, minutes_ago=30)),
            Comment(report_id=r2.id, user_id=colectivo.id, body='Sumamos este punto al informe de infraestructura que mandamos mensualmente a la alcaldía.', created_at=ts(hours_ago=2)),
            Comment(report_id=r2.id, user_id=ana.id,       body='¿Alguien sabe el número directo de alumbrado público de la alcaldía? Lo busqué y no encontré.', created_at=ts(hours_ago=1, minutes_ago=15)),
            Comment(report_id=r2.id, user_id=alcaldia.id,  body='Estimada comunidad: el ticket de mantenimiento fue generado. Atención estimada: 72 h.',      created_at=ts(hours_ago=1)),

            # r3 (mascota) — 11 comentarios
            Comment(report_id=r3.id, user_id=luis.id,     body='Creo que vi uno parecido cerca de Plaza Río de Janeiro hace como una hora. Iba solo.',       created_at=ts(minutes_ago=25)),
            Comment(report_id=r3.id, user_id=carmen.id,   body='Voy saliendo a buscarlo por Colima, les aviso si lo veo 🙏',                                created_at=ts(minutes_ago=18)),
            Comment(report_id=r3.id, user_id=ana.id,      body='Gracias a todos 😭 Sigo buscando, si ven algo avisen por favor.',                            created_at=ts(minutes_ago=15)),
            Comment(report_id=r3.id, user_id=daniel.id,   body='Vi un cocker parecido en Orizaba hace rato, pero tenía collar rojo. ¿Puede ser él?',         created_at=ts(minutes_ago=12)),
            Comment(report_id=r3.id, user_id=rodrigo.id,  body='Preguntando a los vecinos de mi edificio, a ver si alguien lo vio.',                         created_at=ts(minutes_ago=10)),
            Comment(report_id=r3.id, user_id=colectivo.id, body='Compartido en nuestra red de vecinos de Roma Norte. ¡Ánimo @AnaP, lo vamos a encontrar! 💪', created_at=ts(minutes_ago=8)),
            Comment(report_id=r3.id, user_id=marisol.id,  body='Puse un cartel en el puesto de periódicos de Álvaro Obregón por si alguien lo ve.',           created_at=ts(minutes_ago=5)),
            Comment(report_id=r3.id, user_id=luis.id,     body='Actualización: ya no está en la plaza. Me dijeron que alguien lo recogió y lo llevó al veterinario de Sonora.', created_at=ts(minutes_ago=4)),
            Comment(report_id=r3.id, user_id=carmen.id,   body='¡Qué alivio! @AnaP ¿ya tienes el teléfono del veterinario? Puedo acompañarte si quieres.',   created_at=ts(minutes_ago=3)),
            Comment(report_id=r3.id, user_id=ana.id,      body='¡Sí, ya me contactaron! Voy para allá ahora. ¡Gracias vecinos, son los mejores! 🥹❤️',       created_at=ts(minutes_ago=2)),
            Comment(report_id=r3.id, user_id=colectivo.id, body='¡Qué noticia tan bonita para empezar el día! Esto es lo mejor del vecindario 🏘️',           created_at=ts(minutes_ago=1)),

            # r4 (basura) — 7 comentarios
            Comment(report_id=r4.id, user_id=marisol.id,  body='La ruta completa está fallando. En Sonora también llevan 4 días sin servicio.',              created_at=ts(hours_ago=20)),
            Comment(report_id=r4.id, user_id=daniel.id,   body='Llamé al número de quejas del gobierno de la ciudad. Me dijeron que en 24 h pasa el camión.', created_at=ts(hours_ago=18)),
            Comment(report_id=r4.id, user_id=luis.id,     body='Actualización: ya pasó el camión esta tarde. Gracias a todos por reportar 👍',               created_at=ts(hours_ago=2)),
            Comment(report_id=r4.id, user_id=carmen.id,   body='Hay ratas desde anteanoche. Ojalá ya no regresen ahora que limpiaron.',                      created_at=ts(hours_ago=22)),
            Comment(report_id=r4.id, user_id=rodrigo.id,  body='¿Alguien sabe si hay horario fijo del camión en esta calle? Nunca sé cuándo sacarlo.',        created_at=ts(hours_ago=16)),
            Comment(report_id=r4.id, user_id=alcaldia.id, body='El horario oficial en Tabasco es lunes, miércoles y viernes de 7 a 9 am. Disculpen la falla.', created_at=ts(hours_ago=14)),
            Comment(report_id=r4.id, user_id=colectivo.id, body='Gracias por responder @AlcaldiaCuauhtemoc. Lo difundimos en el grupo para que todos sepan.', created_at=ts(hours_ago=12)),

            # r5 (fuga de agua) — 5 comentarios
            Comment(report_id=r5.id, user_id=carmen.id,   body='Puedo ver la fuga desde mi ventana, ya está afectando el pavimento. Que vengan pronto.',     created_at=ts(minutes_ago=30)),
            Comment(report_id=r5.id, user_id=marisol.id,  body='Avisé a mi casero por si afecta las tomas interiores. Hay que estar atentos.',               created_at=ts(minutes_ago=25)),
            Comment(report_id=r5.id, user_id=daniel.id,   body='Ya levantamos reporte en SACMEX 5512 3456. Número de folio: 2024-58821.',                    created_at=ts(minutes_ago=20)),
            Comment(report_id=r5.id, user_id=rodrigo.id,  body='El agua ya llegó al otro lado de la calle. Se está poniendo peor, ¿alguien puede llamar de nuevo?', created_at=ts(minutes_ago=10)),
            Comment(report_id=r5.id, user_id=alcaldia.id, body='Cuadrilla de SACMEX en camino. Estimado de atención: 45 minutos. Gracias por reportar.',      created_at=ts(minutes_ago=5)),

            # r6 (tianguis) — 8 comentarios
            Comment(report_id=r6.id, user_id=marisol.id,  body='¡Qué buena iniciativa! ¿Aceptan ropa también?',                                             created_at=ts(hours_ago=2, minutes_ago=30)),
            Comment(report_id=r6.id, user_id=colectivo.id, body='Claro que sí, cualquier artículo en buen estado. ¡Nos vemos el sábado! 🎉',                 created_at=ts(hours_ago=2)),
            Comment(report_id=r6.id, user_id=ana.id,      body='Voy con vecinas del edificio. ¿Hay estacionamiento cerca?',                                  created_at=ts(hours_ago=1, minutes_ago=30)),
            Comment(report_id=r6.id, user_id=daniel.id,   body='El estacionamiento de Liverpool está a 2 cuadras. Suelo dejar el carro ahí.',                created_at=ts(hours_ago=1)),
            Comment(report_id=r6.id, user_id=rodrigo.id,  body='¿Habrá comida? Le pregunto porque si no desayuno primero jaja.',                             created_at=ts(minutes_ago=55)),
            Comment(report_id=r6.id, user_id=colectivo.id, body='Habrá un puesto de café y un par de vecinas con tamales. ¡Ven con hambre!',                  created_at=ts(minutes_ago=50)),
            Comment(report_id=r6.id, user_id=luis.id,     body='Llevo una caja de libros de arquitectura y algo de ropa. ¿Alguien quiere coordinar llegada?', created_at=ts(minutes_ago=35)),
            Comment(report_id=r6.id, user_id=marisol.id,  body='Yo llego a las 9 en punto con mi carrito. Te veo en la entrada principal @LuisM 👋',         created_at=ts(minutes_ago=20)),

            # r7 (auto sospechoso) — 10 comentarios
            Comment(report_id=r7.id, user_id=carmen.id,   body='Ese coche es de un repartidor que trabaja en la zona, ya había preguntado.',                  created_at=ts(hours_ago=6)),
            Comment(report_id=r7.id, user_id=luis.id,     body='Yo lo vi también pero la persona estaba esperando a alguien. Cuidado con estigmatizar.',      created_at=ts(hours_ago=5)),
            Comment(report_id=r7.id, user_id=marisol.id,  body='Aún así, gracias por avisar. Mejor estar atentos.',                                           created_at=ts(hours_ago=4)),
            Comment(report_id=r7.id, user_id=ana.id,      body='Entiendo la preocupación. El barrio se siente diferente últimamente.',                         created_at=ts(hours_ago=3)),
            Comment(report_id=r7.id, user_id=rodrigo.id,  body='El coche ya no está pero anoté la descripción por si regresa.',                               created_at=ts(hours_ago=2), is_anonymous=True),
            Comment(report_id=r7.id, user_id=daniel.id,   body='El reporte quedó bajo revisión. La plataforma está evaluando.',                               created_at=ts(hours_ago=1)),
            Comment(report_id=r7.id, user_id=colectivo.id, body='Recordemos que cualquier denuncia debe basarse en hechos concretos, no en apariencias.',     created_at=ts(minutes_ago=55)),
            Comment(report_id=r7.id, user_id=carmen.id,   body='Totalmente de acuerdo @ColectivoRoma. Hay que reportar hechos, no suposiciones.',             created_at=ts(minutes_ago=45)),
            Comment(report_id=r7.id, user_id=luis.id,     body='Hablé con el dueño del coche. Es técnico de mantenimiento del edificio de enfrente. Todo bien.', created_at=ts(minutes_ago=30)),
            Comment(report_id=r7.id, user_id=daniel.id,   body='Bien que se aclaró. Gracias @LuisM por investigar. El reporte debería cerrarse.',             created_at=ts(minutes_ago=15)),
        ]
        db.session.add_all(comments)

        # ── Confirmaciones demo ────────────────────────────────────────────────
        for user, report in [(luis, r1), (carmen, r1), (daniel, r3), (marisol, r3), (carmen, r4)]:
            db.session.add(ReportConfirmation(report_id=report.id, user_id=user.id,
                                              created_at=ts(hours_ago=1)))

        # ── Disputes demo ─────────────────────────────────────────────────────
        db.session.add(ReportDispute(report_id=r7.id, user_id=carmen.id,  reason_id=reasons['false-info'].id,    created_at=ts(hours_ago=7)))
        db.session.add(ReportDispute(report_id=r7.id, user_id=luis.id,    reason_id=reasons['false-info'].id,    created_at=ts(hours_ago=6)))
        db.session.add(ReportDispute(report_id=r7.id, user_id=ana.id,     reason_id=reasons['discrimination'].id, created_at=ts(hours_ago=5)))
        db.session.add(ReportDispute(report_id=r7.id, user_id=daniel.id,  reason_id=reasons['not-real'].id,      created_at=ts(hours_ago=4)))

        db.session.commit()
        print('✓ Base de datos inicializada con datos demo.')
        print(f'  {len(colonias)} colonias, {len(cats_data)} categorías, {len(all_users)} usuarios, {len(all_reports)} reportes')


if __name__ == '__main__':
    seed()
