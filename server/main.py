 #!/usr/bin/env python3
import os
from datetime import datetime
import time
from flask import Flask
from flask import jsonify
from flask import abort
from flask import request
from flask import redirect
from flask import render_template
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_bcrypt import generate_password_hash
from flask_bcrypt import check_password_hash
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import stripe

app = Flask(__name__, static_folder='../client', static_url_path='/')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your_secret_key' 

bcrypt = Bcrypt(app)
jwt = JWTManager(app)
db = SQLAlchemy(app)

load_dotenv()
stripe.api_key = os.environ['STRIPE_SECRET_KEY']

wishlist = db.Table('wishlist',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('product_id', db.Integer, db.ForeignKey('product.id'), primary_key=True)
)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, nullable=False)
    firstName = db.Column(db.String, nullable=False)
    lastName = db.Column(db.String, nullable=False)
    is_admin = db.Column(db.Boolean, default=False, nullable=True)
    password_hash = db.Column(db.String, nullable=False)
    shoppingcart_id = db.Column(db.Integer, db.ForeignKey('shopping_cart.id'), nullable=False)
    shoppingcart = db.relationship('ShoppingCart', backref='shopping_cart', lazy=True, uselist=False)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=True)
    orders = db.relationship('Order', backref='order_id', lazy=True, uselist=True)
    wishlist = db.relationship('Product', secondary=wishlist, lazy='subquery',
        backref=db.backref('users', lazy=True))
    
    def __init__(self, **kwargs):
        super(User, self).__init__(**kwargs)
        self.shoppingcart = ShoppingCart()

    def check_if_in_wishlist(self, product):
        if product in self.wishlist:
            return product in self.wishlist

    def add_to_wishlist(self, product):
        if not self.check_if_in_wishlist(product):
            self.wishlist.append(product)
    
    def remove_from_wishlist(self, product):
        self.wishlist.remove(product)

    def __repr__(self):
        return f'<User {self.id}: {self.name} ({self.email})>'

    def serialize(self):
        return dict(id=self.id, firstName=self.firstName, lastName=self.lastName, email=self.email, is_admin=self.is_admin, 
                    orders=[order.serialize() for order in self.orders] if self.orders else None, shoppingcart=self.shoppingcart.serialize(), wishlist=[product.serialize() for product in self.wishlist] if self.wishlist else None)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password).decode('utf8')

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)



class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    
    def __repr__(self):
        return f'<Category {self.id}: {self.name}>'

    def serialize(self):
        return dict(id=self.id,
                    name=self.name)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    price = db.Column(db.Float, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    name = db.Column(db.String, nullable=False)
    description = db.Column(db.String, nullable=True)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=True)
    category = db.relationship('Category', backref='products', lazy=True)
    year = db.Column(db.Integer, nullable=True)
    section = db.Column(db.String, nullable=True)
    event = db.Column(db.String, nullable=True)
    organizer = db.Column(db.String, nullable=True)
    img = db.Column(db.String, nullable=True)
    number_of_sales = db.Column(db.Integer, default=0)
    
    def __repr__(self):
        return f'<Product {self.id}: {self.name}: {self.price}>'
    
    def serialize(self):
        return dict(id=self.id, name=self.name, price=self.price, quantity=self.quantity, description=self.description, year=self.year, section=self.section, event=self.event, organizer=self.organizer, img=self.img, number_of_sales=self.number_of_sales, category=self.category.serialize() if self.category else None)
    


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
    returned = db.Column(db.Boolean, default=False)
    
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
    
    product1 = Product(name='UK 2022', price=30, quantity=100, description='Märke från UK 2022. Jättefinmärke 10/10, Arian rekomenderar starkt. Rund cirkel typ som hjul eller ett ägg om man tittar på det rakt uppifrån.', category=category1, year = 2022, section = 'I-Sektionen', event = 'UK', organizer = 'CM', img = 'cm.jpeg')
    product2 = Product(name='Festivallen 1995', price=50, quantity=10, description='Märke från Festivallen 1995.', category=category2, year = 1995, section = 'Läk-Sektionen', event = 'FESTIVALLEN', organizer = 'MEDSEX', img = 'pub.jpeg')
    product3 = Product(name='Drat i spat 2022', price=25, quantity=40, description='Märke från Drat i spat 2022.', category=category2, year = 2022, section = 'I-Sektionen', event = 'DRAT I SPAT', organizer = 'CM', img = 'pub.jpeg')
    product4 = Product(name='Lemans 2023', price=40, quantity=10, description='Märke från Lemans 1995.', category=category2, year = 2023, section = 'M-Sektionen', event = 'LEMANS', organizer = 'FM', img = 'pub.jpeg')
    product5 = Product(name='VSR 2021', price=49, quantity=34, description='Märke från VSR 1995.', category=category2, year = 2021, section = 'Y-Sektionen', event = 'VSR', organizer = 'Y-SEX', img = 'pub.jpeg')
    product6 = Product(name='PALLEN 2020', price=19, quantity=5, description='Märke från Pallen 1995.', category=category2, year = 2020, section = 'LING-Sektionen', event = 'PALLEN', organizer = 'VILING', img = 'pub.jpeg')
    product7 = Product(name='I-Kravallen 2022', price=999, quantity=1, description='Märke från I-Kravallen 2022.', category=category2, year = 2022, section = 'I-Sektionen', event = 'I-KRAVALLEN', organizer = 'KLASSFÖRÄLDRARNA', img = 'I-Kravallen_2022.png')
    product8 = Product(name='Pengar & Piller 2023', price=9, quantity=27, description='Märke från Pengar & Piller 2023.', category=category2, year = 2023, section = 'I-Sektionen', event = 'Pengar & Piller', organizer = 'KLASSFÖRÄLDRARNA', img = 'Pengar___Piller_2023.png')
    product9 = Product(name='Nolle-P Reunion 2023', price=19, quantity=27, description='Märke från Nolle-P Reunion 2023.', category=category2, year = 2023, section = 'I-Sektionen', event = 'Nolle-P Reunion', organizer = 'KLASSFÖRÄLDRARNA', img = 'Nolle-P_Reunion_2023.png')
    product10 = Product(name='Munchen Hoben 2022', price=19, quantity=27, description='Märke från Munchen Hoben 2022.', category=category2, year = 2022,  section = 'LINKTEK', event = 'Munchen Hoben', organizer = 'LINKTEK', img = 'Munchen_hoben_2022.png')
    product11 = Product(name='Agent Limited Edition Märke', price=100, quantity=1, description='Exklusivt märke av Agent.', category=category2, year = 2021,  section = 'Övrigt', event = 'Övrigt', organizer = 'AGENT', img = 'AgentMärke.png')
    product12 = Product(name='Sydkorea Flagga', price=50, quantity=20, description='Korea.', category=category2, year = 2021,  section = 'Övrigt', event = 'Övrigt', organizer = 'Övrigt', img = 'Sydkorea.png')
    product13 = Product(name='SourFisk Märke', price=1000, quantity=1, description='Skepp och Hoj, SourFisk', category=category2, year = 2021,  section = 'Övrigt', event = 'Övrigt', organizer = 'Övrigt', img = 'SourFiskMärke.png')
    product14 = Product(name='B-Klass Gensists 2021', price=30, quantity=50, description='B-klass on Fire ', category=category2, year = 2021,  section = 'I-Sektionen', event = 'Generationssittning', organizer = 'Övrigt', img = 'BKlass.png')


    db.session.add(product1)
    db.session.add(product2)
    db.session.add(product3)
    db.session.add(product4)
    db.session.add(product5)
    db.session.add(product6)
    db.session.add(product7)
    db.session.add(product8)
    db.session.add(product9)
    db.session.add(product10)
    db.session.add(product11)
    db.session.add(product12)
    db.session.add(product13)
    db.session.add(product14)

    #shoppingcart1 = ShoppingCart()
    #db.session.add(shoppingcart1)
    cartitem1 = CartItem(quantity=2, product=product1, shoppingcart_id=1)
    cartitem2 = CartItem(quantity=3, product=product2, shoppingcart_id=1)
    db.session.add(cartitem1)
    db.session.add(cartitem2)
    cartitem3 = CartItem(quantity=2, product=product1, shoppingcart_id=2)
    db.session.add(cartitem3)
    user1 = User(email='johndoe@mail.com', firstName='John', lastName='Doe', is_admin=False)
    user2 = User(email='rgn@gmail', firstName='Ragnar', lastName='Lothbrok', is_admin=False)
    user3 = User(email='test@test', firstName='Test', lastName='Testsson', is_admin=False)
    user1.set_password('password')
    user2.set_password('password')
    user3.set_password('password')
    db.session.add(user1)
    db.session.add(user2)
    db.session.add(user3)
    payment1 = Payment(paymentDate=datetime.now(), paymentAmount=100.0)
    db.session.add(payment1)
    user1.add_to_wishlist(product2)
    user1.add_to_wishlist(product2)
    #order1 = Order(shoppingcart=shoppingcart1, payment=payment1)
    #db.session.add(order1)
    #user1.orders.append(order1)

    admin_user = User(email = 'admin@markesstacken.se', firstName = 'Admin', lastName = 'Admin', is_admin = True, shoppingcart_id = None)
    admin_user.set_password('admin')
    db.session.add(admin_user)

    db.session.commit()

@app.route('/wishlist', methods=['GET', 'POST'], endpoint='wishlist')
@jwt_required()
def wishlist():
    if request.method == 'GET':
        user = db.session.get(User, get_jwt_identity())
        wishlist = user.wishlist
        wishlist_list = [product.serialize() for product in wishlist]
        return jsonify(wishlist_list)

    elif request.method == 'POST':
        data = request.get_json()
        user = db.session.get(User, get_jwt_identity())
        product = db.session.get(Product, data['product_id'])
        user.add_to_wishlist(product)
        db.session.commit()
        return jsonify("Success!"), 200
    
@app.route('/wishlist/<int:product_id>', methods=['DELETE'], endpoint='remove_from_wishlist')
@jwt_required()
def wishlist_by_id(product_id):
    user = db.session.get(User, get_jwt_identity())
    product = db.session.get(Product, product_id)
    user.remove_from_wishlist(product)
    db.session.commit()
    return jsonify("Success!"), 200

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
@jwt_required()
def orders():
    if request.method == 'GET':
        orders = Order.query.all()
        order_list = [order.serialize() for order in orders]
        return jsonify(order_list)

    elif request.method == 'POST':
        data = request.get_json()
        user = db.session.get(User, get_jwt_identity())
        shoppingcartItems = user.shoppingcart.cartitems
        stripe_data_list = []
        for item in shoppingcartItems:
            product_data = {
                'price_data': {
                    'product_data': {
                        'name': item.product.name,
                    },
                    'unit_amount': int(item.product.price*100),
                    'currency': 'sek',
                },
                'quantity': item.quantity,
            }
            stripe_data_list.append(product_data)
        
        checkout_session = stripe.checkout.Session.create(
            line_items=stripe_data_list,
            payment_method_types=['card'],
            mode='payment',
            success_url=request.host_url + 'order/success',
            cancel_url=request.host_url + 'order/cancel',
        )
        return checkout_session.url


        # new_order = Order()
        # db.session.add(new_order)
        # db.session.commit()
        return jsonify(new_order.serialize()), 201
@app.route('/order/success')
def success():
    print('Success')
    return redirect('/?view=success')

@app.route('/order/cancel')
def cancel():
    print('Cancel')
    return redirect('/?view=cancel')

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

@app.route('/myShoppingCart', methods=['GET'], endpoint='myShoppingCart')
@jwt_required()
def myShoppingCart():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    return jsonify(user.shoppingcart.serialize())

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

    elif request.method == 'PUT':
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
@jwt_required()
def cartitems():
    if request.method == 'GET':
        cartitems = CartItem.query.all()
        cartitem_list = [cartitem.serialize() for cartitem in cartitems]
        return jsonify(cartitem_list)

    elif request.method == 'POST':
        data = request.get_json()
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if user is None:
            return jsonify("User not found!"), 404
        product_exists_in_cart = False
        for product in user.shoppingcart.cartitems:
            if product.product_id == data['product_id']:
                if product.quantity + int(data['quantity']) > product.product.quantity:
                    return jsonify("Not enough in stock"), 400
                product.quantity += int(data['quantity'])
                db.session.commit()
                product_exists_in_cart = True
                return jsonify("Product already in cart, increased quantity"), 200
        if not product_exists_in_cart:
            product_to_add = Product.query.get(data['product_id'])
            if product_to_add is None:
                return jsonify("Product not found!"), 404
            if int(data['quantity']) > product_to_add.quantity:
                return jsonify("Not enough in stock"), 400
            new_cartitem = CartItem(quantity=data['quantity'], product_id=data['product_id'], shoppingcart_id=data['shoppingcart_id'])
            db.session.add(new_cartitem)
            db.session.commit()
            return jsonify(new_cartitem.serialize()), 201

@app.route('/cartitems/<int:cartitem_id>', methods=['GET', 'PUT', 'DELETE'], endpoint='cartitem_by_id')
@jwt_required()
def cartitem_by_id(cartitem_id):
    cartitem = CartItem.query.get_or_404(cartitem_id)

    if request.method == 'GET':
        return jsonify(cartitem.serialize())

    elif request.method == 'PUT':
        data = request.get_json()
        if 'quantity' in data:
            cartitem.quantity = data['quantity']
        if 'product_id' in data:
            cartitem.product_id = data['product_id']
        db.session.commit()
        return jsonify(cartitem.serialize()), 200

    elif request.method == 'DELETE':
        #We use productID to delete the cartitem instead of CartItemID
        #cartitem_id = product.id in this case
        identity = get_jwt_identity()
        user = User.query.filter_by(id=identity).first()
        cartitem = next((item for item in user.shoppingcart.cartitems if item.product.id == cartitem_id), None)
        if cartitem is None:
            return jsonify("Cart item not found!"), 404
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

    elif request.method == 'POST': #and get_jwt_identity().is_admin:
        data = request.form
        file = request.files.get('img')
    if file:
        print('File uploaded')
        filename = secure_filename(file.filename)
        timestamp = str(time.time()).replace('.', '_')  # get current timestamp and replace '.' with '_'
        filename = f"{timestamp}_{filename}"
        dir_path = os.path.join('../client/product_images')
        os.makedirs(dir_path, exist_ok=True)
        file_path = os.path.join(dir_path, filename)
        file.save(file_path)
    else:
        print('No image uploaded')

    new_product = Product(name=data['name'], price=data['price'], quantity=data['quantity'], description=data['description'], category_id=data['category_id'], year = data['year'], section = data['section'], event = data['event'], organizer = data['organizer'], img = filename)
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
        # if 'subcategory_id' in data:
        #     product.subcategory_id = data['subcategory_id']
        db.session.commit()
        return jsonify(product.serialize()), 200

    elif request.method == 'DELETE': #and get_jwt_identity().is_admin:
        if product.img:
            image_path = os.path.join('../client/product_images', product.img)
            if os.path.exists(image_path):
                os.remove(image_path)
        db.session.delete(product)
        db.session.commit()
    return jsonify("Success!"), 200

# @app.route('/subcategories', methods=['GET', 'POST'], endpoint='subcategories')
# #@jwt_required()
# def subcategories():
#     if request.method == 'GET':
#         subcategories = Subcategory.query.all()
#         subcategory_list = [subcategory.serialize() for subcategory in subcategories]
#         return jsonify(subcategory_list)

#     elif request.method == 'POST' and get_jwt_identity().is_admin:
#         data = request.get_json()
#         new_subcategory = Subcategory(name=data['name'], category_id=data['category_id'])
#         db.session.add(new_subcategory)
#         db.session.commit()
#         return jsonify(new_subcategory.serialize()), 201

# @app.route('/subcategories/<int:subcategory_id>', methods=['GET', 'PUT', 'DELETE'], endpoint='subcategory_by_id')
# #@jwt_required()
# def subcategory_by_id(subcategory_id):
#     subcategory = Subcategory.query.get_or_404(subcategory_id)

#     if request.method == 'GET':
#         return jsonify(subcategory.serialize())

#     elif request.method == 'PUT' and get_jwt_identity().is_admin:
#         data = request.get_json()
#         if 'name' in data:
#             subcategory.name = data['name']
#         if 'category_id' in data:
#             subcategory.category_id = data['category_id']
#         db.session.commit()
#         return jsonify(subcategory.serialize()), 200

#     elif request.method == 'DELETE' and get_jwt_identity().is_admin:
#         db.session.delete(subcategory)
#         db.session.commit()
#         return jsonify("Success!"), 200

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

    if 'email' not in data or 'firstName' not in data and 'lastName' not in data or 'password' not in data:
        return jsonify({"error": "Missing required fields"}), 400  # 400 Bad Request
    email = data['email']
    firstName = data['firstName']
    lastName = data['lastName']
    password = data['password']
    

    # Email has to be unique for every user signing up
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"error": "Email address already in use"}), 400  # 400 Bad Request

    # Create a new user
    new_user = User(email=email, firstName=firstName, lastName=lastName)
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
    
    
@app.route('/get-identity', methods=['GET'], endpoint = 'get-identity')
@jwt_required()
def get_identity():
    
    identity = get_jwt_identity()
    user = User.query.filter_by(id=identity).first()
    
    if user:
        return jsonify(user=user.serialize()), 200
    else:
        return jsonify(message="User not found"), 404



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

        db.session.delete(user)
        db.session.commit()
        return jsonify("Success!"), 200

#labb2
@app.route("/")
def client():
    return app.send_static_file("client.html")


if __name__ == "__main__":
    app.run(port=5001, debug=True) # På MacOS, byt till 5001 eller dylikt


