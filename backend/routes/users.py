from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from db import db
from models import User, Report, Category, UserFollowedCategory

bp = Blueprint('users', __name__, url_prefix='/api/users')


# ─── GET /api/users/me ────────────────────────────────────────────────────────

@bp.get('/me')
@jwt_required()
def get_me():
    user = db.session.get(User, int(get_jwt_identity()))
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    return jsonify(user.to_dict(public=False))


# ─── PUT /api/users/me ────────────────────────────────────────────────────────

@bp.put('/me')
@jwt_required()
def update_me():
    user = db.session.get(User, int(get_jwt_identity()))
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    data = request.get_json(silent=True) or {}

    if 'bio' in data:
        user.bio = data['bio'][:300] if data['bio'] else None
    if 'avatar_color' in data:
        user.avatar_color = data['avatar_color']
    if 'neighborhood_id' in data:
        user.neighborhood_id = data['neighborhood_id']

    # settings
    settings = data.get('settings', {})
    if 'anon_by_default' in settings:
        user.anon_by_default = bool(settings['anon_by_default'])
    if 'notif_security' in settings:
        user.notif_security = bool(settings['notif_security'])
    if 'notif_replies' in settings:
        user.notif_replies = bool(settings['notif_replies'])
    if 'notif_announcements' in settings:
        user.notif_announcements = bool(settings['notif_announcements'])

    db.session.commit()
    return jsonify(user.to_dict(public=False))


# ─── GET /api/users/:id ───────────────────────────────────────────────────────

@bp.get('/<int:user_id>')
def get_user(user_id):
    user = db.session.get(User, user_id)
    if not user or not user.is_active:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    return jsonify(user.to_dict(public=True))


# ─── GET /api/users/me/reports ────────────────────────────────────────────────

@bp.get('/me/reports')
@jwt_required()
def my_reports():
    user_id = int(get_jwt_identity())
    status  = request.args.get('status', 'active')
    limit   = min(request.args.get('limit', 20, type=int), 100)
    offset  = request.args.get('offset', 0, type=int)

    reports = (
        Report.query
        .filter_by(user_id=user_id, status=status)
        .order_by(Report.created_at.desc())
        .offset(offset).limit(limit)
        .all()
    )
    return jsonify([r.to_dict() for r in reports])


# ─── GET /api/users/me/confirmed-reports ──────────────────────────────────────

@bp.get('/me/confirmed-reports')
@jwt_required()
def confirmed_reports():
    """Reportes que el usuario ha confirmado (para tab 'Seguidos')."""
    from models import ReportConfirmation
    user_id = int(get_jwt_identity())
    limit   = min(request.args.get('limit', 20, type=int), 100)
    offset  = request.args.get('offset', 0, type=int)

    confs = (
        ReportConfirmation.query
        .filter_by(user_id=user_id)
        .order_by(ReportConfirmation.created_at.desc())
        .offset(offset).limit(limit)
        .all()
    )
    return jsonify([c.report.to_dict() for c in confs])


# ─── PUT /api/users/me/followed-categories ────────────────────────────────────

@bp.put('/me/followed-categories')
@jwt_required()
def update_followed_categories():
    """Reemplaza la lista completa de categorías seguidas."""
    user_id  = int(get_jwt_identity())
    data     = request.get_json(silent=True) or {}
    slugs    = data.get('categories', [])

    UserFollowedCategory.query.filter_by(user_id=user_id).delete()

    for slug in slugs:
        cat = Category.query.filter_by(slug=slug).first()
        if cat:
            db.session.add(UserFollowedCategory(user_id=user_id, category_id=cat.id))

    db.session.commit()
    return jsonify({'followed_categories': slugs})
