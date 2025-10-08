"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from datetime import datetime
from flask import Flask, request, jsonify, url_for, Blueprint
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from api.models import db, Users, Bookings, Huts, HutFavorites, HutsAlbum, Locations, Reviews
from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_jwt_extended import get_jwt
from flask_bcrypt import Bcrypt
import cloudinary.uploader
from cloudinary.utils import cloudinary_url

api = Blueprint('api', __name__)
CORS(api)

bcrypt = Bcrypt()


@api.route('/upload', methods=['POST'])
@jwt_required()
def upload_image():
    response_body = {}
    claims = get_jwt()

    if not claims:
        response_body['message'] = 'Usuario no autenticado'
        return response_body, 401

    if 'file' not in request.files:
        response_body['message'] = 'No se encontró ningún archivo'
        return response_body, 400

    file = request.files['file']
    if file.filename == '':
        response_body['message'] = 'Nombre de archivo vacío'
        return response_body, 400

    try:

        upload_result = cloudinary.uploader.upload(
            file,
            folder="huts_app",
            quality="auto",
            fetch_format="auto"
        )

        thumbnail_url, _ = cloudinary_url(
            upload_result['public_id'],
            width=300,
            height=300,
            crop="fill"
        )

        response_body.update({
            'message': 'Imagen subida correctamente',
            'original_url': upload_result['secure_url'],
            'public_id': upload_result['public_id'],
            'thumbnail_url': thumbnail_url,  # URL transformada
            # Truco para URL optimizada
            'optimized_url': upload_result['secure_url'].replace('/upload/', '/upload/f_auto,q_auto/')
        })

        return response_body, 200

    except Exception as e:
        response_body['message'] = f'Error al subir la imagen: {str(e)}'
        return response_body, 500


@api.route("/login", methods=["POST"])
def login():
    response_body = {}
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return {"message": "Email and password are required"}, 400
    email = email.lower()

    user = db.session.execute(db.select(Users).where(Users.email == email,
                                                     Users.is_active == True)).scalar()
    if not user:
        response_body['message'] = 'Bad email'
        return response_body, 401

    if not bcrypt.check_password_hash(user.password, password):
        response_body['message'] = 'Bad password'
        return response_body, 401
    claims = {'user_id': user.serialize()['id'],
              'is_admin': user.serialize()['is_admin'],
              'email': user.serialize()['email']}
    access_token = create_access_token(
        identity=email, additional_claims=claims)
    response_body['message'] = 'User logged OK'
    response_body['access_token'] = access_token
    response_body['results'] = user.serialize()
    return response_body, 200


@api.route('/register', methods=['POST'])
def register():
    response_body = {}
    data = request.json

    if not data.get('email'):
        response_body['message'] = 'Falta Email'
        return response_body, 400
    if not data.get('password'):
        response_body['message'] = 'Falta Password'
        return response_body, 400

    email = data.get('email').lower()

    existing_user = db.session.execute(
        db.select(Users).where(Users.email == email)
    ).scalar()

    if existing_user:
        response_body['message'] = 'El correo electrónico ya está registrado'
        return response_body, 409

    user = Users()
    user.email = email
    user.password = bcrypt.generate_password_hash(
        data.get('password')).decode("utf-8")
    user.first_name = data.get('first_name')
    user.is_active = True
    user.is_admin = data.get('is_admin', False)

    db.session.add(user)
    db.session.commit()

    claims = {
        'user_id': user.id,
        'is_admin': user.is_admin,
        'email': user.email
    }
    access_token = create_access_token(
        identity=user.email, additional_claims=claims)

    response_body['message'] = 'Usuario registrado exitosamente'
    response_body['access_token'] = access_token
    response_body['results'] = user.serialize()

    return response_body, 201


@api.route('/users', methods=['GET'])
def users():
    response_body = {}
    if request.method == 'GET':
        response_body['message'] = 'RECIBIDO'
        rows = db.session.execute(
            db.select(Users)
        ).scalars()
        response_body['results'] = [row.serialize() for row in rows]
        return response_body, 200

@api.route('/users/<int:id>', methods=['GET', 'PUT', 'DELETE'])
@jwt_required()
def user(id):
    response_body = {}
    claims = get_jwt()
    user = db.session.execute(db.select(Users).where(Users.id == id)).scalar()
    if not user:
        response_body['message'] = f'Usuario {id} no encontrado'
        response_body['results'] = {}
        return response_body, 403
    if request.method == 'GET':
        response_body['message'] = f'Usuario {id} encontrado'
        response_body['results'] = user.serialize()
        return response_body, 200
    if request.method == 'PUT':
        if claims['user_id'] != id:
            user_id = claims['user_id']
            response_body['message'] = f' El usuario {user_id} no tiene permiso para modificar los datos de {id}'
        data = request.json
        user.password = data.get('password', user.password)
        user.email = data.get('email', user.email)
        user.is_active = data.get('is_active', user.is_active)
        user.is_admin = data.get('is_admin', user.is_admin)
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.phone_number = data.get('phone_number', None)
        user.address = data.get('address', user.address)
        user.profile_image = data.get('profile_image', user.profile_image)
        db.session.commit()
        response_body['message'] = f'Usuario {id} modificado'
        response_body['results'] = user.serialize()
        return response_body, 200
    if request.method == 'DELETE':
        if claims['user_id'] != id:
            user_id = claims['user_id']
            response_body['message'] = f'El usuario{user_id} no tiene permiso a cancelar el {id}'
        user.is_active = False
        db.session.commit()
        response_body['message'] = f'Usuario {id} eliminado'
        response_body['results'] = None
        return response_body, 200


@api.route('/bookings/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_bookings(user_id):
    response_body = {}
    current_user_id = get_jwt_identity()
    is_admin = get_jwt_identity()
    if is_admin:
        bookings = Bookings.query.all()
    if current_user_id != user_id:
        response_body['success'] = False
        response_body['message'] = "No autorizado para ver estas reservas"
        return response_body, 403
    bookings = db.session.query(
        Bookings,
        Huts.name.label('hut_name'),
        Locations.name.label('location_name')
    ).join(
        Huts, Bookings.hut_id == Huts.id
    ).join(
        Locations, Huts.location_id == Locations.id
    ).filter(
        Bookings.user_id == user_id
    ).order_by(
        Bookings.start_date.desc()
    ).all()

    if not bookings:
        response_body['success'] = True
        response_body['message'] = "No se encontraron reservas"
        response_body['results'] = []
        return response_body, 200

    response_body['success'] = True
    response_body['message'] = "Lista de reservas obtenida exitosamente"
    response_body['results'] = [booking.serialize() for booking in bookings]
    return response_body, 200


@api.route('/bookings', methods=['GET'])
@jwt_required()
def get_bookings():
    response_body = {}
    claims = get_jwt()
    user_id = claims['user_id']
    is_admin = claims.get('is_admin', False)
    if is_admin:
        bookings = Bookings.query.all()
    else:
        bookings = Bookings.query.filter_by(
            user_id=user_id, status_reserved='active').all()

    response_body['message'] = 'Lista de reservas'
    response_body['results'] = [booking.serialize() for booking in bookings]
    return response_body, 200


@api.route('/bookings', methods=['POST'])
@jwt_required()
def post_bookings():
    response_body = {}
    claims = get_jwt()
    user_id = claims['user_id']
    data = request.json
    booking = Bookings()
    booking.start_date = data.get('start_date', None)
    booking.end_date = data.get('end_date', None)
    booking.hut_id = data.get('hut_id')
    overlapping_booking = Bookings.query.filter(
        Bookings.hut_id == booking.hut_id,
        Bookings.status_reserved == 'active',
        Bookings.start_date <= booking.end_date,
        Bookings.end_date >= booking.start_date
    ).first()
    if overlapping_booking:
        return "La hut ya esta ocupada", 409
    if data['start_date'] >= data['end_date']:
        response_body['message'] = 'La fecha de fin debe ser posterior a la de inicio'
        return response_body, 400
    hut = db.session.get(Huts, data['hut_id'])
    if not hut:
        response_body['message'] = 'Cabaña no encontrada'
        return response_body, 404
    booking.user_id = user_id
    booking.hut_id = data.get('hut_id')
    booking.start_date = data.get('start_date', None)
    booking.end_date = data.get('end_date', None)
    booking.total_price = data.get('total_price')
    booking.status_reserved = data.get('status_reserved', 'active')
    booking.guests = data.get('guests', None)
    booking.special_requests = data.get('special_requests')
    booking.created_at = data.get('created_at', None)
    booking.payment_date = data.get('payment_date', None)
    booking.transaction_payment = data.get('transation_payment', 'Card')
    booking.status_payment = data.get('status_payment', True)
    db.session.add(booking)
    db.session.commit()
    response_body['message'] = 'Respuesta del post de Bookings'
    response_body['success'] = True
    response_body['results'] = booking.serialize()
    return response_body, 201


@api.route('/bookings/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_bookings(id):
    response_body = {}
    claims = get_jwt()
    user_id = claims['user_id']
    is_admin = claims['is_admin']
    booking = Bookings.query.get(id)
    if not booking:
        response_body['message'] = 'La reserva no se ha encontrado'
        return response_body, 403
    if user_id != booking.user_id and not is_admin:
        response_body['message'] = 'Usuario no autorizado'
        return response_body, 409
    booking.status_reserved = 'cancelled'
    db.session.commit()
    response_body['message'] = 'Reserva cancelada exitosamente'
    response_body['results'] = booking.serialize()
    return response_body, 200


@api.route('/favorites', methods=['GET'])
@jwt_required()
def get_favorites():
    response_body = {}
    claims = get_jwt()
    user_id = claims['user_id']
    print(user_id)
    hut_favorites = HutFavorites.query.filter_by(user_id=user_id).all()
    print(hut_favorites)
    response_body['message'] = 'Lista de favoritos'
    response_body['results'] = [favorite.serialize()
                                for favorite in hut_favorites]
    return response_body, 200


@api.route('/favorites', methods=['POST'])
@jwt_required()
def add_favorite():
    response_body = {}
    claims = get_jwt()
    user_id = claims['user_id']
    data = request.json
    hut_id = data.get('hut_id')
    hut = db.session.execute(db.select(Huts).where(Huts.id == hut_id)).scalar()
    if not hut:
        response_body['message'] = f'La cabaña con ID {hut_id} no existe'
        return response_body, 404
    existing_favorite = db.session.execute(db.select(HutFavorites).where(
        (HutFavorites.user_id == user_id) &
        (HutFavorites.hut_id == hut_id)
    )).scalar()
    if existing_favorite:
        response_body['message'] = 'Esta cabaña ya está en tus favoritos'
        return response_body, 409
    new_favorite = HutFavorites()
    new_favorite.hut_id = hut_id
    new_favorite.user_id = user_id
    db.session.add(new_favorite)
    db.session.commit()
    response_body['message'] = 'Añadido en favoritos'
    response_body['results'] = new_favorite.serialize()
    return response_body, 201


@api.route('/favorites/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_favorite(id):
    response_body = {}
    claims = get_jwt()
    favorite = db.session.execute(
        db.select(HutFavorites).where(HutFavorites.id == id)
    ).scalar()
    if not favorite:
        response_body['message'] = f'El favorito con id {id} no existe'
        return response_body, 404
    if favorite.user_id != claims['user_id']:
        response_body['message'] = 'No tienes permiso para eliminar este favorito'
        return response_body, 403
    db.session.delete(favorite)
    db.session.commit()
    response_body['message'] = f'El usuario {claims["user_id"]} ha eliminado el favorito {id}'
    return response_body, 200


@api.route('/huts/map-data', methods=['GET'])
def get_huts_map_data():
    try:
        huts = Huts.query.join(Locations).filter(Huts.is_active == True).all()
        map_data = [{
            'id': hut.id,
            'name': hut.name,
            'price': hut.price_per_night,
            'position': {
                'lat': hut.location_to.latitude,
                'lng': hut.location_to.longitude
            },
            'image_url': hut.image_url
        } for hut in huts]

        return jsonify(map_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api.route('/locations', methods=['GET'])
def get_locations():
    response_body = {}
    locations = Locations.query.all()
    response_body['message'] = "Las localizaciones se han cargado correctamente."
    response_body['results'] = [location.serialize() for location in locations]
    return response_body, 200


@api.route('/locations/<int:id>', methods=['GET'])
def get_location(id):
    response_body = {}
    location = Locations.query.get(id)
    if not location:
        return jsonify({"message": "Localizacion no encontrada"}), 404
    response_body['message'] = "La localización se ha cargado correctamente."
    response_body['results'] = location.serialize()
    return response_body, 200


@api.route('/locations', methods=['POST'])
@jwt_required()
def post_location():
    response_body = {}
    claims = get_jwt()
    if not claims['is_admin']:
        user_id = claims['user_id']
        response_body['message'] = f'El usuario {user_id} no tiene permiso para agregar la localizacion'
        return response_body, 409
    data = request.get_json()
    new_location = Locations(
        complex=data.get("complex"),
        latitude=data.get("latitude"),
        longitude=data.get("longitude"),
        address=data.get("address"),
        city=data.get("city"),
        region=data.get("region"))
    db.session.add(new_location)
    db.session.commit()
    response_body['message'] = "La localización se ha añadido correctamente."
    response_body['results'] = new_location.serialize()
    return response_body, 200


@api.route('/locations/<int:id>', methods=['PUT'])
@jwt_required()
def put_location(id):
    response_body = {}
    claims = get_jwt()
    location = db.session.execute(
        db.select(Locations).where(Locations.id == id)).scalar()
    if not claims['is_admin']:
        user_id = claims['user_id']
        response_body['message'] = f' El usuario {user_id} no tiene permiso para modificar la localizacion'
        return response_body, 409
    data = request.json
    location.complex = data.get('complex', location.complex)
    location.latitude = data.get('latitude', location.latitude)
    location.longitude = data.get('longitude', location.longitude)
    location.address = data.get('address', location.address)
    location.city = data.get('city', location.city)
    location.region = data.get('region', location.region)
    db.session.commit()
    response_body['message'] = f'Localizacion {id} modificado'
    response_body['results'] = location.serialize()
    return response_body, 200


@api.route('/locations/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_location(id):
    response_body = {}
    claims = get_jwt()
    location = db.session.execute(
        db.select(Locations).where(Locations.id == id)).scalar()
    if not claims['is_admin']:
        user_id = claims['user_id']
        response_body['message'] = f'El usuario{user_id} no tiene permiso a cancelar el {id}'
        return response_body, 409
    db.session.delete(location)
    db.session.commit()
    response_body['message'] = f'Reseña {id} eliminada'
    return response_body, 200


@api.route('/reviews', methods=['GET'])
def get_reviews():
    response_body = {}
    response_body['message'] = "Las reviews se han cargado correctamente"
    rows = db.session.execute(db.select(Reviews)).scalars()
    response_body['results'] = [row.serialize() for row in rows]
    return response_body, 200


@api.route('/reviews/<int:id>', methods=['GET'])
def get_review(id):
    response_body = {}
    review = Reviews.query.get(id)
    if not review:
        response_body['message'] = 'La reseña no se ha encontrado'
        return response_body, 404
    response_body['message'] = 'La reseña se ha cargado correctamente'
    response_body['results'] = review.serialize()
    return response_body, 200


@api.route('/reviews', methods=['POST'])
@jwt_required()
def create_review():
    response_body = {}
    data = request.json
    claims = get_jwt()
    user_id = claims['user_id']
    new_review = Reviews(
        hut_id=data.get("hut_id"),
        user_id=user_id,
        rating=data.get("rating"),
        comment=data.get("comment"),
        created_at=data.get("created_at")
    )
    db.session.add(new_review)
    db.session.commit()
    response_body['message'] = 'El comentario se ha añadido correctamente'
    response_body['results'] = new_review.serialize()
    return response_body, 201


@api.route('/reviews/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_review(id):
    claims = get_jwt()
    response_body = {}
    review = Reviews.query.get(id)
    if not review:
        return jsonify({"message": "Reseña no encontrada"}), 404
    # Verificar si el usuario es el autor del review o el usuario es admin
    if claims["user_id"] != review.user_id and not claims["is_admin"]:
        response_body['message'] = 'Usuario no autorizado'
        return response_body, 409
    db.session.delete(review)
    db.session.commit()
    response_body['message'] = "Reseña eliminada correctamente"
    return response_body, 200


@api.route('/reviews/<int:id>', methods=['PUT'])
@jwt_required()
def put_review(id):
    response_body = {}
    claims = get_jwt()
    review = db.session.execute(
        db.select(Reviews).where(Reviews.id == id)).scalar()
    if not claims['is_admin']:
        user_id = claims['user_id']
        response_body['message'] = f'El usuario {user_id} no tiene permiso para modificar la reseña'
    data = request.json
    review.rating = data.get('rating', review.rating)
    review.comment = data.get('comment', review.comment)
    db.session.commit()
    response_body['message'] = f'Reseña {id} modificado'
    response_body['results'] = review.serialize()
    # response_body['results'] = [row.serialize() for row in rows]
    return response_body, 200


@api.route('/reviews/user/<int:user_id>', methods=['GET'])
@jwt_required()
def get_reviews_by_user(user_id):
    claims = get_jwt()
    if claims['user_id'] != user_id and not claims.get('is_admin'):
        return {"message": "No autorizado"}, 403
    rows = db.session.execute(
        db.select(Reviews).where(Reviews.user_id == user_id)
    ).scalars()
    return {
        "message": "Reseñas cargadas correctamente",
        "results": [row.serialize() for row in rows]
    }, 200


@api.route('/huts', methods=['POST'])
@jwt_required()
def post_huts():
    claims = get_jwt()
    response_body = {}
    if not claims.get('is_admin', False):
        response_body['message'] = 'Necesita permiso de administrador.'
        return response_body, 403
    data = request.json

    required_fields = ['name', 'description', 'capacity',
                       'bedrooms', 'bathroom', 'price_per_night', 'location_id']
    if not all(field in data for field in required_fields):
        return jsonify({"success": False, "message": "Faltan campos requeridos"}), 400

    hut = Huts()
    hut.name = data.get('name', hut.name)
    hut.description = data.get('description', hut.description)
    hut.capacity = data.get('capacity', hut.capacity)
    hut.bedrooms = data.get('bedrooms', hut.bedrooms)
    hut.bathroom = data.get('bathroom', hut.bathroom)
    hut.price_per_night = data.get('price_per_night', hut.price_per_night)
    hut.location_id = data.get('location_id', hut.location_id)
    hut.image_url = data.get('image_url', hut.image_url)
    hut.is_active = data.get('is_active', hut.is_active)
    db.session.add(hut)
    db.session.commit()
    response_body['message'] = 'La cabaña se ha añadido correctamente.'
    response_body['results'] = hut.serialize()
    return response_body, 201


@api.route('/huts', methods=['GET'])
def get_huts():
    response_body = {}
    response_body['message'] = "Las cabañas se han cargado correctamente."
    rows = db.session.execute(db.select(Huts)).scalars()
    response_body['results'] = [row.serialize() for row in rows]
    return jsonify(response_body), 200
    # if not row


@api.route('/huts/<int:id>', methods=['GET'])
def get_single_huts(id):
    response_body = {}
    response_body['message'] = "La cabaña se ha cargado correctamente"
    row = db.session.execute(
        db.select(Huts).where(Huts.id == id)).scalar()
    response_body['results'] = row.serialize()
    return response_body, 200


@api.route('/huts/<int:id>', methods=['PUT'])
@jwt_required()
def put_huts(id):
    response_body = {}
    data = request.json
    claims = get_jwt()
    if not claims.get('is_admin', False):
        response_body['message'] = "Se necesita permiso de administrador."
        return response_body, 403
    hut = db.session.get(Huts, id)
    if not hut:
        response_body['message'] = "Cabaña no encontrada."
        return response_body, 404
    if 'name' in data and data['name'] != hut.name:
        existing_name = db.session.execute(
            db.select(Huts).where(Huts.name == data['name'])).scalar()
        if existing_name:
            response_body['message'] = "El nombre ya existe."
            return response_body, 409
    hut.name = data.get('name', hut.name)
    hut.description = data.get('description', hut.description)
    hut.capacity = data.get('capacity', hut.capacity)
    hut.bedrooms = data.get('bedrooms', hut.bedrooms)
    hut.bathroom = data.get('bathroom', hut.bathroom)
    hut.image_url = data.get('image_url', hut.image_url)
    hut.price_per_night = data.get('price_per_night', hut.price_per_night)
    hut.location_id = data.get('location_id', hut.location_id)
    hut.is_active = data.get('is_active', hut.is_active)
    db.session.commit()
    response_body['message'] = 'Los datos de la cabaña se han actualizado correctamente.'
    response_body['results'] = hut.serialize()
    return response_body, 200


@api.route('/huts/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_hut(id):
    response_body = {}
    claims = get_jwt()
    if not claims.get('is_admin', False):
        response_body['message'] = 'Se requiere permiso de administrador'
        return response_body, 403
    hut = db.session.get(Huts, id)
    if not hut:
        response_body['message'] = f'La cabaña con ID {id} no existe.'
        return response_body, 404
    db.session.execute(db.delete(HutsAlbum).where(HutsAlbum.hut_id == id))
    db.session.delete(hut)
    db.session.commit()
    response_body['message'] = f'La cabaña {hut.name} se ha eliminado correctamente.'
    return response_body, 200


@api.route('/huts-album', methods=['GET'])
def get_huts_album():
    response_body = {}
    response_body['message'] = "Los albums de las cabañas se han cargado satisfactoriamente."
    rows = db.session.execute(db.select(HutsAlbum)).scalars()
    response_body['results'] = [row.serialize() for row in rows]
    return response_body, 200


@api.route('/huts-album/<int:id>', methods=['GET'])
def get_current_hut_album(id):
    response_body = {}
    if not db.session.get(Huts, id):
        response_body['message'] = "La cabaña no existe."
        return response_body, 404
    response_body['message'] = "El album de la cabaña se ha cargado satisfactoriamente."
    rows = db.session.execute(db.select(HutsAlbum).where(
        HutsAlbum.hut_id == id)).scalars()
    response_body['results'] = [row.serialize() for row in rows]
    return response_body, 200


# PRUEBA MEJORA HUTS ALBUM
@api.route('/huts-album', methods=['POST'])
@jwt_required()
def post_huts_album():
    response_body = {}
    claims = get_jwt()

    # Verificar permisos de administrador
    if not claims.get('is_admin', False):
        response_body['message'] = "Se necesita permiso de administrador."
        return response_body, 403

    # Verificar si es JSON (para URLs) o form-data (para archivos)
    if request.content_type == 'application/json':
        data = request.json
        hut_id = data.get('hut_id')
        photo_type = data.get('type')
        urls = data.get('urls', [])

        # Validaciones
        if not hut_id or not photo_type:
            response_body['message'] = "Faltan hut_id o type"
            return response_body, 400

        valid_types = ["bedroom", "bathroom",
                       "living_room", "kitchen", "other_picture"]
        if photo_type not in valid_types:
            response_body['message'] = "Tipo de foto no válido"
            return response_body, 400

        saved_photos = []
        for url in urls:
            new_photo = HutsAlbum(
                hut_id=hut_id,
                type=photo_type,
                image_url=url
            )
            db.session.add(new_photo)
            saved_photos.append(new_photo.serialize())

        db.session.commit()
        response_body['message'] = f"{len(urls)} imágenes guardadas desde URLs"
        response_body['results'] = saved_photos
        return response_body, 201

    else:
        # Aquí iría tu lógica original para subida de archivos (form-data)
        response_body['message'] = "Usa JSON con {hut_id, type, urls: []} para URLs existentes"
        return response_body, 400


@api.route('/huts-album/<int:id>', methods=['PUT'])
@jwt_required()
def put_huts_album(id):
    response_body = {}
    data = request.json
    valid_types = ['bedroom', 'bathroom',
                   'living_room', 'kitchen', 'other_picture']
    claims = get_jwt()
    if not claims.get('is_admin', False):
        response_body['message'] = 'Se necesita permiso de administrador.'
        return response_body, 403
    hut_album = db.session.get(HutsAlbum, id)
    if not hut_album:
        response_body['message'] = f'Album con el ID {id} no encontrado.'
        return response_body, 404
    if 'type' in data:
        if data['type'] not in valid_types:
            response_body['message'] = "Tipo no válido."
            return response_body, 400
        hut_album.type = data['type']
    if 'image_url' in data:
        hut_album.image_url = data['image_url']
    db.session.commit()
    response_body['message'] = f'El album con el {id} ha sido modificado correctamente.'
    response_body['results'] = hut_album.serialize()
    return response_body, 200


@api.route('/huts-album/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_hut_album(id):
    response_body = {}
    claims = get_jwt()
    if not claims.get('is_admin', False):
        response_body['message'] = "Necesita el permiso de administrador."
        return response_body, 403
    hut_album = db.session.get(HutsAlbum, id)
    if not hut_album:
        response_body['message'] = f'El album de la hut con ID {id} no existe.'
        return response_body, 404
    try:
        if hut_album.public_id:
            cloudinary.uploader.destroy(hut_album.public_id)
        db.session.delete(hut_album)
        db.session.commit()
        response_body['message'] = f'El album con el ID {id} ha sido eliminado.'
        return response_body, 200

    except Exception as e:
        db.session.rollback()
        response_body['message'] = f'Error al eliminar: {str(e)}'
        return response_body, 500


@api.route('/users/upload-avatar', methods=['POST'])
@jwt_required()
def upload_avatar():
    claims = get_jwt()
    user = db.session.get(Users, claims['user_id'])
    if not user:
        return jsonify({"message": "Usuario no encontrado"}), 404

    if 'avatar' not in request.files:
        return jsonify({"message": "No se envió ninguna imagen"}), 400

    file = request.files['avatar']

    try:
        upload_result = cloudinary.uploader.upload(
            file,
            folder="huts_app/avatars",
            width=300,
            height=300,
            crop="fill",
            quality="auto",
            fetch_format="auto"
        )
        optimized_url = upload_result['secure_url'].replace(
            '/upload/', '/upload/f_auto,q_auto/')

        user.profile_image = optimized_url
        db.session.commit()

        # ✅ Devuelve el usuario completo
        return jsonify({
            "url": optimized_url,
            "user": user.serialize()  # Asegúrate de que serialize() incluye todos los campos
        }), 200

    except Exception as e:
        return jsonify({"message": f"Error: {str(e)}"}), 500
