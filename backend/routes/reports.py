import math
from datetime import datetime, timezone

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request

from db import db
from models import (
    Report, ReportConfirmation, ReportDispute, ReportMedia,
    Comment, Category, Neighborhood, User, DisputeReason
)

bp = Blueprint('reports', __name__, url_prefix='/api/reports')


def _haversine_km(lat1, lng1, lat2, lng2) -> float:
    """Distancia en km entre dos puntos (para filtro de radio)."""
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng/2)**2
    return R * 2 * math.asin(math.sqrt(a))


def _current_user_id() -> int | None:
    try:
        verify_jwt_in_request(optional=True)
        uid = get_jwt_identity()
        return int(uid) if uid and not uid.startswith('new:') else None
    except Exception:
        return None


# ─── GET /api/reports ─────────────────────────────────────────────────────────

@bp.get('')
def list_reports():
    """
    Parámetros opcionales:
      lat, lng, radius_km  → filtro geográfico (default radio 2 km)
      category             → slug de categoría
      neighborhood_id      → id de colonia
      status               → 'active' | 'resolved' | … (default 'active')
      limit                → máx resultados (default 50)
      offset               → paginación
    """
    viewer_id = _current_user_id()

    lat       = request.args.get('lat', type=float)
    lng       = request.args.get('lng', type=float)
    radius    = request.args.get('radius_km', 2.0, type=float)
    category  = request.args.get('category')
    hood_id   = request.args.get('neighborhood_id', type=int)
    status    = request.args.get('status', 'active')
    limit     = min(request.args.get('limit', 50, type=int), 200)
    offset    = request.args.get('offset', 0, type=int)

    q = Report.query.filter_by(status=status)

    if category:
        cat = Category.query.filter_by(slug=category).first()
        if cat:
            q = q.filter_by(category_id=cat.id)

    if hood_id:
        q = q.filter_by(neighborhood_id=hood_id)

    reports = q.order_by(Report.created_at.desc()).offset(offset).limit(limit).all()

    # filtro de radio (post-query, SQLite no tiene geo funcions nativas)
    if lat is not None and lng is not None:
        reports = [r for r in reports if _haversine_km(lat, lng, r.lat, r.lng) <= radius]

    return jsonify({
        'reports': [r.to_dict(viewer_id=viewer_id) for r in reports],
        'total': len(reports),
    })


# ─── GET /api/reports/:id ─────────────────────────────────────────────────────

@bp.get('/<int:report_id>')
def get_report(report_id):
    viewer_id = _current_user_id()
    report = db.session.get(Report, report_id)
    if not report:
        return jsonify({'error': 'Reporte no encontrado'}), 404
    return jsonify(report.to_dict(include_comments=True, viewer_id=viewer_id))


# ─── POST /api/reports ────────────────────────────────────────────────────────

@bp.post('')
@jwt_required()
def create_report():
    user_id = int(get_jwt_identity())
    user    = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    data = request.get_json(silent=True) or {}
    errors = {}
    if not data.get('category'):  errors['category'] = 'requerido'
    if not data.get('lat'):       errors['lat'] = 'requerido'
    if not data.get('lng'):       errors['lng'] = 'requerido'
    if not data.get('title'):     errors['title'] = 'requerido'
    if errors:
        return jsonify({'errors': errors}), 400

    cat = Category.query.filter_by(slug=data['category']).first()
    if not cat:
        return jsonify({'error': 'Categoría no válida'}), 400

    hood = Neighborhood.query.filter_by(slug=data.get('neighborhood', 'roma-norte')).first()

    report = Report(
        user_id         = user_id,
        category_id     = cat.id,
        neighborhood_id = hood.id if hood else None,
        lat             = data['lat'],
        lng             = data['lng'],
        address_hint    = data.get('address_hint'),
        title           = data['title'][:200],
        body            = data.get('body'),
        is_anonymous    = data.get('is_anonymous', user.anon_by_default),
        is_urgent       = data.get('is_urgent', False),
    )
    db.session.add(report)

    # adjuntar media si viene en el payload
    for m in data.get('media', []):
        db.session.add(ReportMedia(
            report=report,
            media_type=m.get('type', 'photo'),
            url=m['url'],
            thumbnail=m.get('thumbnail'),
        ))

    # incrementar contador del usuario
    user.report_count += 1
    user.karma += 5

    db.session.commit()
    return jsonify(report.to_dict()), 201


# ─── PUT /api/reports/:id ─────────────────────────────────────────────────────

@bp.put('/<int:report_id>')
@jwt_required()
def update_report(report_id):
    user_id = int(get_jwt_identity())
    report  = db.session.get(Report, report_id)
    if not report:
        return jsonify({'error': 'Reporte no encontrado'}), 404
    if report.user_id != user_id:
        return jsonify({'error': 'Sin permiso'}), 403

    data = request.get_json(silent=True) or {}
    if 'title' in data:   report.title    = data['title'][:200]
    if 'body'  in data:   report.body     = data['body']
    if 'status' in data and data['status'] in ('active', 'resolved'):
        report.status = data['status']
    if 'is_urgent' in data: report.is_urgent = bool(data['is_urgent'])
    report.updated_at = datetime.now(timezone.utc)

    db.session.commit()
    return jsonify(report.to_dict())


# ─── DELETE /api/reports/:id ──────────────────────────────────────────────────

@bp.delete('/<int:report_id>')
@jwt_required()
def delete_report(report_id):
    user_id = int(get_jwt_identity())
    report  = db.session.get(Report, report_id)
    if not report:
        return jsonify({'error': 'Reporte no encontrado'}), 404
    if report.user_id != user_id:
        return jsonify({'error': 'Sin permiso'}), 403

    db.session.delete(report)
    db.session.commit()
    return '', 204


# ─── POST /api/reports/:id/confirm ────────────────────────────────────────────

@bp.post('/<int:report_id>/confirm')
@jwt_required()
def confirm_report(report_id):
    user_id = int(get_jwt_identity())
    report  = db.session.get(Report, report_id)
    if not report:
        return jsonify({'error': 'Reporte no encontrado'}), 404
    if report.user_id == user_id:
        return jsonify({'error': 'No puedes confirmar tu propio reporte'}), 400

    existing = ReportConfirmation.query.filter_by(report_id=report_id, user_id=user_id).first()
    if existing:
        # toggle: quitar confirmación
        db.session.delete(existing)
        report.confirmation_count = max(0, report.confirmation_count - 1)
        db.session.commit()
        return jsonify({'confirmed': False, 'confirmation_count': report.confirmation_count})

    confirmation = ReportConfirmation(report_id=report_id, user_id=user_id)
    db.session.add(confirmation)
    report.confirmation_count += 1
    # karma para el autor del reporte
    report.author.karma += 2
    report.author.confirmation_count += 1
    db.session.commit()
    return jsonify({'confirmed': True, 'confirmation_count': report.confirmation_count})


# ─── POST /api/reports/:id/dispute ────────────────────────────────────────────

@bp.post('/<int:report_id>/dispute')
@jwt_required()
def dispute_report(report_id):
    user_id = int(get_jwt_identity())
    report  = db.session.get(Report, report_id)
    if not report:
        return jsonify({'error': 'Reporte no encontrado'}), 404

    if ReportDispute.query.filter_by(report_id=report_id, user_id=user_id).first():
        return jsonify({'error': 'Ya denunciaste este reporte'}), 409

    data      = request.get_json(silent=True) or {}
    reason_id = data.get('reason_id')
    reason    = db.session.get(DisputeReason, reason_id) if reason_id else None
    if not reason:
        return jsonify({'error': 'reason_id requerido'}), 400

    dispute = ReportDispute(report_id=report_id, user_id=user_id, reason_id=reason.id)
    db.session.add(dispute)
    report.dispute_count += 1
    # poner en revisión si supera umbral
    if report.dispute_count >= 3:
        report.status = 'under_review'
    db.session.commit()
    return jsonify({'dispute_count': report.dispute_count, 'status': report.status}), 201


# ─── GET /api/reports/:id/comments ────────────────────────────────────────────

@bp.get('/<int:report_id>/comments')
def list_comments(report_id):
    report = db.session.get(Report, report_id)
    if not report:
        return jsonify({'error': 'Reporte no encontrado'}), 404
    return jsonify([c.to_dict() for c in report.comments])


# ─── POST /api/reports/:id/comments ───────────────────────────────────────────

@bp.post('/<int:report_id>/comments')
@jwt_required()
def add_comment(report_id):
    user_id = int(get_jwt_identity())
    user    = db.session.get(User, user_id)
    report  = db.session.get(Report, report_id)
    if not report:
        return jsonify({'error': 'Reporte no encontrado'}), 404

    data = request.get_json(silent=True) or {}
    body = (data.get('body') or '').strip()
    if not body:
        return jsonify({'error': 'body requerido'}), 400

    comment = Comment(
        report_id    = report_id,
        user_id      = user_id,
        body         = body,
        is_anonymous = data.get('is_anonymous', user.anon_by_default),
    )
    db.session.add(comment)
    report.comment_count += 1
    db.session.commit()
    return jsonify(comment.to_dict()), 201
