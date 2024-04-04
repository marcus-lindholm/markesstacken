 #!/usr/bin/env python3
from datetime import datetime
from flask import Flask
from flask import jsonify
from flask import abort
from flask import request
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_bcrypt import generate_password_hash
from flask_bcrypt import check_password_hash
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import imghdr
import os
from flask import render_template, redirect, url_for, abort, send_from_directory
from werkzeug.utils import secure_filename


app = Flask(__name__, static_folder='../client', static_url_path='/')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your_secret_key' 
app.config['UPLOAD_EXTENSIONS'] = ['.jpg', '.png', '.gif']
app.config['UPLOAD_PATH'] = '../client/images/pictures'

bcrypt = Bcrypt(app)
jwt = JWTManager(app)
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, nullable=False)
    firstName = db.Column(db.String, nullable=False)
    lastName = db.Column(db.String, nullable=False)
    is_admin = db.Column(db.Boolean, default=False, nullable=True)
    password_hash = db.Column(db.String, nullable=False)
    shoppingcart_id = db.Column(db.Integer, db.ForeignKey('shopping_cart.id'), nullable=True)
    shoppingcart = db.relationship('ShoppingCart', backref='shopping_cart', lazy=True, uselist=False)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=True)
    orders = db.relationship('Order', backref='order_id', lazy=True, uselist=True)

    def __repr__(self):
        return f'<User {self.id}: {self.name} ({self.email})>'

    def serialize(self):
        return dict(id=self.id, firstName=self.firstName, lastName=self.lastName, email=self.email, is_admin=self.is_admin, 
                    orders=[order.serialize() for order in self.orders] if self.orders else None, shoppingcart=self.shoppingcart.serialize() if self.shoppingcart else None)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password).decode('utf8')

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Car(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    make = db.Column(db.String, nullable=False)
    model = db.Column(db.String, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable = True)

    user = db.relationship('User', backref='user_cars', lazy=True)

    def __repr__(self):
        return f'<Car {self.id}: {self.make} {self.model}>'

    def serialize(self):
        return dict(id=self.id, make=self.make, model=self.model, user_id=self.user_id)

class Subcategory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=True)
    category = db.relationship('Category', backref='subcategories', lazy=True)

    def __repr__(self):
        return f'<Subcategory {self.id}: {self.name}: {self.category}>'
    
    def serialize(self):
        return dict(
            id=self.id, 
            name=self.name, 
            category=self.category.serialize() if self.category else None
        )

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)

    def __repr__(self):
        return f'<Category {self.id}: {self.name}>'

    def serialize(self):
        return dict(id=self.id, name=self.name)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    price = db.Column(db.Float, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    name = db.Column(db.String, unique=True, nullable=False)
    description = db.Column(db.String, nullable=True)
    #img = db.Column(db.LargeBinary, nullable=True) #eget image library (imgID)
    subcategory_id = db.Column(db.Integer, db.ForeignKey('subcategory.id'), nullable=True)
    subcategory = db.relationship('Subcategory', backref='products', lazy=True, foreign_keys=[subcategory_id])

    def __repr__(self):
        return f'<Product {self.id}: {self.name}: {self.price}>'
    
    def serialize(self):
        return dict(id=self.id, name=self.name, price=self.price, quantity=self.quantity,
            description=self.description, img=self.img, subcategory=self.subcategory.serialize() if self.subcategory else None)
        
class CartItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)    
    quantity = db.Column(db.Integer, nullable=False) #quantity of each product
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    product = db.relationship('Product', backref='cartitems', lazy=True)
    shoppingcart_id = db.Column(db.Integer, db.ForeignKey('shopping_cart.id'), nullable=False)
    shoppingcart = db.relationship('ShoppingCart', backref='cartitems', lazy=True)

    def __repr__(self):
        return f'<CartItem {self.id}: {self.quantity}'
    
    def serialize(self):
        return dict(id=self.id, quantity=self.quantity, product=self.product.serialize() if self.product else None)

class ShoppingCart(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    def __repr__(self):
        return f'<ShoppingCart {self.id}>'
    
    def serialize(self):
        return {
            'id': self.id,
            'cartitems': [cartitem.serialize() for cartitem in self.cartitems]
        }

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    shoppingcart_id = db.Column(db.Integer, db.ForeignKey('shopping_cart.id'), nullable=False)
    shoppingcart = db.relationship('ShoppingCart', backref='orders', lazy=True)
    payment_id = db.Column(db.Integer, db.ForeignKey('payment.id'), nullable=False)
    payment = db.relationship('Payment', backref='orders', lazy=True)
    
    def __repr__(self):
        return f'<Order {self.id}>'
    
    def serialize(self):
        return {
            'id': self.id,
            'shoppingcart': self.shoppingcart.serialize() if self.shoppingcart else None,
            'payment': self.payment.serialize() if self.payment else None
        }

class Payment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    paymentDate = db.Column(db.DateTime, nullable=False) 
    paymentAmount = db.Column(db.Float, nullable=False)

    def __repr__(self):
        return f'<Payment {self.id}: {self.paymentAmount}'
    
    def serialize(self):
        return {
            'id': self.id,
            'paymentDate': self.paymentDate,
            'paymentAmount': self.paymentAmount
        }
    
with app.app_context():
    db.drop_all() #Remove before production
    db.create_all()
    db.session.commit()

    #THIS IS ONLY FOR DEFAULT CLASSES AND/OR TESTING
    category1 = Category(name='Kravaller')
    category2 = Category(name='Övrigt')
    db.session.add(category1)
    db.session.add(category2)
    subcat1 = Subcategory(name='UK', category=category1)
    subcat2 = Subcategory(name='Festivallen', category=category1)
    db.session.add(subcat1)
    db.session.add(subcat2)
    product1 = Product(name='UK 2022', price=30, quantity=100, description='Märke från UK 2022.', subcategory=subcat1)
    product2 = Product(name='Festivallen 1995', price=50, quantity=10, description='Märke från Festivallen 1995.', subcategory=subcat2)
    db.session.add(product1)
    db.session.add(product2)
    shoppingcart1 = ShoppingCart()
    db.session.add(shoppingcart1)
    cartitem1 = CartItem(quantity=2, product=product1, shoppingcart_id=1)
    cartitem2 = CartItem(quantity=3, product=product2, shoppingcart_id=1)
    db.session.add(cartitem1)
    db.session.add(cartitem2)
    user1 = User(email='johndoe@mail.com', firstName='John', lastName='Doe', is_admin=False, shoppingcart_id=1)
    user1.set_password('password')
    db.session.add(user1)
    payment1 = Payment(paymentDate=datetime.now(), paymentAmount=100.0)
    db.session.add(payment1)
    order1 = Order(shoppingcart=shoppingcart1, payment=payment1)
    db.session.add(order1)
    user1.orders.append(order1)

    db.session.commit()

@app.route('/payments', methods=['GET', 'POST'], endpoint='payments')
#@jwt_required()
def payments():
    if request.method == 'GET':
        payments = Payment.query.all()
        payment_list = [payment.serialize() for payment in payments]
        return jsonify(payment_list)

    elif request.method == 'POST' and get_jwt_identity().is_admin:
        data = request.get_json()
        new_payment = Payment(paymentDate=datetime.now(), paymentAmount=data['paymentAmount'])
        db.session.add(new_payment)
        db.session.commit()
        return jsonify(new_payment.serialize()), 201

@app.route('/orders', methods=['GET', 'POST'], endpoint='orders')
#@jwt_required()
def orders():
    if request.method == 'GET':
        orders = Order.query.all()
        order_list = [order.serialize() for order in orders]
        return jsonify(order_list)

    elif request.method == 'POST' and get_jwt_identity().is_admin:
        data = request.get_json()
        new_order = Order()
        db.session.add(new_order)
        db.session.commit()
        return jsonify(new_order.serialize()), 201

@app.route('/orders/<int:order_id>', methods=['GET', 'PUT', 'DELETE'], endpoint='order_by_id')
#@jwt_required()
def order_by_id(order_id):
    order = Order.query.get_or_404(order_id)

    if request.method == 'GET':
        return jsonify(order.serialize())

    elif request.method == 'PUT' and get_jwt_identity().is_admin:
        data = request.get_json()
        if 'shoppingcart_id' in data:
            order.shoppingcart_id = data['shoppingcart_id']
        db.session.commit()
        return jsonify(order.serialize()), 200

    elif request.method == 'DELETE' and get_jwt_identity().is_admin:
        db.session.delete(order)
        db.session.commit()
        return jsonify("Success!"), 200

@app.route('/shoppingcarts', methods=['GET', 'POST'], endpoint='shoppingcarts')
#@jwt_required()
def shoppingcarts():
    if request.method == 'GET':
        shoppingcarts = ShoppingCart.query.all()
        shoppingcart_list = [shoppingcart.serialize() for shoppingcart in shoppingcarts]
        return jsonify(shoppingcart_list)

    elif request.method == 'POST' and get_jwt_identity().is_admin:
        data = request.get_json()
        new_shoppingcart = ShoppingCart()
        db.session.add(new_shoppingcart)
        db.session.commit()
        return jsonify(new_shoppingcart.serialize()), 201

@app.route('/shoppingcarts/<int:shoppingcart_id>', methods=['GET', 'PUT', 'DELETE'], endpoint='shoppingcart_by_id')
#@jwt_required()
def shoppingcart_by_id(shoppingcart_id):
    shoppingcart = ShoppingCart.query.get_or_404(shoppingcart_id)

    if request.method == 'GET':
        return jsonify(shoppingcart.serialize())

    elif request.method == 'PUT' and get_jwt_identity().is_admin:
        data = request.get_json()
        if 'cartitems' in data:
            shoppingcart.cartitems = data['cartitems']
        db.session.commit()
        return jsonify(shoppingcart.serialize()), 200

    elif request.method == 'DELETE' and get_jwt_identity().is_admin:
        db.session.delete(shoppingcart)
        db.session.commit()
        return jsonify("Success!"), 200

@app.route('/cartitems', methods=['GET', 'POST'], endpoint='cartitems')
#@jwt_required()
def cartitems():
    if request.method == 'GET':
        cartitems = CartItem.query.all()
        cartitem_list = [cartitem.serialize() for cartitem in cartitems]
        return jsonify(cartitem_list)

    elif request.method == 'POST' and get_jwt_identity().is_admin:
        data = request.get_json()
        new_cartitem = CartItem(quantity=data['quantity'], product_id=data['product_id'])
        db.session.add(new_cartitem)
        db.session.commit()
        return jsonify(new_cartitem.serialize()), 201

@app.route('/cartitems/<int:cartitem_id>', methods=['GET', 'PUT', 'DELETE'], endpoint='cartitem_by_id')
#@jwt_required()
def cartitem_by_id(cartitem_id):
    cartitem = CartItem.query.get_or_404(cartitem_id)

    if request.method == 'GET':
        return jsonify(cartitem.serialize())

    elif request.method == 'PUT' and get_jwt_identity().is_admin:
        data = request.get_json()
        if 'quantity' in data:
            cartitem.quantity = data['quantity']
        if 'product_id' in data:
            cartitem.product_id = data['product_id']
        db.session.commit()
        return jsonify(cartitem.serialize()), 200

    elif request.method == 'DELETE' and get_jwt_identity().is_admin:
        db.session.delete(cartitem)
        db.session.commit()
        return jsonify("Success!"), 200

@app.route('/products', methods=['GET', 'POST'], endpoint='products')
#@jwt_required()
def products():
    if request.method == 'GET':
        products = Product.query.all()
        product_list = [product.serialize() for product in products]
        return jsonify(product_list)

    elif request.method == 'POST' and get_jwt_identity().is_admin:
        def validate_image(stream):
            header = stream.read(512)  # 512 bytes should be enough for a header check
            stream.seek(0)  # reset stream pointer
            format = imghdr.what(None, header)
            if not format:
                return None
            return '.' + (format if format != 'jpeg' else 'jpg')
    
        data = request.get_json()
        new_product = Product(name=data['name'], price=data['price'], quantity=data['quantity'], description=data['description'])

        uploaded_file = request.files['file']
        filename = secure_filename(uploaded_file.filename)
        if filename != '':
            file_ext = os.path.splitext(filename)[1]
            if file_ext not in app.config['UPLOAD_EXTENSIONS'] or \
                file_ext != validate_image(uploaded_file.stream):
                abort(400)
            uploaded_file.save(os.path.join(app.config['UPLOAD_PATH'], data['name']))

        db.session.add(new_product)
        db.session.commit()
        return jsonify(new_product.serialize()), 201

@app.route('/products/<int:product_id>', methods=['GET', 'PUT', 'DELETE'], endpoint='product_by_id')
#@jwt_required()
def product_by_id(product_id):
    product = Product.query.get_or_404(product_id)

    if request.method == 'GET':
        return jsonify(product.serialize())

    elif request.method == 'PUT' and get_jwt_identity().is_admin:
        data = request.get_json()
        if 'name' in data:
            product.name = data['name']
        if 'price' in data:
            product.price = data['price']
        if 'quantity' in data:
            product.quantity = data['quantity']
        if 'description' in data:
            product.description = data['description']
        if 'img' in data:
            product.img = data['img']
        if 'subcategory_id' in data:
            product.subcategory_id = data['subcategory_id']
        db.session.commit()
        return jsonify(product.serialize()), 200

    elif request.method == 'DELETE' and get_jwt_identity().is_admin:
        db.session.delete(product)
        db.session.commit()
        return jsonify("Success!"), 200 

@app.route('/subcategories', methods=['GET', 'POST'], endpoint='subcategories')
#@jwt_required()
def subcategories():
    if request.method == 'GET':
        subcategories = Subcategory.query.all()
        subcategory_list = [subcategory.serialize() for subcategory in subcategories]
        return jsonify(subcategory_list)

    elif request.method == 'POST' and get_jwt_identity().is_admin:
        data = request.get_json()
        new_subcategory = Subcategory(name=data['name'], category_id=data['category_id'])
        db.session.add(new_subcategory)
        db.session.commit()
        return jsonify(new_subcategory.serialize()), 201

@app.route('/subcategories/<int:subcategory_id>', methods=['GET', 'PUT', 'DELETE'], endpoint='subcategory_by_id')
#@jwt_required()
def subcategory_by_id(subcategory_id):
    subcategory = Subcategory.query.get_or_404(subcategory_id)

    if request.method == 'GET':
        return jsonify(subcategory.serialize())

    elif request.method == 'PUT' and get_jwt_identity().is_admin:
        data = request.get_json()
        if 'name' in data:
            subcategory.name = data['name']
        if 'category_id' in data:
            subcategory.category_id = data['category_id']
        db.session.commit()
        return jsonify(subcategory.serialize()), 200

    elif request.method == 'DELETE' and get_jwt_identity().is_admin:
        db.session.delete(subcategory)
        db.session.commit()
        return jsonify("Success!"), 200

@app.route('/categories', methods=['GET', 'POST'], endpoint='categories')
#@jwt_required()
def categories():
    if request.method == 'GET':
        categories = Category.query.all()
        category_list = [category.serialize() for category in categories]
        return jsonify(category_list)

    elif request.method == 'POST' and get_jwt_identity().is_admin:
        data = request.get_json()
        new_category = Category(name=data['name'])
        db.session.add(new_category)
        db.session.commit()
        return jsonify(new_category.serialize()), 201
    
@app.route('/categories/<int:category_id>', methods=['GET', 'PUT', 'DELETE'], endpoint='category_by_id')
#@jwt_required()
def category_by_id(category_id):
    category = Category.query.get_or_404(category_id)

    if request.method == 'GET':
        return jsonify(category.serialize())

    elif request.method == 'PUT' and get_jwt_identity().is_admin:
        data = request.get_json()
        if 'name' in data:
            category.name = data['name']
        db.session.commit()
        return jsonify(category.serialize()), 200

    elif request.method == 'DELETE' and get_jwt_identity().is_admin:
        db.session.delete(category)
        db.session.commit()
        return jsonify("Success!"), 200

@app.route('/sign-up', methods=['POST'])
def sign_up():
    data = request.get_json()

    if 'email' not in data or 'name' not in data or 'password' not in data:
        return jsonify({"error": "Missing required fields"}), 400  # 400 Bad Request
    email = data['email']
    name = data['name']
    password = data['password']

    # Create a new user
    new_user = User(email=email, name=name)
    new_user.set_password(password)

    # Save the new user to the database
    db.session.add(new_user)
    db.session.commit()

    access_token = create_access_token(identity=new_user.id)

    return jsonify({"message": "User created successfully", "access_token": access_token}), 201  # 200 OK


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if 'email' not in data or 'password' not in data:
        return jsonify({"error": "Missing required fields"}), 400  # 400 Bad Request

    email = data['email']
    password = data['password']

    user = User.query.filter_by(email=data['email']).first()

    if user and user.check_password(password):
        # Password is correct, generate an access token
        access_token = create_access_token(identity=user.id)

        # Return the token and user data (excluding password hash)
        response = {
            'token' : access_token,
            'user' : user.serialize()
        }
        return jsonify(response)
    else:
        return jsonify({"error": "Invalid email or password"}), 401  # 401 Unauthorized

@app.route('/users', methods=['GET', 'POST'], endpoint = 'users')
#@jwt_required()
def users():
    if request.method == 'GET':
        # Handle GET request
        users = User.query.all()
        user_list = [user.serialize() for user in users]
        return jsonify(user_list)

    elif request.method == 'POST':
        # Handle POST request
        data = request.get_json()

        new_user = User(name=data['name'], email=data['email'])
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify(new_user.serialize()), 201

@app.route('/users/<int:user_id>', methods=['GET', 'PUT', 'DELETE'], endpoint = 'get_user_by_id')
@jwt_required()
def get_user_by_id(user_id):
    current_user = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        abort(404)

    if request.method == 'GET':
        return jsonify(user.serialize())

    elif request.method == 'PUT':
        data = request.get_json()
        if 'name' in data:
            user.name = data['name']
        if 'email' in data:
            user.email = data['email']
        if 'is_admin' in data:
            user.is_admin = data['is_admin']

        db.session.commit()
        return jsonify(user.serialize()), 200

    elif request.method == 'DELETE':
        user_id = user.id

        # cars_to_reset = Car.query.filter_by(user_id=user_id).all()

        # for car in cars_to_reset:
        #     car.user = None

        db.session.delete(user)
        db.session.commit()
        return jsonify("Success!"), 200

@app.route('/users/<int:user_id>/cars', methods=['GET'], endpoint = 'get_cars_by_user')
@jwt_required()
def get_cars_by_user(user_id):

    user = User.query.get(user_id)

    if not user:
        abort(404)

    if request.method == 'GET' :

     cars = user.cars
     car_list = []

    for car in cars:
        car_data = car.serialize()

        car_list.append(car_data)
        car_data.pop('user_id', None)

    return jsonify(car_list)

#labb2
@app.route("/")
def client():
    return app.send_static_file("client.html")



if __name__ == "__main__":
    app.run(port=5001) # På MacOS, byt till 5001 eller dylikt

