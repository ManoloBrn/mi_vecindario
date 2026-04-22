from flask import Blueprint, jsonify
from models import Category, Neighborhood, DisputeReason, BadgeCatalog

bp = Blueprint('catalogs', __name__, url_prefix='/api')


@bp.get('/categories')
def list_categories():
    cats = Category.query.order_by(Category.sort_order).all()
    return jsonify([c.to_dict() for c in cats])


@bp.get('/neighborhoods')
def list_neighborhoods():
    hoods = Neighborhood.query.order_by(Neighborhood.name).all()
    return jsonify([n.to_dict() for n in hoods])


@bp.get('/dispute-reasons')
def list_dispute_reasons():
    reasons = DisputeReason.query.all()
    return jsonify([r.to_dict() for r in reasons])


@bp.get('/badges')
def list_badges():
    badges = BadgeCatalog.query.all()
    return jsonify([b.to_dict() for b in badges])
