from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from models import db, Customer, Inventory, Rental, FilmCategory, Film,Category, Actor, FilmActor
from flask_cors import CORS
from flask import request
from sqlalchemy.sql import func
from sqlalchemy import text
from datetime import datetime  # Import datetime module

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root:vinita2004@localhost/sakila'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # To avoid warnings

db.init_app(app)
# class Actor(db.Model):
#     __tablename__='actor'

#     actor_id = db.Column(db.Integer, primary_key=True)
#     first_name = db.Column(db.String(45), nullable=False)
#     last_name = db.Column(db.String(45), nullable=False)
#     last_update = db.Column(db.DateTime)

#     def __repr__(self):
#         return f"<Actor {self.first_name} {self.last_name}>"
    
# #members api route
# @app.route('/actors')
# def get_actors():
#     actors = Actor.query.all()  # Query all actors
#     return jsonify([{
#         'actor_id': actor.actor_id,
#         'first_name': actor.first_name,
#         'last_name': actor.last_name
#     } for actor in actors])
@app.route("/actor-films/<int:actor_id>", methods=["GET"])
def get_actor_films(actor_id):
    from models import Film, Actor, FilmActor

    # top 5 rented films for actorss
    films = db.session.execute(
        text("""
        SELECT f.film_id, f.title, COUNT(r.rental_id) AS rented
        FROM film f
        JOIN film_actor fa ON f.film_id = fa.film_id
        JOIN actor a ON fa.actor_id = a.actor_id
        JOIN inventory i ON f.film_id = i.film_id
        JOIN rental r ON i.inventory_id = r.inventory_id
        WHERE a.actor_id = :actor_id
        GROUP BY f.film_id, f.title
        ORDER BY rented DESC
        LIMIT 5
        """),
        {"actor_id": actor_id},
    ).fetchall()

    films_data = [{"film_id": f.film_id, "title": f.title, "rented": f.rented} for f in films]

    return jsonify(films_data)

@app.route('/customers/<int:customer_id>', methods=['PUT'])
def update_customer(customer_id):
    customer = Customer.query.get(customer_id)
    if not customer:
        return jsonify({"error": "Customer not found"}), 404

    data = request.json
    customer.first_name = data.get("first_name", customer.first_name)
    customer.last_name = data.get("last_name", customer.last_name)
    customer.email = data.get("email", customer.email)

    db.session.commit()
    return jsonify({
        "customer_id": customer.customer_id,
        "first_name": customer.first_name,
        "last_name": customer.last_name,
        "email": customer.email
    }), 200

@app.route('/customers/<int:customer_id>', methods=['DELETE'])
def delete_customer(customer_id):
    customer = Customer.query.get(customer_id)
    if customer:
        db.session.delete(customer)
        db.session.commit()
        return jsonify({"message": "Customer deleted successfully"}), 200
    return jsonify({"error": "Customer not found"}), 404

@app.route('/customers', methods=['POST'])
def add_customer():
    data = request.get_json()

    store_id = data.get('store_id', 1)  
    address_id = data.get('address_id', 1)  
    first_name = data['first_name']
    last_name = data['last_name']
    email = data['email']
    
    create_date = datetime.utcnow()
    
    new_customer = Customer(
        store_id=store_id,
        first_name=first_name,
        last_name=last_name,
        email=email,
        address_id=address_id,
        create_date=create_date
    )
    
    db.session.add(new_customer)
    db.session.commit()
    
    return jsonify({
        'customer_id': new_customer.customer_id,
        'first_name': new_customer.first_name,
        'last_name': new_customer.last_name,
        'email': new_customer.email,
    }), 201
@app.route('/top-films-data', methods=['GET'])
def get_top_films_data():
    query = text("""
        SELECT fc.film_id, f.title, c.name, COUNT(r.rental_id) AS rented
        FROM rental r, inventory i, film f , film_category fc, category c
        WHERE (r.inventory_id = i.inventory_id) 
        AND (i.film_id = f.film_id) 
        AND (f.film_id = fc.film_id) 
        AND (fc.category_id = c.category_id) 
        GROUP BY fc.film_id, f.title, c.name
        ORDER BY rented DESC, f.title ASC
        LIMIT 5;
    """)

    result = db.session.execute(query).fetchall()

    films = [
        {
            'film_id': film[0],
            'title': film[1],
            'category': film[2],
            'rented': film[3]
        }
        for film in result
    ]
    
    return jsonify(films)

@app.route('/top-actors', methods=['GET'])
def get_top_actors():
    with app.app_context():
        query = db.session.query(
            Actor.actor_id,
            Actor.first_name,
            Actor.last_name,
            func.count(FilmActor.film_id).label("film_count")
        ).join(FilmActor, Actor.actor_id == FilmActor.actor_id) \
         .join(Film, FilmActor.film_id == Film.film_id) \
         .join(Inventory, Film.film_id == Inventory.film_id) \
         .group_by(Actor.actor_id, Actor.first_name, Actor.last_name) \
         .order_by(db.desc("film_count")) \
         .limit(5)

        actors = query.all()

        return jsonify([
            {"actor_id": actor.actor_id, "first_name": actor.first_name, "last_name": actor.last_name, "film_count": actor.film_count}
            for actor in actors
        ])
#top movies
@app.route('/top-films', methods=['GET'])
def get_top_films():
    with app.app_context():
        query = db.session.query(
            FilmCategory.film_id,
            Film.title,
            Category.name.label("category"),
            db.func.count(Rental.rental_id).label("rented")
        ).join(Film, FilmCategory.film_id == Film.film_id) \
         .join(Category, FilmCategory.category_id == Category.category_id) \
         .join(Inventory, Film.film_id == Inventory.film_id) \
         .join(Rental, Inventory.inventory_id == Rental.inventory_id) \
         .group_by(FilmCategory.film_id, Film.title, Category.name) \
         .order_by(db.desc("rented"), Film.title.asc()) \
         .limit(5)

        films = query.all()

        return jsonify([
            {"film_id": film.film_id, "title": film.title, "category": film.category, "rented": film.rented}
            for film in films
        ])
#grt films
@app.route('/films', methods=['GET'])
def get_films():
    search_query = request.args.get('search', '').strip() 
    query = db.session.query(Film.film_id, Film.title, Category.category_id, Category.name).\
        join(FilmCategory, Film.film_id == FilmCategory.film_id).\
        join(Category, FilmCategory.category_id == Category.category_id).\
        join(FilmActor, Film.film_id == FilmActor.film_id).\
        join(Actor, FilmActor.actor_id == Actor.actor_id)

    if search_query:
        query = query.filter(
            (Film.title.ilike(f"%{search_query}%")) |  
            (Actor.first_name.ilike(f"%{search_query}%")) |  
            (Actor.last_name.ilike(f"%{search_query}%")) |  
            (Category.name.ilike(f"%{search_query}%"))  
        )

    films = query.all()
    return jsonify([
        {'film_id': film.film_id, 'title': film.title, 'category_id': film.category_id, 'category': film.name}
        for film in films
    ])
# get customers
@app.route('/customers', methods=['GET'])
def get_customers():
    with app.app_context(): 
        customers = Customer.query.all()  
        return jsonify([{
            'customer_id': customer.customer_id,
            'first_name': customer.first_name,
            'last_name': customer.last_name,
            'email': customer.email
        } for customer in customers])
if __name__ == "__main__":
    with app.app_context():
        db.create_all() 
    