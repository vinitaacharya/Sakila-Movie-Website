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
@app.route('/rent', methods=['POST'])
def rent_movie():
    data = request.json
    customer_id = data.get("customer_id")
    film_id = data.get("film_id")

    customer = Customer.query.get(customer_id)
    film = Film.query.get(film_id)

    if not customer or not film:
        return jsonify({"error": "Customer or Film not found"}), 404

    # Get the inventory ID for the specified film in the store (store_id = 1 by default)
    store_id = 1  # Default store ID
    inventory = Inventory.query.filter_by(store_id=store_id, film_id=film_id).first()

    if not inventory:
        return jsonify({"error": "Film not available in the store"}), 404

    # Check if there are available copies of the film in the store
    available_copies = db.session.query(Inventory).filter_by(store_id=store_id, film_id=film_id).count()

    if available_copies > 0:
        # Default staff ID (set to 1 for now)
        staff_id = 1

        # Proceed with rental, using inventory_id instead of film_id
        new_rental = Rental(inventory_id=inventory.inventory_id, customer_id=customer_id, staff_id=staff_id)
        db.session.add(new_rental)
        db.session.commit()
        return jsonify({"message": f"Movie rented to {customer.first_name} {customer.last_name}"}), 200
    else:
        return jsonify({"error": "No copies available for rent in store"}), 400





@app.route("/films", methods=["GET"])
def get_films():
    search_query = request.args.get("search", "")
    filter_by = request.args.get("filter", "title")  # Default to title

    # Determine the column to filter by
    if filter_by == "actor":
        filter_column = "CONCAT(a.first_name, ' ', a.last_name)"
    elif filter_by == "category":
        filter_column = "c.name"
    else:
        filter_column = "f.title"  # Default to title

    # SQL query with dynamic WHERE clause
    query = text(f"""
        SELECT f.film_id, f.title, c.name as category,f.description, 
               GROUP_CONCAT(CONCAT(a.first_name, ' ', a.last_name)) AS actors
        FROM film f
        JOIN film_category fc ON f.film_id = fc.film_id
        JOIN category c ON fc.category_id = c.category_id
        JOIN film_actor fa ON f.film_id = fa.film_id
        JOIN actor a ON fa.actor_id = a.actor_id
        WHERE {filter_column} LIKE :search_query
        GROUP BY f.film_id, c.name;
    """)

    # Execute the query and fetch results as dictionaries
    results = db.session.execute(query, {"search_query": f"%{search_query}%"})
    
    # Convert results to dictionaries
    films = [dict(row) for row in results.mappings().fetchall()]
    
    return jsonify(films)





@app.route('/return/<int:rental_id>', methods=['PUT'])
def return_book(rental_id):
    today = datetime.today().date()  # Get today's date
    rental = db.session.query(Rental).filter_by(rental_id=rental_id, return_date=None).first()

    if rental:
        # Update the return date to today's date
        rental.return_date = today

        # If you have a rental status, you can set it to 'returned' or similar
        rental.status = 'returned'  # If this field exists

        # Commit changes to the database
        db.session.commit()

        # Access the movie title through the relationship
        movie_title = rental.inventory.film.title  # Assumes relationship is set up

        print(f"Rental ID: {rental_id}, Movie Title: {movie_title}")  # Debug print

        # Return a success message with rental details
        return jsonify({
            "rental_id": rental.rental_id,
            "movie_title": movie_title,  # movie title from the Film table
            "rental_date": rental.rental_date,
            "return_date": rental.return_date
        }), 200
    else:
        # If rental is not found or already returned
        return jsonify({"error": "Rental not found or already returned"}), 404



@app.route("/rentals/<int:customer_id>", methods=["GET"])
def get_customer_rentals(customer_id):
    rentals = db.session.execute(
        text("""
            SELECT c.customer_id, c.first_name, f.title, r.rental_date, r.rental_id, r.return_date
            FROM customer c
            JOIN rental r ON c.customer_id = r.customer_id
            JOIN inventory i ON r.inventory_id = i.inventory_id
            JOIN film f ON i.film_id = f.film_id
            WHERE c.customer_id = :customer_id
        """), 
        {"customer_id": customer_id}
    ).fetchall()

    rental_data = [
        {
            "customer_id": row.customer_id,
            "name": row.first_name,
            "title": row.title,
            "rental_date": row.rental_date,
            "rental_id": row.rental_id,
            "return_date": row.return_date
        } 
        for row in rentals
    ]

    return jsonify(rental_data)

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
            Film.description,
            Film.rating,
            Film.release_year,
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
            {"film_id": film.film_id, "title": film.title,"description":film.description,"release_year":film.release_year,"rating":film.rating, "category": film.category, "rented": film.rented}
            for film in films
        ])
#grt films
from sqlalchemy import text  # Ensure text is imported

@app.route('/films', methods=['GET'])
def get_all_films():
    # Using SQLAlchemy's text() function to run the query
    films = db.session.execute(text("""
        SELECT f.film_id, f.title, c.category_id, c.name
        FROM category c
        JOIN film_category fc ON fc.category_id = c.category_id
        JOIN film f ON f.film_id = fc.film_id;
    """)).fetchall()  # Execute the query and fetch all results

    # Return the data in JSON format
    return jsonify([
        {'film_id': film[0], 'title': film[1], 'category_id': film[2], 'category': film[3]}
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
    app.run(debug=True)
    