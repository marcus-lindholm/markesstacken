host = window.location.protocol + '//' + location.host;

var guserId;
var yearCheckboxesfilter = [];
var sectionCheckboxesfilter = [];
var organizersCheckboxesfilter = [];
var eventCheckboxesfilter = [];
var shoppingcartID;
let userID;
let myWishList = [];
let loggedIn = false;
var cartItems = [];


//drop-down for profile 
$(document).ready(function () {
  $('.dropdown-toggle').dropdown();
});

//-------------------------------------------------
//HOME-PAGE
function ShowHomePage() {
  $(".container").html($("#view-home").html());
  ShowCommonlyBoughtProducts()
}

function ShowCommonlyBoughtProducts() {
var numberofShown = "3"; //number of Commonly bought products shown

$.ajax({
  url: host + "/ordered_cart_item/" + numberofShown, 
  type: "GET",
  success: function(response) { 
    response.forEach(function(product) {
      var productHTML = `
      <div class="col-md-4" style="padding: 10px 5px;">
            <div class="card">
              <div class="product-listing-image-wrapper">
                <img src="/product_images/${product.img}" class="card-img-top centered-product-image show-product" data-product-id="${product.id}" alt="Product Image">
              </div>    
              <div class="card-body">
                    <h5 class="card-title show-product" data-product-id="${product.id}">${product.name}</h5>
                    <p class="card-text">${product.description.length > 28 ? product.description.substring(0, 25) + '...' : product.description}</p>
                    <p class="card-text"> ${product.price} kr</p>
                    <div class="d-flex align-items-center mb-3">
                        <label for="quantity" class="me-2"></label>
                        <div class="input-group">
                            <button class="btn btn-sm btn-outline-dark" onclick="this.parentNode.querySelector('input[type=number]').stepDown()" id="minus-button">
                                <i class="fas fa-minus"></i>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-dash" viewBox="0 0 16 16">
                                    <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8"/>
                                </svg>
                            </button>
                            <input type="number" id="quantity${product.id}" class="form-control" value="1" min="1" max="${product.quantity}">
                            <button class="btn btn-sm btn-outline-dark" onclick="this.parentNode.querySelector('input[type=number]').stepUp()" id="plus-button">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus" viewBox="0 0 16 16">
                                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
                                </svg>
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                    <button id="add-to-cart-btn${product.id}" data-product-id="${product.id}" onclick="addToShoppingCart(${product.id}, document.getElementById('quantity${product.id}').value, '${product.name}')" class="btn btn-light" style="width: 145px; margin: 5px 0;" ${product.quantity === 0 ? 'disabled' : ''}>Lägg i varukorg</button>
                    <div class="product-overview">
                      <button class="btn btn-dark" style="width: 105px;" id="buynow-btn${product.id}" data-product-id="${product.id}" onclick="buyNow(${product.id}, document.getElementById('quantity${product.id}').value, '${product.name}')">Köp nu</button>
                      <button id="add-to-wishlist-btn${product.id}" data-product-id="${product.id}" onclick="addToWishlist(${product.id}, '${product.name}')" class="btn btn-outline-dark" >
                          <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-heart" viewBox="0 0 16 16">
                              <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15"/>
                          </svg>
                      </button>
                    </div>
                </div>
            </div> 
        </div>`;
        $("#CBP").append(productHTML);
      });
      var buttonHTML = `<span style="width: 100%; text-align: center; margin: 10px 0;"><button id="view-all-products-btn" onclick="ShowPurchasePage()" class="btn btn-outline-dark">Se alla produkter</button></span>`;
      $("#CBP").append(buttonHTML);
  },
  error: function(error) {
      console.error("Error fetching commonly bought products:", error);
  }
});
}


//-------------------------------------------------
//ABOUTUS-PAGE
function ShowAboutusPage() {
  $(".container").html($("#view-aboutus").html());
}

//-------------------------------------------------
//FAVORITES-PAGE
function ShowFavoritesPage() {
  $(".container").html($("#view-favorites").html());
  $.ajax({
    url: host + "/wishlist", 
    type: "GET",
    contentType: "application/json",
    headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
    success: function (items) {
      let htmlString = items.map(product => {
        return `
          <div class="col-lg-4 col-md-6 mb-4" style="display: inline;">
            <div class="card wishlist-item h-100">
              <img class="card-img-top mx-auto d-block show-product img-list-view" src="/product_images/${product.img}" alt="${product.name}" data-product-id="${product.id}"/>
              <div class="card-body">
                <h5 class="card-title show-product" data-product-id="${product.id}">${product.name}</h5>
                <p class="card-text">${product.description}</p>
                <p class="card-text"> ${product.price} kr</p>
                <div class="d-flex mb-3 col-2">
                    <label for="quantity" class="me-2"></label>
                    <div class="input-group">
                        <button class="btn btn-sm btn-outline-dark" onclick="this.parentNode.querySelector('input[type=number]').stepDown()" id="minus-button">
                            <i class="fas fa-minus"></i>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-dash" viewBox="0 0 16 16">
                                <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8"/>
                            </svg>
                        </button>
                        <input type="number" id="quantity${product.id}" class="form-control" value="1" min="1" max="${product.quantity}">
                        <button class="btn btn-sm btn-outline-dark" onclick="this.parentNode.querySelector('input[type=number]').stepUp()" id="plus-button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus" viewBox="0 0 16 16">
                                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
                            </svg>
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                <button id="add-to-cart-btn${product.id}" data-product-id="${product.id}" onclick="addToShoppingCart(${product.id}, document.getElementById('quantity${product.id}').value, '${product.name}')" class="btn btn-light" style="width: 145px; margin: 5px 0;" ${product.quantity === 0 ? 'disabled' : ''}>Lägg i varukorg</button>
                <button id="remove-from-wishlist${product.id}" class="btn btn-secondary" data-product-id="${product.id}" onclick="removeFromWishlist(${product.id})">Ta bort från önskelista</button>              </div>
            </div>
          </div>
      `;
      }).join('');
    
      $(".container").html($("#view-favorites").html() + htmlString);
    },
    error: function (error) {
      displayMessage = "Product: " + productName + " was not added to your wishlist.";
      showAlert("warning", displayMessage, "Please try again later.");
    },
  });
}

function addToWishlist(productId, productName) {

  if (!loggedIn) {
    showAlert("warning", "Du är inte inloggad", "Logga in för att lägga till i önskelistan!");
    return; 
  }

  if (signedIn) {
    $.ajax({
      url: host + "/wishlist", 
      type: "POST",
      contentType: "application/json",
      headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
      data: JSON.stringify({
        product_id: productId,
      }),
      success: function (response) {
        displayMessage = "Produkt: " + productName + ".";
        showAlert("success", "Tillagd i önskelistan: ", displayMessage);
      },
      error: function (error) {
        displayMessage = "Produkt: " + productName + " blev inte tillagd i önskelistan.";
        showAlert("warning", displayMessage, "Försök igen.");
      },
    });
  } else {
    handleNavigationClick("view-login");
    showAlert("danger", "Du behöver logga in för att spara favoriter", "");
  }
}

function removeFromWishlist(productId) {
  $.ajax({
    url: host + "/wishlist/" + productId, 
    type: "DELETE",
    contentType: "application/json",
    headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
    success: function (response) {
      displayMessage = "Produkten togs bort från önskelistan."; 
      showAlert("success", displayMessage, "");
      ShowFavoritesPage();
    },
    error: function (error) {
      displayMessage = "Produkten gick inte att ta bort från önskelistan.";
      showAlert("warning", displayMessage, "Försök igen.");
    }
  });
}

function addToShoppingCart(productId, orderQuantity, productName) {
  if (!loggedIn) {
    showAlert("warning", "Du är inte inloggad", "Logga in för att lägga till i varukorgen");
    return; 
  }

  return new Promise((resolve, reject) => {
    if (orderQuantity > 0) {
      $.ajax({
        url: host + "/cartitems",
        type: "POST",
        contentType: "application/json",
        headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
        data: JSON.stringify({
          quantity: orderQuantity,
          product_id: productId,
          shoppingcart_id: shoppingcartID
        }),
        success: function (response) {
          checkIfInWishlist(productId).then(isInWishlist => {
            if(isInWishlist) {
              removeFromWishlist(productId)
            }
          });
          displayMessage = "Produkt: " + productName + " x " + orderQuantity + ".";
          showAlert("success", "Tillagd i varukorgen:", displayMessage);
          resolve();
        },
        error: function (error) {
          displayMessage = "Produkt: " + productName + " x " + orderQuantity + " blev inte tillagd i varukorgen.";
          showAlert("warning", displayMessage, "Försök igen.");
          if (error.status == 400) {
            showAlert("warning", "Ej tillräckligt många i lager.", "Minska antalet!");
          }
          reject(error);
        },
      });
    } else {
      showAlert("warning", "Den nuvarande kvantiteten är inte tillåten.", "Var snäll och öka antalet!");
    }
  });
}

function buyNow(productId, orderQuantity, productName) {
  addToShoppingCart(productId, orderQuantity, productName).then(() => {
    ShowCheckoutPage();
  });
}

async function checkIfInWishlist(productId) {
  let inWishlist = false;
  await $.ajax({
    url: host + "/wishlist",
    type: "GET",
    contentType: "application/json",
    headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
  }).then(function (response) {
    response.forEach(item => {
      if (item.id === productId) {
        inWishlist = true;
      }
    });
  });
  return inWishlist;
}

function emptyShoppingCart() {
if (cartItems.length > 0) {
  Promise.all(cartItems.map(function(item) {
    return removeFromShoppingCart(item.product.id, true);
  })).then(() => {
    ShowPurchasePage();
  });
} else {  
  displayMessage = "Varukorgen är redan tom!";
  showAlert("warning", displayMessage, "");
}
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function completeRemovalFromShoppingCart(productId) {
  removeFromShoppingCart(productId, false)
  await sleep(300); // behöver eventuellt vara lite högre
  ShowShoppingcartPage();
} 


function removeFromShoppingCart(productId, emptyAll) {
  $.ajax({
    url: host + "/cartitems/" + productId, 
    type: "DELETE",
    contentType: "application/json",
    headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
    success: function (response) {
      if (emptyAll) {
        displayMessage = "Varukorgen tömdes!";
        showAlert("success", displayMessage, "Välkommen tillbaka till köpsidan!");
      } else {
        displayMessage = "Produkten togs bort från varukorgen.";
        showAlert("success", displayMessage, "");
      }
    },
    error: function (error) {
      displayMessage = "Produkten gick inte att ta bort från varukorgen.";
      showAlert("warning", displayMessage, "Försök igen.");
    }
  });
}

function ShowPurchasePage() {
  $(".container").html($("#view-purchase").html());

  $.ajax({
      url: host + "/products", 
      type: "GET",
      success: function(response) {
          populateFilterDropdowns(response);
          refreshProducts();
      },
      error: function(error) {
          console.error("Error fetching products:", error);
      }
  });
}

function refreshProducts() {
  $.ajax({
    url: host + "/products",
    type: "GET",
    success: function(response) {
      var filteredProducts = response.filter(function(product) {
        return (
          (yearCheckboxesfilter.length === 0 || yearCheckboxesfilter.includes(product.year)) &&
          (sectionCheckboxesfilter.length === 0 || sectionCheckboxesfilter.includes(product.section)) &&
          (organizersCheckboxesfilter.length === 0 || organizersCheckboxesfilter.includes(product.organizer)) &&
          (eventCheckboxesfilter.length === 0 || eventCheckboxesfilter.includes(product.event))
        );
      });
      $("#product-container").empty();

      // Loop through each product and generate HTML dynamically
      filteredProducts.forEach(function(product) {
        var productHTML = `
          <div class="col-md-4" style="padding: 10px 5px;">
                <div class="card">
                  <div class="product-listing-image-wrapper">
                    <img src="/product_images/${product.img}" class="card-img-top centered-product-image show-product" data-product-id="${product.id}" alt="Product Image">
                  </div>    
                  <div class="card-body">
                        <h5 class="card-title show-product" data-product-id="${product.id}">${product.name}</h5>
                        <p class="card-text">${product.description.length > 28 ? product.description.substring(0, 25) + '...' : product.description}</p>
                        <p class="card-text"> ${product.price} kr</p>
                        <div class="d-flex align-items-center mb-3">
                            <label for="quantity" class="me-2"></label>
                            <div class="input-group">
                                <button class="btn btn-sm btn-outline-dark" onclick="this.parentNode.querySelector('input[type=number]').stepDown()" id="minus-button">
                                    <i class="fas fa-minus"></i>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-dash" viewBox="0 0 16 16">
                                        <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8"/>
                                    </svg>
                                </button>
                                <input type="number" id="quantity${product.id}" class="form-control" value="1" min="1" max="${product.quantity}">
                                <button class="btn btn-sm btn-outline-dark" onclick="this.parentNode.querySelector('input[type=number]').stepUp()" id="plus-button">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus" viewBox="0 0 16 16">
                                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
                                    </svg>
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                        <button id="add-to-cart-btn${product.id}" data-product-id="${product.id}" onclick="addToShoppingCart(${product.id}, document.getElementById('quantity${product.id}').value, '${product.name}')" class="btn btn-light" style="width: 145px; margin: 5px 0;" ${product.quantity === 0 ? 'disabled' : ''}>Lägg i varukorg</button>
                        <div class="product-overview">
                          <button class="btn btn-dark" style="width: 105px;" id="buynow-btn${product.id}" data-product-id="${product.id}" onclick="buyNow(${product.id}, document.getElementById('quantity${product.id}').value, '${product.name}')">Köp nu</button>
                          <button id="add-to-wishlist-btn${product.id}" data-product-id="${product.id}" onclick="addToWishlist(${product.id}, '${product.name}')" class="btn btn-outline-dark" >
                              <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-heart" viewBox="0 0 16 16">
                                  <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15"/>
                              </svg>
                          </button>
                        </div>
                    </div>
                </div>
            </div>`;
        $("#product-container").append(productHTML);
      });
    },
    error: function(error) {
      console.error("Error fetching products:", error);
    }
  });
}

function search() {
  var input = document.getElementById('searchBar').value.toLowerCase();
  populateSearch(input);
}

function populateSearch(searchInput) {
      var items = document.getElementById('product-container').getElementsByClassName('col-md-4');

      for (var i = 0; i < items.length; i++) {
          var productName = items[i].getElementsByClassName('card-title')[0].textContent.toLowerCase();
          if (productName.includes(searchInput)) {
            items[i].style.display = 'block';
        } else {
            items[i].style.display = 'none';
        }
      }  
}

function populateFilterDropdowns(response) {
  var years = [];
  var sections = [];
  var organizers = [];
  var events = [];

  // Extract unique values for each filter
  response.forEach(function(product) {
    if (product.year !== null && !years.includes(product.year)) {
        years.push(product.year);
    }
    if (product.section !== null && !sections.includes(product.section)) {
        sections.push(product.section);
    }
    if (product.organizer !== null && !organizers.includes(product.organizer)) {
        organizers.push(product.organizer);
    }
    if (product.event !== null && !events.includes(product.event)) {
        events.push(product.event);
    }
  });
  response.forEach(function(product) {
    if (product.year !== null && !yearCheckboxesfilter.includes(product.year)) {
        yearCheckboxesfilter.push(product.year);
    }
    if (product.section !== null && !sectionCheckboxesfilter.includes(product.section)) {
        sectionCheckboxesfilter.push(product.section);
    }
    if (product.organizer !== null && !organizersCheckboxesfilter.includes(product.organizer)) {
        organizersCheckboxesfilter.push(product.organizer);
    }
    if (product.event !== null && !eventCheckboxesfilter.includes(product.event)) {
        eventCheckboxesfilter.push(product.event);
    }
  });

  // Sort the lists alphabetically
  years.sort();
  sections.sort();
  organizers.sort();
  events.sort();

  // Populate filter dropdowns
  populateCheckboxes("yearCheckboxes", years, "year");
  populateCheckboxes("sectionCheckboxes", sections, "section");
  populateCheckboxes("organizersCheckboxes", organizers, "organizer");
  populateCheckboxes("eventCheckboxes", events, "event");

  addAllCheckbox("yearCheckboxes");
  addAllCheckbox("sectionCheckboxes");
  addAllCheckbox("organizersCheckboxes");
  addAllCheckbox("eventCheckboxes");
}

function populateCheckboxes(containerId, options, name) {
  var container = $("#" + containerId);
  options.forEach(function(option) {
    container.append(`
      <div class="form-check">
        <input class="form-check-input" type="checkbox" value="${option}" id="${name}-${option}">
        <label class="form-check-label" for="${name}-${option}">
          ${option}
        </label>
      </div>
    `);
  });
}

function addAllCheckbox(containerId) {
  var container = $("#" + containerId);
  container.prepend(`
    <div class="form-check">
      <input class="form-check-input all-checkbox" type="checkbox" value="All" id="${containerId}-All" checked> <!-- Add checked attribute here -->
      <label class="form-check-label" for="${containerId}-All">
        Alla
      </label>
    </div>
  `);
  container.find(".form-check-input:not(.all-checkbox)").prop("checked", true);
}


//-------------------------------------------------
// Function to handle checkbox selection
$(document).on("change", ".form-check-input", function() {
  var checkbox = $(this);
  var containerId = checkbox.closest(".form-check").parent().attr("id");

  if (checkbox.hasClass("all-checkbox")) {
    var isChecked = checkbox.prop("checked");
    $("." + containerId + " .form-check-input").prop("checked", isChecked);
    $("#" + containerId + " .form-check-input:not(.all-checkbox)").prop("checked", isChecked);
  } else {
    if (!checkbox.prop("checked")) {
      $("#" + containerId + "-All").prop("checked", false);
    } else {
      var allOtherChecked = true;
        $("#" + containerId + " .form-check-input:not(.all-checkbox)").each(function() {
            if (!$(this).prop("checked")) {
                allOtherChecked = false;
                return false;
            }
        });
        $("#" + containerId + "-All").prop("checked", allOtherChecked);
    }
  }
    updateFilterList(containerId);
    refreshProducts();

});

//-------------------------------------------------
// Show the PRODUCT PAGE

//Zoom image on hover
$(document).on('mousemove', '.product-image', function(e) {
  var imgWidth = $(this).width();
  var imgHeight = $(this).height();
  var mouseX = e.pageX - $(this).offset().left;
  var mouseY = e.pageY - $(this).offset().top;
  var percentX = ((mouseX / imgWidth) - 0.5) * 100;
  var percentY = ((mouseY / imgHeight) - 0.5) * 100;
  var maxMovement = 20;
  percentX = Math.max(Math.min(percentX, maxMovement), -maxMovement);
  percentY = Math.max(Math.min(percentY, maxMovement), -maxMovement);

  $(this).css('transform', 'scale(1.2) translate(' + percentX + '%, ' + percentY + '%)');
});

$(document).on('mouseout', '.product-image', function() {
  $(this).css('transform', 'scale(1)');
});

function ShowProductPage(productId) {
  $(".container").html($("#view-product").html());

  $.ajax({
    url: host + "/products/" + productId,
    type: "GET",
    success: function(product) {
      var productPageHTML = `
      <div class="product-page">
        <div class="half-page">
          <div class="image-wrapper">
            <img src="/product_images/${product.img}" class="product-image" alt="${product.name}">
          </div>
        </div>
        <div class="half-page">
          <h2>${product.name}</h2>
          <h3>${product.price} kr</h3>
          <p class="card-text">${product.description}</p>
          <p>Antal i lager: ${product.quantity === 0 ? 'Ej i lager' : product.quantity}</p>
          ${product.year && product.year !== 'null' ? `<p>År: ${product.year}</p>` : ''}
          ${product.section && product.section !== 'null' ? `<p>Sektion: ${product.section}</p>` : ''}
          ${product.event && product.event !== 'null' ? `<p>Event: ${product.event}</p>` : ''}
          ${product.event_organizer && product.event_organizer !== 'null' ? `<p>Arrangör: ${product.event_organizer}</p>` : ''}
          <div class="d-flex align-items-center mb-3">
              <label for="quantity" class="me-2"></label>
              <div class="input-group quantity-input-group">
                  <button class="btn btn-sm btn-outline-dark" onclick="this.parentNode.querySelector('input[type=number]').stepDown()" id="minus-button">
                      <i class="fas fa-minus"></i>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-dash" viewBox="0 0 16 16">
                          <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8"/>
                      </svg>
                  </button>
                  <input type="number" id="quantity${product.id}" class="form-control" value="1" min="1" max="${product.quantity}">
                  <button class="btn btn-sm btn-outline-dark" onclick="this.parentNode.querySelector('input[type=number]').stepUp()" id="plus-button">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus" viewBox="0 0 16 16">
                          <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
                      </svg>
                      <i class="fas fa-plus"></i>
                  </button>
              </div>
          </div>
          <div class="justify-content-between mb-3">
          <button id="add-to-cart-btn${product.id}" data-product-id="${product.id}" onclick="addToShoppingCart(${product.id}, document.getElementById('quantity${product.id}').value, '${product.name}')" class="btn btn-light" style="width: 145px; margin: 5px 0;" ${product.quantity === 0 ? 'disabled' : ''}>Lägg i varukorg</button>
          <button id="add-to-wishlist-btn${product.id}" data-product-id="${product.id}" onclick="addToWishlist(${product.id}, '${product.name}')" class="btn btn-outline-dark" >
                <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-heart" viewBox="0 0 16 16">
                    <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15"/>
                </svg>
            </button><br>
            <button class="btn btn-dark" style="width: 145px;" id="buynow-btn${product.id}" data-product-id="${product.id}" onclick="buyNow(${product.id}, document.getElementById('quantity${product.id}').value, '${product.name}')">Köp nu</button>
          </div>
        </div>
      </div>
      `;
      $(".container").html(productPageHTML);

    }
  });
}

//-------------------------------------------------
// Function to update the global filter lists based on checked/unchecked checkboxes
function updateFilterList(containerId) {
  $("#" + containerId + " .form-check-input").each(function() {
    var value = $(this).val();
    if ($(this).prop("checked")) {
      if (containerId === "yearCheckboxes") {
        if (!window[containerId + 'filter'].includes(parseInt(value))) {
          window[containerId + 'filter'].push(parseInt(value));
        } 
      } else {
        if (!window[containerId + 'filter'].includes(value)) {
          window[containerId + 'filter'].push(value); 
        }
      }
    } else {
      if (containerId === "yearCheckboxes") {
        var index = window[containerId + 'filter'].indexOf(parseInt(value));
      } else {
        var index = window[containerId + 'filter'].indexOf(value);
      }
      if (index !== -1) {
        window[containerId + 'filter'].splice(index, 1);
      }
    }
  });
}

//-------------------------------------------------
//SELL-PAGE
function ShowSellPage() {
  $(".container").html($("#view-sell").html());
}

function ShowContactPage() {
  $(".container").html($("#view-contact").html());
}

function addProduct(){
  const name = document.getElementById("product-name").value;
  const description = document.getElementById("product-description").value;
  const price = document.getElementById("product-price").value;
  const quantity = document.getElementById("product-quantity").value;
  const categoryid = document.getElementById("product-category").value;
  const yearElement = document.getElementById("product-year");
  const year = yearElement && yearElement.value ? yearElement.value : null;
  const sectionElement = document.getElementById("product-section");
  const section = sectionElement && sectionElement.value ? sectionElement.value : null;
  const eventElement = document.getElementById("product-event");
  const event = eventElement && eventElement.value ? eventElement.value : null;
  const organizerElement = document.getElementById("event_organizer");
  const organizer = organizerElement && organizerElement.value ? organizerElement.value : null;
  const img = document.getElementById("product-image").files[0];

  const formData = new FormData();
  formData.append('name', name);
  formData.append('description', description);
  formData.append('price', price);
  formData.append('quantity', quantity);
  formData.append('category_id', categoryid);
  formData.append('year', year);
  formData.append('section', section);
  formData.append('event', event);
  formData.append('organizer', organizer);
  if (img) {
    formData.append('img', img);
  }

  $.ajax({
    url: '/products',
    type: 'POST',
    //headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
    processData: false,
    contentType: false,
    data: formData,
    success: function (response) {
        showAlert("success", "Product Added!", "Nice!");
    },
    error: function (error) {
        console.error(error);
    }
  });
}

//-------------------------------------------------
//SHOPPINGCART-PAGE
function ShowShoppingcartPage() {
  $(".container").html($("#view-shoppingcart").html());
  $.ajax({
    url: host + "/myShoppingCart", 
    type: "GET",
    contentType: "application/json",
    headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
    success: function (response) {
      let totalPrice = 0;
      let htmlString = '';
      cartItems = response.cartitems;
      htmlString += `<div class="shoppingCartArea section_padding_130" id="shoppingCart">
      <div class="container">
      <h2 class="bold-heading">Varukorg</h2>`;
      response.cartitems.forEach(item => {
        totalPrice += item.product.price * item.quantity;
        htmlString += `
          <div class="col-lg-4 col-md-6 mb-4" style="display: inline;">
            <div class="card shoppingcart-item h-100">
              <img class="card-img-top mx-auto d-block show-product img-list-view" src="/product_images/${item.product.img}" alt="${item.product.name}" data-product-id="${item.product.id}"/>
              <div class="card-body">
                <h5 class="card-title show-product" data-product-id="${item.product.id}">${item.product.name}</h5>
                <p class="card-text">${item.product.description}</p>
                <p class="card-text"> ${item.product.price} kr</p>
                <div class="d-flex mb-3 align-items-center">
                    <label for="quantity" class="me-2"></label>
                    <div class="input-group">
                        <button class="btn btn-sm btn-outline-dark align-items-stretch" style="height: 38px; padding: 6px;" data-product-id="${item.product.id}" onclick="this.parentNode.querySelector('input[type=number]').stepDown(), decreaseQuantity(${item.product.id}, ${item.quantity})" id="minus-button${item.product.id}">
                            <i class="fas fa-minus"></i>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-dash" viewBox="0 0 16 16">
                                <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8"/>
                            </svg>
                        </button>
                        <input type="number" id="quantity${item.product.id}" readonly class="form-control" style="width: auto; min-width: 20px; max-width: 40px;" value="${item.quantity}" min="1" max="${item.product.quantity}">
                        <button class="btn btn-sm btn-outline-dark align-items-stretch" style="height: 38px; padding: 6px;" data-product-id="${item.product.id}" onclick="this.parentNode.querySelector('input[type=number]').stepUp(), increaseQuantity(${item.product.id}, ${item.product.quantity}, ${item.quantity})" id="plus-button${item.product.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus" viewBox="0 0 16 16">
                                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
                            </svg>  
                            <i class="fas fa-plus"></i>
                        </button>
                        <div class="col-auto">
                        <!-- Empty column to create space -->
                        </div>
                        <button id="remove-from-cart-button" onclick="completeRemovalFromShoppingCart(${item.product.id})" class="btn btn-light align-items-stretch" style="width: 145px; margin-right: 200px; background-color: rgb(99, 163, 118); color: rgb(255, 255, 255);" >Ta bort</button>
                    </div>
                </div>
              </div>
            </div>
        
          </div>`;
    });
    
    htmlString += `
    <div class="Totalprice">
      <h2> Totalkostnad: ${totalPrice} SEK</h2>
    </div>
    <div class="row">
      <div class="col">
        <button id="checkout-button" class="btn btn-sm btn-outline-dark btn-block" style="height: 50px; font-size: 16px;">Gå till kassan</button>
      </div>
      <div class="col-auto">
        <!-- Empty column to create space -->
      </div>
      <div class="col-auto">
        <button id="empty-cart-button" class="btn btn-sm btn-outline-danger" style="height: 50px; font-size: 16px;">Töm varukorgen</button>
      </div>
    </div>
    </div>
    </div>`;
      
      $(".container").append(htmlString);
    }
  });
}

function increaseQuantity(productId, maxQuantity, productQuantity) {
  if (maxQuantity > productQuantity) {
     $.ajax({
    url: host + "/myShoppingCart", 
    type: "GET",
    contentType: "application/json",
    headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
    success: function (response) {
      response.cartitems.forEach(item => {
        if (item.product.id === productId) {
          $.ajax({
            url: host + "/cartitems/" + item.id, 
            type: "PUT",
            contentType: "application/json",
            headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
            data: JSON.stringify({
              quantity: item.quantity + 1
            }),
            success: function (response) {
            }
          });
        }
      });
      ShowShoppingcartPage();
    }
  });
  } else {
    displayMessage = "Ej tillräckligt många varor i lager.";
    showAlert("warning", displayMessage, "");
  }

}

function decreaseQuantity(productId, productQuantity) { 
  if (productQuantity > 1) {
    $.ajax({
      url: host + "/myShoppingCart", 
      type: "GET",
      contentType: "application/json",
      headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
      success: function (response) {
        response.cartitems.forEach(item => {
          if (item.product.id === productId) {
            $.ajax({
              url: host + "/cartitems/" + item.id, 
              type: "PUT",
              contentType: "application/json",
              headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
              data: JSON.stringify({
                quantity: item.quantity - 1
              }),
              success: function (response) {
              }
            });
          }
        });
         ShowShoppingcartPage();
      } 
    });
  } else {
    removeFromShoppingCart(productId, false);
    ShowShoppingcartPage();
  } 
}

//-------------------------------------------------
//CHECKOUT-PAGE
function ShowCheckoutPage() {
 $(".container").html($("#view-checkout").html());
 $.ajax({
  url: host + "/myShoppingCart", 
  type: "GET",
  contentType: "application/json",
  headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
  success: function (response) {
    cartItems = response.cartitems;
    let numberOfItemsHtml = `
        <span class="badge badge-secondary badge-pill">${cartItems.length}</span>
      `;
    let totalPrice = 0;
    let cartitemsHtml = cartItems.map(function(item) {
      totalPrice += item.product.price*item.quantity;
      return `
        <li class="list-group-item d-flex justify-content-between lh-condensed">
          <div>
            <h6 class="my-0">${item.quantity} x ${item.product.name}</h6>
            <small class="text-muted">${item.product.description.substring(0, 32)}</small>
          </div>
          <span class="text-muted">${item.product.price} kr</span>
        </li>
      `;
    }).join('');

    let totalPriceHtml = `
      <li class="list-group-item d-flex justify-content-between">
        <span>Total (SEK)</span>
        <strong>${totalPrice}</strong>
      </li>
    `;

  $(".container .number-of-cartitems").html(numberOfItemsHtml);
  $(".container .list-group").html(cartitemsHtml + totalPriceHtml);
  window.scrollTo(0, 0);
  }
  });
}

function placeOrder() {
  const address = document.getElementById("address").value;
  const city = document.getElementById("city").value;
  const postalCode = document.getElementById("zip").value;
  
  event.preventDefault();
  $.ajax({
    url: host + "/orders",
    type: "POST",
    contentType: "application/json",
    headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
    data: JSON.stringify({
      address: address,
      city: city,
      postal_code: postalCode
    }),
    success: function(responseURL) {
      window.location.href = responseURL;
    }
  });
}

//-------------------------------------------------
//ORDER-CONFIRMATION-PAGE
function ShowOrderConfirmationPage() {
  $(".container").html($("#view-order-confirmation").html());
    let urlParams = new URLSearchParams(window.location.search);
    let orderId = urlParams.get('order_id');

    $.ajax({
      url: host + "/orders/" + orderId, 
      type: "GET",
      contentType: "application/json",
      headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
      success: function (order) {
        orderDate = new Date(order.order_date).toLocaleDateString('sv-SE');
        let htmlString = `
          <h5>Ordersummering</h5>
          <p><strong>Ordernummer:</strong> 1000${order.id}</p>
          <p><strong>Datum:</strong> <span>${orderDate}</span></p>
          <p><strong>Totalkostnad:</strong> ${order.total_price} SEK</p>
          <p><strong>Mottgarens namn:</strong> ${order.first_name} ${order.last_name}</p>
          <p><strong>Email:</strong> ${order.email}</p>
          <p><strong>Beställda produkter:</strong></p>
          `;

          order.ordered_shoppingcart.ordered_cartitems.forEach(function(orderedCartItem) {
            htmlString += `
            <div style="display: flex; align-items: center; margin-right: 10px; margin-bottom: 20px;"> <!-- Adjust margin-right -->
              <img src="/product_images/${orderedCartItem.product.img}" alt="${orderedCartItem.product.name}" style="max-width: 100px;">
              <div style="margin-left: 10px;"> <!-- Add margin between image and text -->
                <div>${orderedCartItem.product.name}</div> <!-- Product name -->
                <div>Antal: ${orderedCartItem.quantity}</div> <!-- Quantity -->
              </div>
            </div>
          `;
        });
          
          htmlString += `</ul>`;

        $(".container .confirmation-details").html(htmlString);
      }
    });
}

//-------------------------------------------------
//

function MakeOrderReturned(orderId) {
  $.ajax({
    url: host + "/users/" + userID +  "/orders/" + orderId,
    type: "PUT",
    contentType: "application/json",
    headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
    data: JSON.stringify({returned: true }), 
    success: function(response) {
      ShowOrdersPage();
    },
    error: function(xhr, status, error) {
      console.error("Error marking order as returned:", error);
    }
  });
}

//-------------------------------------------------
//ORDERS-PAGE FOR CUSTOMERS TO SEE WHAT THEY ORDERED
function ShowOrdersPage() {
  $(".container").html($("#view-orders").html());

  $.ajax({
    url: host + "/users/" + userID +  "/orders", 
    type: "GET",
    contentType: "application/json",
    headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
    success: function (order) {
      let htmlString = '';
      order.forEach(function(order) {

        orderDate = new Date(order.order_date).toLocaleDateString('sv-SE');
        htmlString += `
      
          <div class="card">
            <div class="card-body">
            <p><strong>Ordernummer:</strong> 1000${order.id}</p>
            <p><strong>Totalkostnad:</strong> ${order.total_price} SEK </p>
            <p><strong>Datum:</strong> <span>${orderDate}</span></p>
            <p><strong>Produkter:</strong></p>`;
            order.ordered_shoppingcart.ordered_cartitems.forEach(function(item) {
              htmlString += ` <p>${item.quantity} x ${item.product.name}</p>`;
            });

            htmlString += `<button class="btn btn-outline-dark returnPopup" data-toggle="modal" data-target="#returnModal">Instruktioner för retur</button>
            </div>
            </div>

            <!-- Modal -->
            <div class="modal fade" id="returnModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
              <div class="modal-dialog" role="document">
                <div class="modal-content">
                  <div class="modal-header">
                    <h3 class="modal-title" id="exampleModalLabel">Vill du göra en retur?</h3>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div class="modal-body">
                  <h5>Så här gör du en retur</h5>
                  <ol>
                      <li>Kontakta vår kundtjänst via e-post för att meddela din retur. Ange ditt ordernummer och orsaken till returen.</li>
                      <li>Du kommer att få en returetikett via e-post som du ska skriva ut och fästa på returpaketet.</li>
                      <li>Skicka tillbaka dina varor till adressen som anges på returetiketten. Observera att du är ansvarig för returfrakten.</li>
                  </ol>

                  <h5>Återbetalning</h5>
                  <p>När vi har mottagit och kontrollerat de returnerade varorna, kommer vi att återbetala köpesumman till ditt ursprungliga betalningssätt. Återbetalningen sker inom 10 arbetsdagar från det att vi mottagit returen.</p>

                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Stäng</button>
                  </div>
                </div>
              </div>
            </div>`;

        $(".container .customer-orders-history").append(htmlString);

       
      });
    },
    error: function(xhr, status, error) {
      console.error("Error fetching orders:", error);
    }
  
  });
}

//-------------------------------------------------
//RETURNS-PAGE
function ShowReturnsPage(){
  $(".container").html($("#view-returns").html());
}

//-------------------------------------------------
//PROFILE-PAGE
function ShowProfileinfoPage(){
  $(".container").html($("#view-profileinfo").html());
}

//-------------------------------------------------
//SETTINGS-PAGE
function ShowSettingsPage(){
  $(".container").html($("#view-settings").html());
}

//-------------------------------------------------
//ADMIN-ORDERS-PAGE
function ShowAdminOrdersPage(){
  $(".container").html($("#view-admin-orders").html());

  
  $.ajax({
    url: host +  "/orders", 
    type: "GET",
    contentType: "application/json",
    headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
    success: function (order) {
    
      order.forEach(function(singleOrder) {

        orderDate = new Date(singleOrder.order_date).toLocaleDateString('sv-SE');
        let htmlString = `
        <div class="card">
            <div class="card-body">
                <p><strong>Ordernummer:</strong> 1000${singleOrder.id}</p>
                <p><strong>AnvändarID:</strong> ${singleOrder.user_id}</p>
                <p><strong>Varukorg:</strong></p>
                <ul id="${singleOrder.ordered_shoppingcart_id}">`;

        singleOrder.ordered_shoppingcart.ordered_cartitems.forEach(function(cartItem) {
          htmlString += `
              <li>Produkt ID: ${cartItem.product_id}, Antal: ${cartItem.quantity}</li>`;
              });
              
        htmlString += `
              </ul>
              <p><strong>Totalkostnad:</strong> ${singleOrder.total_price} SEK</p>
              <p><strong>Datum:</strong> <span>${orderDate}</span></p>
          </div>
      </div>`;
    $(".container .admin-orders-history").append(htmlString);
    });
     
    },
    error: function(xhr, status, error) {
      console.error("Error fetching orders:", error);
    }
  
  });
}

//-------------------------------------------------
//ADMIN-RETURNS-PAGE
function ShowAdminReturnsPage(){
  $(".container").html($("#view-admin-returns").html());
}

//-------------------------------------------------
//ADMIN-CONFIRM-PRODUCTS-PAGE

function ShowAdminConfirmProductsPage(){
  $(".container").html($("#view-admin-confirm-products").html());

  $.ajax({
    url: host + "/confirm-products",
    type: "GET",
    success: function(response) {
        // Handle successful response
        displayUnconfirmedProducts(response);
    },
    error: function(error) {
        console.error("Error fetching unconfirmed products:", error);
    }
});
}

function displayUnconfirmedProducts(products) {
  $("#unconfirmed-product-container").empty();

  products.forEach(function(product) {
      var productHTML = `
          <div class="col-md-12" style="padding: 10px 5px;">
              <div class="card">
                  <div class="product-listing-image-wrapper">
                      <img src="/product_images/${product.img}" class="card-img-top centered-product-image show-product" data-product-id="${product.id}" alt="Product Image">
                  </div>    
                  <div class="card-body">
                      <h5 class="card-title show-product" data-product-id="${product.id}">${product.name}</h5>
                      <p class="card-text">${product.description.length > 28 ? product.description.substring(0, 25) + '...' : product.description}</p>
                      <p class="card-text"> ${product.price} kr</p>
                      <div style="margin-top: 10px; text-align: center;">
                       <button id="confirm-product-btn${product.id}" data-product-id="${product.id}" onclick="confirmProduct(${product.id})" class="btn btn-primary" style="display: inline-block; width: 300px; height: 40px; margin-right: 10px;">Confirm Product</button>
                       <button id="delete-product-btn${product.id}" data-product-id="${product.id}" onclick="deleteProduct(${product.id})" class="btn btn-danger" style="display: inline-block; width: 300px; height: 40px; ">Delete Product</button>
                      </div>

                  </div>
              </div>
          </div>`;
      $("#unconfirmed-product-container").append(productHTML);
  });
}

function confirmProduct(productId) {
  $.ajax({
    url: "/confirm-products/" + productId,
    type: "POST", 
    contentType: "application/json",
    headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
    success: function(response) {
      ShowAdminConfirmProductsPage()
    },
    error: function(error) {
        
        console.error("Error confirming product:", error);
    }
});
}

function deleteProduct(productId) {
  $.ajax({
    url: "/confirm-products/" + productId, 
    type: "DELETE",
    contentType: "application/json",
    headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
    success: function(response) {
      ShowAdminConfirmProductsPage()
    },
    error: function(error) {
        console.error("Error deleting product:", error);
    }
});
}


//-------------------------------------------------
//LOGOUT-PAGE
function ShowLogoutPage(){
  $(".container").html($("#view-logout").html());
}

//-------------------------------------------------
//QUESTION-PAGES
function ShowQuestionsPage(){
  $(".container").html($("#view-questions").html());
}

//-------------------------------------------------
//FAQ-PAGES
function ShowQuestionsShippingAndReturnsPage(){
  $(".container").html($("#shipping-and-returns-section").html());
}
function ShowQuestionsPaymentPage(){
  $(".container").html($("#payment-section").html());
}
function ShowQuestionsSellingPage(){
  $(".container").html($("#selling-section").html());
}
function ShowQuestionsBuyingPage(){
  $(".container").html($("#buying-section").html());
}
function ShowQuestionsCollectingPage(){
  $(".container").html($("#collecting-section").html());
}

//-------------------------------------------------
//CONTACT-PAGE
function ShowContactPage() {
  $(".container").html($("#view-contact").html());

  $(".contact-form").submit(function(event) {
      event.preventDefault();

      var name = $("#name").val();
      var email = $("#email").val();
      var message = $("#message").val();
      var displayMessage = "Name: " + name + "\nEmail: " + email + "\nMessage: " + message;

      showAlert("success", "Message Sent!", displayMessage);
  });
}

//-------------------------------------------------
//ALERTS
function showAlert(type, heading, message) {
  var alertHTML = '<div class="alert alert-' + type + ' alert-dismissible fade show" role="alert">';
  alertHTML += '<strong>' + heading + '</strong> ' + message;
  alertHTML += '<button type="button" class="close" data-dismiss="alert" aria-label="Close">';
  alertHTML += '<span aria-hidden="true">&times;</span></button></div>';

  $(".container").append(alertHTML);

  setTimeout(function() {
    $(".alert").alert('close');
  }, 5000);
}

//------------------------------------------------------
//SHOW-SIGN-UP-PAGE
function ShowSignUpPage() {

  var signUpViewTemplate = $("#view-sign-up").html();

  $("#content-container").html(signUpViewTemplate);

  $("#registerForm").submit(function (event) {
      event.preventDefault();

      var formData = {
          firstName: $("#firstName").val(),
          lastName: $("#lastName").val(),
          email: $("#email").val(),
          password: $("#password").val()
      };

      $.ajax({
          url: host + '/sign-up',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({firstName: formData.firstName, lastName: formData.lastName, email : formData.email, password: formData.password}),
          success: function (response) {

              ShowLoginPage();
              
          }, 
          error: function (error) {
            showAlert("danger", "Registrering misslyckades", "Mailadressen används redan.");
             console.error(error);
          }
      });
  });
}

//___________________________________________________________
//Functions do decide which dropdown is showed depending on if logged in or not 
function checkLoggedIn() {
  auth = JSON.parse(sessionStorage.getItem('auth'));
  signedIn = auth !== null;
  loggedIn = signedIn;
  const loggedInDropdown = document.getElementById('loggedInDropdown');
  const loggedOutDropdown = document.getElementById('loggedOutDropdown');
  const adminDropdown = document.getElementById('adminDropdown');
  const sellButton = document.getElementById('sellButton');

  if (signedIn == true) {

    loggedInDropdown.style.display = 'block';
    loggedOutDropdown.style.display = 'none';
    adminDropdown.style.display = 'none'; 
    sellButton.style.display='block';

    console.log("auth.access", auth.token);

    $.ajax({
      url: '/get-identity',
      type: 'GET',
      headers: {
        'Content-Type': 'application/json',
        "Authorization": "Bearer " + auth.token
       
      },

      success: function(user) {
      
        if (user.user.is_admin === false) {
          shoppingcartID = user.user.shoppingcart.id;
          userID = user.user.id;
          loggedInDropdown.style.display = 'block';
          loggedOutDropdown.style.display = 'none';
          adminDropdown.style.display = 'none';
          sellButton.style.display='block';
        } else {
          shoppingcartID = user.user.shoppingcart.id;
          userID = user.user.id;
          loggedInDropdown.style.display = 'none';
          loggedOutDropdown.style.display = 'none';
          adminDropdown.style.display = 'block'; 
          sellButton.style.display='none';
        }
       
      },
      
      error: function(jqXHR, error) {
        if (jqXHR.status === 401) {
          logout();
          console.error("log out in error");
        } else {
          console.error("Error fetching identity:", error);
          adminDropdown.style.display = 'none';
        }
      }
    });

  } else {
    loggedInDropdown.style.display = 'none';
    loggedOutDropdown.style.display = 'block';
    adminDropdown.style.display = 'none'; 
    sellButton.style.display='none';
  }
}


function logout() {
  sessionStorage.removeItem('auth');
  checkLoggedIn();

}
 
//--------------------------------------------------------------
//SHOW-LOGIN-PAGE 
function ShowLoginPage() {
  var loginViewTemplate = $("#view-login").html();

  $("#content-container").html(loginViewTemplate);

    $("#loginForm").submit(function (event) {
      event.preventDefault();

      var formData = {
        email: $("#email").val(),
        password: $("#password").val()
      };

      $.ajax({
        url: '/login',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({email :formData.email, password : formData.password}),

        success: function (response) {
          sessionStorage.setItem('auth', JSON.stringify(response));

          guserId = JSON.parse(sessionStorage.getItem('auth')).user.id;

          ShowHomePage();
          checkLoggedIn();
          showAlert("success", "Du är nu inloggad", "Välkommen att kika runt!");
        },
        error: function (error) {
          console.error(error);
          showAlert("danger", "Inloggning misslyckades!", "Fel användarnamn eller lösenord");
        }
      });
    });
}

//-----------------------------------------------------------
//SHOW-LOGOUT-PAGE
function ShowLogoutPage() {
  var logoutViewTemplate = $("#view-logout").html();

  $("#content-container").html(logoutViewTemplate);

  $("#logoutForm").submit(function (event) {
    event.preventDefault();

    sessionStorage.removeItem('auth');

    ShowHomePage();
    checkLoggedIn();
    
  });

} 

//Interval to check if token is active
setInterval(function() {
checkLoggedIn();
}, 30000); 

//------------------------------------------
//CLICK-EVENTS
 
$(document).ready(function () {
  let urlParams = new URLSearchParams(window.location.search);
  let view = urlParams.get('view');
  checkLoggedIn();
  if (view === 'success') {
    ShowOrderConfirmationPage();
  } else if (view === 'cancel') {
    ShowCheckoutPage();
  } else {
    ShowHomePage();
  }
  
  //------------------------------------------
  // Navigation click event handlers

  function loadView(viewId, productId) {
    switch (viewId) {
      case "view-home":
        ShowHomePage();
        break;
      case "view-aboutus":
        ShowAboutusPage();
        break; 
      case "view-contact":
        ShowContactPage();
        break;
      case "view-purchase":
        ShowPurchasePage();
        break;
      case "view-sell":
        ShowSellPage();
        break;
      case "view-logout":
        ShowLogoutPage();
        break;
      case "view-favorites":
        ShowFavoritesPage();
        break;
      case "view-shoppingcart":
        ShowShoppingcartPage();
        break;
      case "view-sign-up":
        ShowSignUpPage();
        break;
      case "view-login":
        ShowLoginPage();
        break;
      case "view-orders":
        ShowOrdersPage();
        break;
      case "view-returns":
        ShowReturnsPage();
        break;
      case "view-profileinfo":
        ShowProfileInfoPage();
        break;
      case "view-settings":
        ShowSettingsPage();
        break;
      case "view-adminOrders":
        ShowAdminOrdersPage();
        break;
      case "view-adminReturns":
        ShowAdminReturnsPage();
        break;
      case "view-admin-confirm-products":
        ShowAdminConfirmProductsPage();
        break;
      case "view-questions":
        ShowQuestionsPage();
        break; 
      case "view-checkout":
        ShowCheckoutPage();
        break;
      case "view-product":
        ShowProductPage(productId);
        break;
      default:
        console.error("Unknown view:", viewId);
  }
}



//This function stores the navigationClicks i.e. the different views the user has "visited" and enables for the user to go back and 
//forward in the browser-history using the arrows
let previousViewId = null;
let previousProductId = null;

function handleNavigationClick(viewId, productId = null) {  
if (previousViewId !== viewId || previousProductId !== productId) {
  loadView(viewId, productId);
  previousViewId = viewId;
  previousProductId = productId;
  history.pushState({ viewId: viewId, productId: productId }, "", "");
}
}

$(document).on("click", "#checkout-button", function() {
  handleNavigationClick("view-checkout");
});

//Button for emptying the shopping cart
$(document).on("click", "#empty-cart-button", function() {
  $('#emptyCartModal').modal('show');
});
//Close the modal
$('#confirmEmptyCart, #cancelEmptyCart').on('click', function() {
  $('#emptyCartModal').modal('hide');
});

// Click event handler for product links
$(document).on('click', '.show-product', function() {
  var productId = $(this).data('product-id');
  handleNavigationClick("view-product", productId);
});


  //NAVBAR LINKS CLICK
  $(".navbar-brand.logo").click(function () {
    handleNavigationClick("view-home");
  });

  $(".nav-link.aboutus").click(function () {
    handleNavigationClick("view-aboutus");
  });

  $(".nav-link.contact").click(function () {
    handleNavigationClick("view-contact");
  });

  $(".nav-link.purchase").click(function () {
    handleNavigationClick("view-purchase");
  });

  $(".nav-link.sell").click(function () {
    handleNavigationClick("view-sell");
  });

  $(".nav-link.logout").click(function () {
    handleNavigationClick("view-logout");
  });

  $(".nav-link.favorites").click(function () {
    if (loggedIn) {
      handleNavigationClick("view-favorites");
    } else {
        handleNavigationClick("view-login");
        showAlert("danger", "Du behöver logga in för att få tillgång till önskelistan", "");
          }
    
  });

  $(".nav-link.shoppingcart").click(function () {
    if (loggedIn) {
      handleNavigationClick("view-shoppingcart");
    } else {
        handleNavigationClick("view-login");
        showAlert("danger", "Du behöver logga in för att få tillgång till varukorgen", "");
      }

  });

//Dropdown-logged out
$(".nav-item.dropdown .dropdown-menu .sign-up").click(function () {
  handleNavigationClick("view-sign-up");
});

$(".nav-item.dropdown .dropdown-menu .login").click(function () {
  handleNavigationClick("view-login");
});

//Dropdown-logged in
$(".nav-item.dropdown .dropdown-menu .orders").click(function () {
  handleNavigationClick("view-orders");
});

$(".nav-item.dropdown .dropdown-menu .returns").click(function () {
  handleNavigationClick("view-returns");
});

$(".nav-item.dropdown .dropdown-menu .profileinfo").click(function () {
  handleNavigationClick("view-profileinfo");
});

$(".nav-item.dropdown .dropdown-menu .settings").click(function () {
  handleNavigationClick("view-settings");
});

$(".nav-item.dropdown .dropdown-menu .logout").click(function () {
  handleNavigationClick("view-logout");
});

//Dropdown Admin
$(".nav-item.dropdown .dropdown-menu .adminOrders").click(function () {
  handleNavigationClick("view-adminOrders");
});

$(".nav-item.dropdown .dropdown-menu .adminConfirmProducts").click(function () {
  handleNavigationClick("view-admin-confirm-products");
});

//FOOTER-LINKS
$(".footer-link.shippingReturns").click(function () {
  handleNavigationClick("view-questions");
});

$(".footer-link.questions").click(function () {
  handleNavigationClick("view-questions");
});

$(".footer-link.buying").click(function () {
  handleNavigationClick("view-questions");
});

$(".footer-link.selling").click(function () {
  handleNavigationClick("view-questions");
});

$(".footer-link.payment").click(function () {
  handleNavigationClick("view-questions");
});

$(".footer-link.collecting").click(function () {
  handleNavigationClick("view-questions");
});

//The function that listens to if the user presses the back-arrow or going forward-arrow. 
window.addEventListener("popstate", function (event) {
  if (event.state) {
    const { productId, viewId } = event.state;
    loadView(viewId, productId);
  
  }

  $(document).on("click", "#returnPopup", function() {
    document.getElementById("returnModal").style.display = "block";
  });
 
});
});