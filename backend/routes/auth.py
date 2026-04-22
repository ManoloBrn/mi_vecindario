import random
import string
from datetime import datetime, timezone

from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from db import db
from models import User

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# En producción esto sería Redis con TTL. Aquí es un dict en memoria para demo.
_otp_store: dict[str, str] = {}


def _generate_public_id() -> str:
    while True:
        pid = str(random.randint(10000, 99999))
        if not User.query.filter_by(public_id=pid).first():
            return pid


@bp.post('/request-otp')
def request_otp():
    """Solicitar código SMS. En demo siempre devuelve 123456."""
    data = request.get_json(silent=True) or {}
    phone = data.get('phone', '').strip()
    if not phone:
        return jsonify({'error': 'phone requerido'}), 400

    otp = ''.join(random.choices(string.digits, k=6))
    _otp_store[phone] = otp
    # En producción: enviar SMS vía Twilio / Vonage
    print(f'[OTP] {phone} → {otp}')          # solo para desarrollo; en prod usar SMS
    return jsonify({'message': 'Código enviado'}), 200


@bp.post('/verify-otp')
def verify_otp():
    """Verificar código. Si el usuario no existe, indicar que debe completar perfil."""
    data  = request.get_json(silent=True) or {}
    phone = data.get('phone', '').strip()
    otp   = data.get('otp', '').strip()

    stored = _otp_store.get(phone)
    if not stored or stored != otp:
        return jsonify({'error': 'Código inválido o expirado'}), 401

    del _otp_store[phone]

    user = User.query.filter_by(phone=phone).first()
    if user:
        token = create_access_token(identity=str(user.id))
        return jsonify({'token': token, 'user': user.to_dict(public=False), 'needs_setup': False})

    # Usuario nuevo: devolver token temporal con phone codificado
    temp_token = create_access_token(identity=f'new:{phone}')
    return jsonify({'token': temp_token, 'needs_setup': True}), 200


@bp.post('/setup-profile')
@jwt_required()
def setup_profile():
    """Completar registro: elegir nickname (primera vez)."""
    identity = get_jwt_identity()
    if not identity.startswith('new:'):
        return jsonify({'error': 'Perfil ya configurado'}), 400

    phone = identity[4:]
    data  = request.get_json(silent=True) or {}
    nickname = data.get('nickname', '').strip()

    if not nickname or len(nickname) < 3:
        return jsonify({'error': 'Nickname debe tener al menos 3 caracteres'}), 400
    if User.query.filter_by(nickname=nickname).first():
        return jsonify({'error': 'Nickname no disponible'}), 409

    user = User(
        public_id    = _generate_public_id(),
        nickname     = nickname,
        phone        = phone,
        avatar_color = data.get('avatar_color', '#2E7D5B'),
        joined_at    = datetime.now(timezone.utc),
    )
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({'token': token, 'user': user.to_dict(public=False)}), 201


@bp.get('/me')
@jwt_required()
def get_me():
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    return jsonify(user.to_dict(public=False))
