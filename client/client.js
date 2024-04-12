//var signedIn = false;
host = window.location.protocol + '//' + location.host;

let guserId;
let yearCheckboxesfilter = [];
let sectionCheckboxesfilter = [];
let organizersCheckboxesfilter = [];
let eventCheckboxesfilter = [];
let shoppingcartID;
let userID;


//drop-down for profile 
$(document).ready(function () {
  $('.dropdown-toggle').dropdown();
});

//-------------------------------------------------
//HOME-PAGE
function ShowHomePage() {
  $(".container").html($("#view-home").html());
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
              <img class="card-img-top mx-auto d-block show-product" src="/product_images/${product.img}" alt="${product.name}" data-product-id="${product.id}"/>
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
                <button id="add-to-cart-btn${product.id}" data-product-id="${product.id}" onclick="addToShoppingCart(${product.id}, removeFromWishlist(${product.id}), document.getElementById('quantity${product.id}').value, '${product.name}')" class="btn btn-light" style="width: 145px; margin: 5px 0;" ${product.quantity === 0 ? 'disabled' : ''}>Lägg i varukorg</button>
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
      console.error("Error adding product to wishlist:", error); // Remove later
    },
  });
}
// Function to show the purchase page

function addToWishlist(productId, productName) {
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
      ShowFavoritesPage(); // Reload the favorites page
    },
    error: function (error) {
      displayMessage = "Produkten gick inte att ta bort från önskelistan.";
      showAlert("warning", displayMessage, "Försök igen.");
    }
  });
}


function addToShoppingCart(productId, orderQuantity, productName) {
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
        displayMessage = "Produkt: " + productName + " x " + orderQuantity + ".";
        showAlert("success", "Tillagd i varukorgen:", displayMessage);
      },
      error: function (error) {
        displayMessage = "Produkt: " + productName + " x " + orderQuantity + " blev inte tillagd i varukorgen.";
        showAlert("warning", displayMessage, "Försök igen.");
        if (error.status == 400) {
          showAlert("warning", "Ej tillräckligt många i lager.", "Minska antalet!");
        }
      },
    });
  } else {
    showAlert("warning", "Den nuvarande kvantiteten är inte tillåten.", "Var snäll och minska antalet!");
  }
}

function removeFromShoppingCart(productId) {
  $.ajax({
    url: host + "/cartitems/" + productId, 
    type: "DELETE",
    contentType: "application/json",
    headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
    success: function (response) {
      displayMessage = "Produkten togs bort från varukorgen.";
      showAlert("success", displayMessage, "");
      ShowShoppingcartPage(); // Reload the shoppingcart page
    },
    error: function (error) {
      displayMessage = "Produkten gick inte att ta bort från varukorgen.";
      showAlert("warning", displayMessage, "Försök igen.");
    }
  });
}

function ShowPurchasePage() {
  $(".container").html($("#view-purchase").html());

  // Initial fetch of products
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
  // Make AJAX request to fetch products
  $.ajax({
    url: host + "/products",
    type: "GET",

    success: function(response) {

      var filteredProducts = response.filter(function(product) {
        // Check if the product matches all selected filters
        return (
          (yearCheckboxesfilter.length === 0 || yearCheckboxesfilter.includes(product.year)) &&
          (sectionCheckboxesfilter.length === 0 || sectionCheckboxesfilter.includes(product.section)) &&
          (organizersCheckboxesfilter.length === 0 || organizersCheckboxesfilter.includes(product.organizer)) &&
          (eventCheckboxesfilter.length === 0 || eventCheckboxesfilter.includes(product.event))
        );
      });

      // Clear the product container before appending new products
      $("#product-container").empty();

      // Loop through each product and generate HTML dynamically
      filteredProducts.forEach(function(product) {
      //response.forEach(function(product) {
        var productHTML = `
          <div class="col-md-4">
                <div class="card">
                  <img src="/product_images/${product.img}" class="card-img-top centered-product-image show-product" data-product-id="${product.id}" alt="Product Image">
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
                          <button class="btn btn-dark" style="width: 105px;">Köp nu</button>
                          <button id="add-to-wishlist-btn${product.id} data-product-id="${product.id}" onclick="addToWishlist(${product.id}, '${product.name}')" class="btn btn-outline-dark" >
                              <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-heart" viewBox="0 0 16 16">
                                  <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15"/>
                              </svg>
                          </button>
                        </div>
                    </div>
                </div>
            </div>`;
        // Append product HTML to the container
        $("#product-container").append(productHTML);
      });
    },
    error: function(error) {
      console.error("Error fetching products:", error);
    }
  });
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
        All
      </label>
    </div>
  `);
  container.find(".form-check-input:not(.all-checkbox)").prop("checked", true);
}



// Function to handle checkbox selection
$(document).on("change", ".form-check-input", function() {
  var checkbox = $(this);
  var containerId = checkbox.closest(".form-check").parent().attr("id");

  if (checkbox.hasClass("all-checkbox")) {
    var isChecked = checkbox.prop("checked");
    $("." + containerId + " .form-check-input").prop("checked", isChecked);
    // Set all individual checkboxes to checked or unchecked based on the state of the "All" checkbox
    $("#" + containerId + " .form-check-input:not(.all-checkbox)").prop("checked", isChecked);
  } else {
    // If an individual checkbox is unchecked, uncheck the "All" checkbox
    if (!checkbox.prop("checked")) {
      $("#" + containerId + "-All").prop("checked", false);
    } else {
      var allOtherChecked = true; // Assume all other checkboxes are checked initially
        $("#" + containerId + " .form-check-input:not(.all-checkbox)").each(function() {
            if (!$(this).prop("checked")) {
                // If any checkbox (except "All") is unchecked, set allOtherChecked to false
                allOtherChecked = false;
                return false; // Exit the loop early
            }
        });

        // Set the state of the "All" checkbox based on allOtherChecked
        $("#" + containerId + "-All").prop("checked", allOtherChecked);
    }
  }

    // Update the corresponding filter list based on checked/unchecked checkboxes
    console.log(containerId);
    updateFilterList(containerId);

    // Refresh products based on the updated filters
    refreshProducts();

});

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
          ${product.year ? `<p>År: ${product.year}</p>` : ''}
          ${product.section ? `<p>Sektion: ${product.section}</p>` : ''}
          ${product.event ? `<p>Event: ${product.event}</p>` : ''}
          ${product.event_organizer ? `<p>Arrangör: ${product.event_organizer}</p>` : ''}
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
            <button id="add-to-wishlist-btn${product.id} data-product-id="${product.id}" onclick="addToWishlist(${product.id}, '${product.name}')" class="btn btn-outline-dark" >
                <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-heart" viewBox="0 0 16 16">
                    <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15"/>
                </svg>
            </button><br>
            <button class="btn btn-dark" style="width: 145px;">Köp nu</button>
          </div>
        </div>
      </div>
      `;
      $(".container").html(productPageHTML);
    }
  });
}

function search() {
  var input = document.getElementById('searchBar').value;
  console.log(input); 
populateSearch(input);
}

function populateSearch(searchInput) {
      // Select all items within the product container
      var items = document.getElementById('product-container').getElementsByClassName('col-md-4');

      for (var i = 0; i < items.length; i++) {
          // Get the product name within the current item
          var productName = items[i].getElementsByClassName('card-title')[0].textContent.toLowerCase();

          if (productName.includes(searchInput)) {
            // Show the item by setting its display property to "block"
            items[i].style.display = 'block';
           
        } else {
            // Hide the item if it doesn't match the search input
            items[i].style.display = 'none';
  
        }
      }  
}

// Function to update the global filter lists based on checked/unchecked checkboxes
function updateFilterList(containerId) {
  // Get the checked checkboxes and update the corresponding global filter list
  $("#" + containerId + " .form-check-input").each(function() {
    var value = $(this).val();
    // Check if the checkbox is checked
    if ($(this).prop("checked")) {
      // If checked and not already in the filter list, add to the corresponding global filter list

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
      // If unchecked, remove from the corresponding global filter list if present
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

//
//
//
//
//
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
    processData: false,  // tell jQuery not to process the data
    contentType: false,  // tell jQuery not to set contentType
    data: formData,
    success: function (response) {
        showAlert("success", "Product Added!", "Nice!");
    },
    error: function (error) {
        console.error(error);
    }
  });
}

function ShowShoppingcartPage() {
  $(".container").html($("#view-shoppingcart").html());
  $.ajax({
    url: host + "/myShoppingCart", 
    type: "GET",
    contentType: "application/json",
    headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
    success: function (response) {
      console.log(response.cartitems);
      console.log(response.cartitems[0].product.id);
      let totalPrice = 0;
      let htmlString = '';
      response.cartitems.forEach(item => {
        totalPrice += item.product.price * item.quantity;
        htmlString += `
          <div class="col-lg-4 col-md-6 mb-4" style="display: inline;">
            <div class="card shoppingcart-item h-100">
              <img class="card-img-top mx-auto d-block show-product" src="/product_images/${item.product.img}" alt="${item.product.name}" data-product-id="${item.product.id}"/>
              <div class="card-body">
                <h5 class="card-title show-product" data-product-id="${item.product.id}">${item.product.name}</h5>
                <p class="card-text">${item.product.description}</p>
                <p class="card-text"> ${item.product.price} kr</p>
                <div class="d-flex mb-3 col-2">
                    <label for="quantity" class="me-2"></label>
                    <div class="input-group">
                        <button class="btn btn-sm btn-outline-dark" data-product-id="${item.product.id}" onclick="this.parentNode.querySelector('input[type=number]').stepDown(), decreaseQuantity(${item.product.id}, ${item.quantity})" id="minus-button${item.product.id}">
                            <i class="fas fa-minus"></i>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-dash" viewBox="0 0 16 16">
                                <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8"/>
                            </svg>
                        </button>
                        <input type="number" id="quantity${item.product.id}" class="form-control" value="${item.quantity}" min="1" max="${item.product.quantity}">
                        <button class="btn btn-sm btn-outline-dark" data-product-id="${item.product.id}" onclick="this.parentNode.querySelector('input[type=number]').stepUp(), increaseQuantity(${item.product.id}, ${item.product.quantity}, ${item.quantity})" id="plus-button${item.product.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus" viewBox="0 0 16 16">
                                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
                            </svg>
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
              </div>
            </div>
          </div>`;
      });
      htmlString += `totalprice: ${totalPrice}`;
      $(".container").append(htmlString);
    }
  });
}

function increaseQuantity(productId, maxQuantity, productQuantity) { //lägg till vänta så att hemsidan inte uppdateras för snabbt
  console.log("maxQ: " + maxQuantity + " prodQ: " + productQuantity);
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
              console.log(response);
            }
          });
        }
      });
      ShowShoppingcartPage();
    }
  });
  } else {
    ShowShoppingcartPage();
    displayMessage = "Ej tillräckligt många varor i lager.";
    showAlert("warning", displayMessage, "");
  }

}

function decreaseQuantity(productId, productQuantity) { //lägg till vänta så att hemsidan inte uppdateras för snabbt
  console.log("decreasing Q, prodID: " + productId);
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
                console.log(response);
              }
            });
          }
        });
        ShowShoppingcartPage();
      } 
    });
  } else {
    removeFromShoppingCart(productId);
    ShowShoppingcartPage();
    displayMessage = productId + " togs bort från varukorgen."
    showAlert("success", displayMessage, "");
  } 
}

//-------------------------------------------------
//CHECKOUT-PAGE
function ShowCheckoutPage() {
 $(".container").html($("#view-checkout").html());
}

//-------------------------------------------------
//ORDER-CONFIRMATION-PAGE
function ShowOrderConfirmationPage() {
  $(".container").html($("#view-order-confirmation").html());
  
    var currentDateElement = document.getElementById("currentDate");
    var currentDate = new Date().toLocaleDateString(); 
  
    currentDateElement.textContent = currentDate;

}

//-------------------------------------------------
//ORDERS-PAGE
function ShowOrdersPage() {
  $(".container").html($("#view-orders").html());
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
}

//-------------------------------------------------
//ADMIN-RETURNS-PAGE
function ShowAdminReturnsPage(){
  $(".container").html($("#view-admin-returns").html());
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
    
        console.log("user GETIDENTITY", user); // Remove later
      
        if (user.user.is_admin === false) {
          shoppingcartID = user.user.shoppingcart.id;
          userID = user.user.id;
          loggedInDropdown.style.display = 'block';
          loggedOutDropdown.style.display = 'none';
          adminDropdown.style.display = 'none';
          sellButton.style.display='block';
          
          console.log("admin false", user.user.is_admin);
        } else {
          shoppingcartID = user.user.shoppingcart.id;
          userID = user.user.id;
          loggedInDropdown.style.display = 'none';
          loggedOutDropdown.style.display = 'none';
          adminDropdown.style.display = 'block'; 
          sellButton.style.display='none';
          console.log("admin true", user.user.is_admin);
        }
      },
      
      error: function(jqXHR, error) {
        if (jqXHR.status === 401) {
          logout();
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
  // Clear the auth token from session storage
  sessionStorage.removeItem('auth');
  location.reload();
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
          console.log(response);
          sessionStorage.setItem('auth', JSON.stringify(response));

          guserId = JSON.parse(sessionStorage.getItem('auth')).user.id;
          console.log("guserId", guserId);

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


//------------------------------------------
//CLICK-EVENTS

$(document).ready(function () {
  
  checkLoggedIn();
  ShowHomePage();
  
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
        case "view-logout":
          ShowLogoutPage();
          break;
        case "view-adminOrders":
          ShowAdminOrdersPage();
          break;
        case "view-adminReturns":
          ShowAdminReturnsPage();
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
    console.log("State object:", history.state);
    console.log(productId);
  }
}



$(document).on("click", "#checkout-button", function() {
    handleNavigationClick("view-checkout");
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
    ShowFavoritesPage();
    // if (loggedIn) {
    //   ShowFavoritesPage();
    // } else {
    //   showAlert("danger", "Du behöver logga in för att spara favoriter", "");
    //   setTimeout(function() {
    //     ShowLoginPage();
    //   }, 5000);
      
    //       }
    
  });
  
  $(".nav-link.shoppingcart").click(function () {
    handleNavigationClick("view-shoppingcart");
  });

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

$(".nav-item.dropdown .dropdown-menu .adminReturns").click(function () {
    handleNavigationClick("view-adminReturns");
});

//Footer
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
   
  });

//PURCHASE
// $(document).on("click", ".btn.btn-outline-dark", function() {
//  if (signedIn) {
//   ShowFavoritesPage()
//  } else {
//   showAlert("danger", "Du behöver logga in för att spara favoriter", "");
//   setTimeout(function() {
//     ShowLoginPage();
//   }, 5000);
  
//  }
// });


});


