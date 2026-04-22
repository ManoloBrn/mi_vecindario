import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from db import db


def create_app(config: dict | None = None) -> Flask:
    app = Flask(__name__)

    # ── Configuración ─────────────────────────────────────────────────────────
    app.config.update(
        SQLALCHEMY_DATABASE_URI  = os.environ.get('DATABASE_URL', 'sqlite:///vecindario.db'),
        SQLALCHEMY_TRACK_MODIFICATIONS = False,
        JWT_SECRET_KEY           = os.environ.get('JWT_SECRET', 'dev-secret-change-in-prod'),
        JWT_ACCESS_TOKEN_EXPIRES = False,   # sin expiración en dev; usar timedelta en prod
    )
    if config:
        app.config.update(config)

    # ── Extensiones ───────────────────────────────────────────────────────────
    db.init_app(app)
    JWTManager(app)
    CORS(app, resources={r'/api/*': {'origins': '*'}})

    # ── Blueprints ────────────────────────────────────────────────────────────
    from routes.auth     import bp as auth_bp
    from routes.reports  import bp as reports_bp
    from routes.users    import bp as users_bp
    from routes.catalogs import bp as catalogs_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(reports_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(catalogs_bp)

    # ── Crear tablas si no existen ────────────────────────────────────────────
    with app.app_context():
        db.create_all()

    # ── Error handlers ────────────────────────────────────────────────────────
    @app.errorhandler(404)
    def not_found(_):
        return jsonify({'error': 'Recurso no encontrado'}), 404

    @app.errorhandler(405)
    def method_not_allowed(_):
        return jsonify({'error': 'Método no permitido'}), 405

    @app.errorhandler(500)
    def internal_error(e):
        db.session.rollback()
        return jsonify({'error': 'Error interno del servidor'}), 500

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=8000)
