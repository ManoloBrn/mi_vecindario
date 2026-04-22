"""
Mi Vecindario — Data model

Diagrama de relaciones:

  neighborhoods ──< users >── user_followed_categories >── categories
                      │                                          │
                      │                                          │
                      └──< reports >────────────────────────────┘
                               │
                     ┌─────────┼──────────┬──────────────┐
                     │         │          │               │
              report_media  confirmations  disputes    comments
                                              │
                                      dispute_reason_catalog

  users >── user_badges >── badge_catalog
"""

from datetime import datetime, timezone
from db import db


# ─── Catálogos ────────────────────────────────────────────────────────────────

class Neighborhood(db.Model):
    __tablename__ = 'neighborhoods'

    id            = db.Column(db.Integer, primary_key=True)
    slug          = db.Column(db.String(60), unique=True, nullable=False)
    name          = db.Column(db.String(100), nullable=False)
    city          = db.Column(db.String(100), nullable=False, default='Ciudad de México')
    state         = db.Column(db.String(100), nullable=False, default='CDMX')
    # bounding box aproximado para filtros geográficos
    lat_center    = db.Column(db.Float)
    lng_center    = db.Column(db.Float)

    users   = db.relationship('User', back_populates='neighborhood')
    reports = db.relationship('Report', back_populates='neighborhood')

    def to_dict(self):
        return {
            'id': self.id, 'slug': self.slug, 'name': self.name,
            'city': self.city, 'state': self.state,
            'lat_center': self.lat_center, 'lng_center': self.lng_center,
        }


class Category(db.Model):
    __tablename__ = 'categories'

    id    = db.Column(db.Integer, primary_key=True)
    slug  = db.Column(db.String(30), unique=True, nullable=False)  # 'bache', 'seguridad', …
    label = db.Column(db.String(60), nullable=False)               # 'Bache'
    short = db.Column(db.String(30), nullable=False)               # 'Bache' (chip label)
    color = db.Column(db.String(7),  nullable=False)               # '#D97706'
    soft  = db.Column(db.String(7),  nullable=False)               # '#FEF3E0'
    emoji = db.Column(db.String(4),  nullable=False)               # '🕳'
    sort_order = db.Column(db.Integer, default=0)

    reports          = db.relationship('Report', back_populates='category')
    followed_by      = db.relationship('UserFollowedCategory', back_populates='category')

    def to_dict(self):
        return {
            'id': self.id, 'slug': self.slug, 'label': self.label,
            'short': self.short, 'color': self.color, 'soft': self.soft,
            'emoji': self.emoji,
        }


class DisputeReason(db.Model):
    __tablename__ = 'dispute_reason_catalog'

    id    = db.Column(db.Integer, primary_key=True)
    slug  = db.Column(db.String(60), unique=True, nullable=False)
    label = db.Column(db.String(120), nullable=False)

    disputes = db.relationship('ReportDispute', back_populates='reason')

    def to_dict(self):
        return {'id': self.id, 'slug': self.slug, 'label': self.label}


class BadgeCatalog(db.Model):
    __tablename__ = 'badge_catalog'

    id                    = db.Column(db.Integer, primary_key=True)
    slug                  = db.Column(db.String(40), unique=True, nullable=False)
    label                 = db.Column(db.String(80), nullable=False)
    emoji                 = db.Column(db.String(4),  nullable=False)
    description           = db.Column(db.String(200))
    # criterios de desbloqueo (NULL = se asigna manualmente)
    min_reports           = db.Column(db.Integer)
    min_confirmations     = db.Column(db.Integer)
    min_karma             = db.Column(db.Integer)

    user_badges = db.relationship('UserBadge', back_populates='badge')

    def to_dict(self):
        return {
            'id': self.id, 'slug': self.slug, 'label': self.label,
            'emoji': self.emoji, 'description': self.description,
        }


# ─── Usuarios ─────────────────────────────────────────────────────────────────

class User(db.Model):
    __tablename__ = 'users'

    id              = db.Column(db.Integer, primary_key=True)
    # identificador público inmutable (5 dígitos asignados al registro)
    public_id       = db.Column(db.String(10), unique=True, nullable=False)
    nickname        = db.Column(db.String(40), unique=True, nullable=False)
    phone           = db.Column(db.String(20), unique=True)        # NULL si registró con proveedor social
    avatar_color    = db.Column(db.String(7),  default='#2E7D5B')
    bio             = db.Column(db.Text)
    neighborhood_id = db.Column(db.Integer, db.ForeignKey('neighborhoods.id'))
    joined_at       = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    # flags
    is_verified     = db.Column(db.Boolean, default=False)
    is_official     = db.Column(db.Boolean, default=False)   # cuenta gubernamental
    is_organization = db.Column(db.Boolean, default=False)   # colectivo
    is_active       = db.Column(db.Boolean, default=True)
    # settings
    anon_by_default = db.Column(db.Boolean, default=False)
    notif_security  = db.Column(db.Boolean, default=True)
    notif_replies   = db.Column(db.Boolean, default=True)
    notif_announcements = db.Column(db.Boolean, default=False)
    # métricas (desnormalizadas para lectura rápida, se actualizan por triggers/lógica)
    karma           = db.Column(db.Integer, default=0)
    report_count    = db.Column(db.Integer, default=0)
    confirmation_count = db.Column(db.Integer, default=0)

    neighborhood         = db.relationship('Neighborhood', back_populates='users')
    reports              = db.relationship('Report', back_populates='author', foreign_keys='Report.user_id')
    confirmations        = db.relationship('ReportConfirmation', back_populates='user')
    disputes             = db.relationship('ReportDispute', back_populates='user')
    comments             = db.relationship('Comment', back_populates='author')
    badges               = db.relationship('UserBadge', back_populates='user')
    followed_categories  = db.relationship('UserFollowedCategory', back_populates='user')

    @property
    def letter(self):
        parts = self.nickname.replace('_', ' ').split()
        return (parts[0][0] + (parts[1][0] if len(parts) > 1 else parts[0][1] if len(parts[0]) > 1 else '')).upper()

    def to_dict(self, public=True):
        d = {
            'id': self.id,
            'public_id': self.public_id,
            'nickname': self.nickname,
            'avatar_color': self.avatar_color,
            'letter': self.letter,
            'bio': self.bio,
            'neighborhood': self.neighborhood.to_dict() if self.neighborhood else None,
            'joined_at': self.joined_at.isoformat(),
            'is_verified': self.is_verified,
            'is_official': self.is_official,
            'is_organization': self.is_organization,
            'stats': {
                'reports': self.report_count,
                'confirmations': self.confirmation_count,
                'karma': self.karma,
            },
            'badges': [ub.badge.to_dict() for ub in self.badges],
        }
        if not public:
            d['phone'] = self.phone
            d['settings'] = {
                'anon_by_default': self.anon_by_default,
                'notif_security': self.notif_security,
                'notif_replies': self.notif_replies,
                'notif_announcements': self.notif_announcements,
            }
            d['followed_categories'] = [fc.category.slug for fc in self.followed_categories]
        return d


class UserBadge(db.Model):
    __tablename__ = 'user_badges'

    user_id   = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    badge_id  = db.Column(db.Integer, db.ForeignKey('badge_catalog.id'), primary_key=True)
    earned_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    user  = db.relationship('User', back_populates='badges')
    badge = db.relationship('BadgeCatalog', back_populates='user_badges')


class UserFollowedCategory(db.Model):
    __tablename__ = 'user_followed_categories'

    user_id     = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), primary_key=True)
    followed_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    user     = db.relationship('User', back_populates='followed_categories')
    category = db.relationship('Category', back_populates='followed_by')


# ─── Reportes ─────────────────────────────────────────────────────────────────

class Report(db.Model):
    __tablename__ = 'reports'

    id              = db.Column(db.Integer, primary_key=True)
    user_id         = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    category_id     = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    neighborhood_id = db.Column(db.Integer, db.ForeignKey('neighborhoods.id'))
    # ubicación
    lat             = db.Column(db.Float, nullable=False)
    lng             = db.Column(db.Float, nullable=False)
    address_hint    = db.Column(db.String(200))   # 'Álvaro Obregón 132, Roma Norte'
    # contenido
    title           = db.Column(db.String(200), nullable=False)
    body            = db.Column(db.Text)
    # flags
    is_anonymous    = db.Column(db.Boolean, default=False)
    is_urgent       = db.Column(db.Boolean, default=False)
    is_verified     = db.Column(db.Boolean, default=False)  # verificado por la plataforma
    status          = db.Column(db.String(20), default='active')
    # 'active' | 'resolved' | 'under_review' | 'removed'
    # timestamps
    created_at      = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at      = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                                onupdate=lambda: datetime.now(timezone.utc))
    # métricas desnormalizadas
    confirmation_count = db.Column(db.Integer, default=0)
    comment_count      = db.Column(db.Integer, default=0)
    dispute_count      = db.Column(db.Integer, default=0)

    author        = db.relationship('User', back_populates='reports', foreign_keys=[user_id])
    category      = db.relationship('Category', back_populates='reports')
    neighborhood  = db.relationship('Neighborhood', back_populates='reports')
    media         = db.relationship('ReportMedia', back_populates='report', cascade='all, delete-orphan')
    confirmations = db.relationship('ReportConfirmation', back_populates='report', cascade='all, delete-orphan')
    disputes      = db.relationship('ReportDispute', back_populates='report', cascade='all, delete-orphan')
    comments      = db.relationship('Comment', back_populates='report', cascade='all, delete-orphan',
                                    order_by='Comment.created_at')

    def to_dict(self, include_comments=False, viewer_id=None):
        # autor: anónimo o con datos
        if self.is_anonymous:
            author_data = {'nickname': 'Anónimo', 'avatar_color': '#6C757D', 'letter': 'A', 'is_verified': False}
        else:
            author_data = {
                'id': self.author.id,
                'public_id': self.author.public_id,
                'nickname': self.author.nickname,
                'avatar_color': self.author.avatar_color,
                'letter': self.author.letter,
                'is_verified': self.author.is_verified,
                'is_official': self.author.is_official,
            }

        d = {
            'id': self.id,
            'author': author_data,
            'category': self.category.to_dict(),
            'neighborhood': self.neighborhood.to_dict() if self.neighborhood else None,
            'lat': self.lat,
            'lng': self.lng,
            'address_hint': self.address_hint,
            'title': self.title,
            'body': self.body,
            'is_urgent': self.is_urgent,
            'is_verified': self.is_verified,
            'is_anonymous': self.is_anonymous,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'confirmation_count': self.confirmation_count,
            'comment_count': self.comment_count,
            'dispute_count': self.dispute_count,
            'media': [m.to_dict() for m in self.media],
        }

        # si hay disputes activas, incluir resumen
        if self.dispute_count > 0:
            from sqlalchemy import func
            reason_counts = (
                db.session.query(DisputeReason.label, func.count(ReportDispute.id))
                .join(ReportDispute, ReportDispute.reason_id == DisputeReason.id)
                .filter(ReportDispute.report_id == self.id)
                .group_by(DisputeReason.label)
                .all()
            )
            d['disputes_summary'] = {
                'count': self.dispute_count,
                'status': 'en revisión' if self.status == 'under_review' else 'reportado',
                'reasons': [{'label': r[0], 'count': r[1]} for r in reason_counts],
            }

        # si el viewer está autenticado, indicar si ya confirmó o reportó
        if viewer_id:
            d['viewer_confirmed'] = any(c.user_id == viewer_id for c in self.confirmations)
            d['viewer_disputed']  = any(dp.user_id == viewer_id for dp in self.disputes)

        if include_comments:
            d['comments'] = [c.to_dict() for c in self.comments]

        return d


class ReportMedia(db.Model):
    __tablename__ = 'report_media'

    id         = db.Column(db.Integer, primary_key=True)
    report_id  = db.Column(db.Integer, db.ForeignKey('reports.id'), nullable=False)
    media_type = db.Column(db.String(10), nullable=False)  # 'photo' | 'video'
    url        = db.Column(db.String(500), nullable=False)
    thumbnail  = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    report = db.relationship('Report', back_populates='media')

    def to_dict(self):
        return {'id': self.id, 'type': self.media_type, 'url': self.url, 'thumbnail': self.thumbnail}


# ─── Interacciones ────────────────────────────────────────────────────────────

class ReportConfirmation(db.Model):
    __tablename__ = 'report_confirmations'
    __table_args__ = (db.UniqueConstraint('report_id', 'user_id'),)

    id         = db.Column(db.Integer, primary_key=True)
    report_id  = db.Column(db.Integer, db.ForeignKey('reports.id'), nullable=False)
    user_id    = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    report = db.relationship('Report', back_populates='confirmations')
    user   = db.relationship('User', back_populates='confirmations')


class ReportDispute(db.Model):
    __tablename__ = 'report_disputes'
    __table_args__ = (db.UniqueConstraint('report_id', 'user_id'),)

    id         = db.Column(db.Integer, primary_key=True)
    report_id  = db.Column(db.Integer, db.ForeignKey('reports.id'), nullable=False)
    user_id    = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    reason_id  = db.Column(db.Integer, db.ForeignKey('dispute_reason_catalog.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    report = db.relationship('Report', back_populates='disputes')
    user   = db.relationship('User', back_populates='disputes')
    reason = db.relationship('DisputeReason', back_populates='disputes')


class Comment(db.Model):
    __tablename__ = 'comments'

    id           = db.Column(db.Integer, primary_key=True)
    report_id    = db.Column(db.Integer, db.ForeignKey('reports.id'), nullable=False)
    user_id      = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    body         = db.Column(db.Text, nullable=False)
    is_anonymous = db.Column(db.Boolean, default=False)
    created_at   = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    report = db.relationship('Report', back_populates='comments')
    author = db.relationship('User', back_populates='comments')

    def to_dict(self):
        if self.is_anonymous:
            author_data = {'nickname': 'Anónimo', 'avatar_color': '#6C757D', 'letter': 'A'}
        else:
            author_data = {
                'id': self.author.id,
                'nickname': self.author.nickname,
                'avatar_color': self.author.avatar_color,
                'letter': self.author.letter,
                'is_verified': self.author.is_verified,
            }
        return {
            'id': self.id,
            'author': author_data,
            'body': self.body,
            'is_anonymous': self.is_anonymous,
            'created_at': self.created_at.isoformat(),
        }
