from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Integer, Enum, Float
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, timedelta
import secrets



db = SQLAlchemy()


class Users(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String, unique=False, nullable=True)
    last_name = db.Column(db.String, unique=False, nullable=True)
    email = db.Column(db.String, unique=True, nullable=False)
    phone_number = db.Column(db.String, unique=True, nullable=True)
    address = db.Column(db.String, unique=False, nullable=True)
    profile_image = db.Column(db.String, unique=False, nullable=True)
    password = db.Column(db.String, unique=False, nullable=False)
    created_at = db.Column(db.Date, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, unique=False, nullable=False)
    is_admin = db.Column(db.Boolean, nullable=False)
    
    # Campos nuevos para recuperación de contraseña
    reset_token = db.Column(db.String, unique=True, nullable=True)
    reset_token_expires = db.Column(db.DateTime, nullable=True)

    def __repr__(self):
        return f'<Users:{self.id} - email: {self.email} >'
    
    def generate_reset_token(self, expires_in=3600):
        self.reset_token = secrets.token_urlsafe(32)
        self.reset_token_expires = datetime.utcnow() + timedelta(seconds=expires_in)
        return self.reset_token

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "phone_number": self.phone_number,
            "address": self.address,
            "profile_image": self.profile_image or None,
            "is_active": self.is_active,
            "is_admin": self.is_admin
        }
    

class Bookings(db.Model):
    __tablename__ = 'bookings'
    id = db.Column(db.Integer, primary_key=True)
    start_date = db.Column(db.Date, unique=False, nullable=False)
    end_date = db.Column(db.Date, unique=False, nullable=False)
    total_price = db.Column(db.Float, unique=False, nullable=True)
    status_reserved = db.Column(db.Enum("active", "ocupated", "cancelled", name="status_reserved"),
                                nullable=False, default="active")
    # hut_price_per_night = db.Column(db.Float, unique=False, nullable=False )
    guests = db.Column(db.Integer, nullable=False)
    special_requests = db.Column(db.String(500), unique=False, nullable=True)
    created_at = db.Column(db.Date, default=datetime.utcnow)
    payment_date = db.Column(db.Date, default=datetime.utcnow)
    transaction_payment = db.Column(db.String, unique=False, nullable=True)
    status_payment = db.Column(db.Boolean, unique=False, nullable=True)
    hut_id = db.Column(db.Integer, db.ForeignKey(
        'huts.id', ondelete="CASCADE"))
    hut_to = db.relationship('Huts', foreign_keys=[hut_id])
    user_id = db.Column(db.Integer, db.ForeignKey(
        'users.id', ondelete="CASCADE"))
    user_to = db.relationship('Users', foreign_keys=[user_id])

    def __repr__(self):
        return f'<Booking {self.id} - Hut {self.hut_id}>'

    def serialize(self):
        return {
            'id': self.id,
            'hut_id': self.hut_id,
            'user_id': self.user_id,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat(),
            'total_price': self.total_price,
            'status_reserved': self.status_reserved,
            'guests': self.guests,
            'special_requests': self.special_requests,
            'status_payment': self.status_payment,
            'hut_to': self.hut_to.serialize()}


class Huts(db.Model):
    __tablename__ = 'huts'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=False, nullable=False)
    description = db.Column(db.String, unique=False, nullable=False)
    capacity = db.Column(db.Integer, unique=False, nullable=False)
    bedrooms = db.Column(db.Integer, unique=False, nullable=False)
    bathroom = db.Column(db.Integer, unique=False, nullable=False)
    price_per_night = db.Column(db.Float, unique=False, nullable=False)
    location_id = db.Column(db.Integer, db.ForeignKey(
        'locations.id', ondelete="CASCADE"))
    location_to = db.relationship('Locations', foreign_keys=[location_id])
    is_active = db.Column(db.Boolean, unique=False, nullable=False)
    image_url = db.Column(db.String, unique=False, nullable=False)

    def __repr__(self):
        return f'<Huts {self.name}>'

    def serialize(self):
        return {'id': self.id,
                'name': self.name,
                'description': self.description,
                'capacity': self.capacity,
                'bedrooms': self.bedrooms,
                'bathroom': self.bathroom,
                'price_per_night': self.price_per_night,
                'location_id': self.location_id,
                'is_active': self.is_active,
                'image_url': self.image_url,
                'location_to': self.location_to.serialize() if self.location_to else None
                }


class HutFavorites(db.Model):
    __tablename__ = 'hut_favorites'
    id = db.Column(db.Integer, primary_key=True)
    hut_id = db.Column(db.Integer, db.ForeignKey(
        'huts.id', ondelete="CASCADE"))
    hut_to = db.relationship('Huts', foreign_keys=[hut_id])
    user_id = db.Column(db.Integer, db.ForeignKey(
        'users.id', ondelete="CASCADE"))
    user_to = db.relationship('Users', foreign_keys=[user_id])

    def __repr__(self):
        return f'<Huts_favorites:{self.id}'

    def serialize(self):
        return {'id': self.id,
                'hut_id': self.hut_id,
                'user_id': self.user_id,
                'hut_name': self.hut_to.name,
                'hut_image_url': self.hut_to.image_url,
                'hut_to': self.hut_to.serialize()
               }


class HutsAlbum(db.Model):
    __tablename__ = 'huts_album'
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.Enum("bedroom", "bathroom", "living_room",
                     "kitchen", "other_picture", name="type"))
    image_url = db.Column(db.String, unique=False, nullable=False)
    hut_id = db.Column(db.Integer, db.ForeignKey(
        'huts.id', ondelete="CASCADE"))
    hut_to = db.relationship('Huts', foreign_keys=[hut_id])

    def __repr__(self):
        return f'<HutsAlbum {self.id}>'

    def serialize(self):
        return {'id': self.id,
                'hut_id': self.hut_id,
                'type': self.type,
                'image_url': self.image_url}


class Locations(db.Model):
    __tablename__ = 'locations'
    id = db.Column(db.Integer, primary_key=True)
    complex = db.Column(db.String, unique=False, nullable=False)
    latitude = db.Column(db.Float, unique=False, nullable=False)
    longitude = db.Column(db.Float, unique=False, nullable=False)
    address = db.Column(db.String, unique=False, nullable=False)
    city = db.Column(db.String, unique=False, nullable=False)
    region = db.Column(db.String, unique=False, nullable=False)

    def __repr__(self):
        return f'<Location {self.id} - {self.city}>'

    def serialize(self):
        return {'id': self.id,
                'complex': self.complex,
                'position': {
                    'lat': self.latitude,
                    'lng': self.longitude
                },
                'address': self.address,
                'city': self.city,
                'region': self.region}


class Reviews(db.Model):
    __tablename__ = 'reviews'
    id = db.Column(db.Integer, primary_key=True)
    rating = db.Column(db.Integer)
    comment = db.Column(db.String)
    created_at = db.Column(db.Date, default=datetime.utcnow)
    hut_id = db.Column(db.Integer, db.ForeignKey(
        'huts.id', ondelete="CASCADE"))
    hut_to = db.relationship('Huts', foreign_keys=[hut_id])
    user_id = db.Column(db.Integer, db.ForeignKey(
        'users.id', ondelete="CASCADE"))
    user_to = db.relationship('Users', foreign_keys=[user_id])

    def __repr__(self):
        return f'<Review {self.id} - Hut {self.hut_id} by User {self.user_id}>'

    def serialize(self):
        return {'id': self.id,
                'hut_id': self.hut_id,
                'user_id': self.user_id,
                'user_name': self.user_to.first_name,
                'rating': self.rating,
                'comment': self.comment,
                'created_at': self.created_at.isoformat()}
