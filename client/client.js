//var signedIn = false;
host = window.location.protocol + '//' + location.host;

var guserId;
var yearCheckboxesfilter = [];
var sectionCheckboxesfilter = [];
var organizersCheckboxesfilter = [];
var eventCheckboxesfilter = [];

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
}
// Function to show the purchase page
function ShowPurchasePage() {
  $(".container").html($("#view-purchase").html());

  // Initial fetch of products
  $.ajax({
      url: host + "/products", 
      type: "GET",
      success: function(response) {
          response.forEach(function(product) {
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
                                <input type="number" id="quantity" class="form-control" value="1" min="1" max="${product.quantity}">
                                <button class="btn btn-sm btn-outline-dark" onclick="this.parentNode.querySelector('input[type=number]').stepUp()" id="plus-button">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus" viewBox="0 0 16 16">
                                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
                                    </svg>
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                        <button class="btn btn-light" style="width: 145px; margin: 5px 0;" ${product.quantity === 0 ? 'disabled' : ''}>Lägg i varukorg</button>
                        <div class="product-overview">
                          <button class="btn btn-dark" style="width: 105px;">Köp nu</button>
                          <button class="btn btn-outline-dark">
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
          populateFilterDropdowns(response);
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
          <p class="card-text">${product.description.length > 28 ? product.description.substring(0, 25) + '...' : product.description}</p>
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
                  <input type="number" id="quantity" class="form-control" value="1" min="1" max="${product.quantity}">
                  <button class="btn btn-sm btn-outline-dark" onclick="this.parentNode.querySelector('input[type=number]').stepUp()" id="plus-button">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus" viewBox="0 0 16 16">
                          <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
                      </svg>
                      <i class="fas fa-plus"></i>
                  </button>
              </div>
          </div>
          <div class="justify-content-between mb-3">
            <button class="btn btn-light" style="width: 145px; margin: 5px 0;" ${product.quantity === 0 ? 'disabled' : ''}>Lägg i varukorg</button>
            <button class="btn btn-outline-dark">
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


function refreshProducts() {
  // Make AJAX request to fetch products
  $.ajax({
    url: host + "/products",
    type: "GET",

    success: function(response) {

      var filteredProducts = response.filter(function(product) {
        // Check if the product matches all selected filters
        console.log(yearCheckboxesfilter);
        console.log(product.year);
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
                                <input type="number" id="quantity" class="form-control" value="1" min="1" max="${product.quantity}">
                                <button class="btn btn-sm btn-outline-dark" onclick="this.parentNode.querySelector('input[type=number]').stepUp()" id="plus-button">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus" viewBox="0 0 16 16">
                                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
                                    </svg>
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                        <button class="btn btn-light" style="width: 145px; margin: 5px 0;" ${product.quantity === 0 ? 'disabled' : ''}>Lägg i varukorg</button>
                        <div class="product-overview">
                          <button class="btn btn-dark" style="width: 105px;">Köp nu</button>
                          <button class="btn btn-outline-dark">
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

//SHOPPINGCART-PAGE
function ShowShoppingcartPage() {
  $(".container").html($("#view-shoppingcart").html());
}

//-------------------------------------------------
//CHECKOUT-PAGE
function ShowCheckoutPage() {
 $(".container").html($("#view-checkout").html());
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

//-------------------------------------------------
//FUNCTIONS
function refreshCarList() {

  $(".car-list").empty();

  // Display each car in the updated list
  displayCarList();

  showAlert("success", "Car List Updated!", "The car list has been successfully updated.");
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

  const loggedInDropdown = document.getElementById('loggedInDropdown');
  const loggedOutDropdown = document.getElementById('loggedOutDropdown');
  const adminDropdown = document.getElementById('adminDropdown');

  if (signedIn == true) {

    loggedInDropdown.style.display = 'block';
    loggedOutDropdown.style.display = 'none';
    adminDropdown.style.display = 'none'; 

    console.log("auth.access", auth.token);

    $.ajax({
      url: '/get-identity',
      type: 'GET',
      headers: {
        'Content-Type': 'application/json',
        "Authorization": "Bearer " + auth.token
       
      },

      success: function(user) {
    
        console.log("get-identity hej", guserId);
      
        if (user.user.is_admin === false) {
          loggedInDropdown.style.display = 'block';
          loggedOutDropdown.style.display = 'none';
          adminDropdown.style.display = 'none';
          console.log("admin false", user.user.is_admin);
        } else {
          loggedInDropdown.style.display = 'none';
          loggedOutDropdown.style.display = 'none';
          adminDropdown.style.display = 'block'; 
          console.log("admin true", user.user.is_admin);
        }
      },
      
      error: function(error) {
        console.error("Error fetching identity:", error);
        adminDropdown.style.display = 'none'; 
      }
    });

  } else {
    loggedInDropdown.style.display = 'none';
    loggedOutDropdown.style.display = 'block';
    adminDropdown.style.display = 'none'; 
  }
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

  //NAVBAR-LINKS
  $(".nav-link.home").click(function () {
      ShowHomePage();
  });

  $(".nav-link.contact").click(function () {
      ShowContactPage();
  });

  $(".navbar-brand.logo").click(function () {
    ShowHomePage();
  });

  $(".nav-link.purchase").click(function () {
    ShowPurchasePage();
  });

  $(".nav-link.sell").click(function () {
    ShowSellPage();
  });

  $(".nav-link.aboutus").click(function () {
    ShowAboutusPage();
  });

  $(".nav-link.logout").click(function () {
    ShowLogoutPage();
  });

  $(".nav-link.favorites").click(function () {
    ShowFavoritesPage();
  });

  $(".nav-link.shoppingcart").click(function () {
    ShowShoppingcartPage();
  });

//Product page
$(document).on('click', '.show-product', function() {
  var productId = $(this).data('product-id');
  ShowProductPage(productId);
});


//Dropdown-logged out
$(".nav-item.dropdown .dropdown-menu .sign-up").click(function () {
  //if (!signedIn) {
  //  ShowRegisterPage();
 // }
 ShowSignUpPage();
});

$(".nav-item.dropdown .dropdown-menu .login").click(function () {
 // if (!signedIn) {
 //   ShowLoginPage();
 // }
 ShowLoginPage();
});

//Dropdown-logged in
$(".nav-item.dropdown .dropdown-menu .orders").click(function () {
  ShowOrdersPage();
});

$(".nav-item.dropdown .dropdown-menu .returns").click(function () {
  ShowReturnsPage();
});

$(".nav-item.dropdown .dropdown-menu .profileinfo").click(function () {
  ShowProfileinfoPage();
});

$(".nav-item.dropdown .dropdown-menu .settings").click(function () {
  ShowSettingsPage();
});

$(".nav-item.dropdown .dropdown-menu .logout").click(function () {
  ShowLogoutPage();
});

//Dropdown Admin
$(".nav-item.dropdown .dropdown-menu .adminOrders").click(function () {
  ShowAdminOrdersPage();
});

$(".nav-item.dropdown .dropdown-menu .adminReturns").click(function () {
  ShowAdminReturnsPage();
});

$(".nav-item.dropdown .dropdown-menu .settings").click(function () { //Behövs ej?
  ShowSettingsPage();
});

$(".nav-item.dropdown .dropdown-menu .logout").click(function () { //Behövs ej? 
  ShowLogoutPage();
});

//FOOTER-LINKS
$(".footer-link.shippingReturns").click(function () {
  ShowQuestionsPage();
  ShowQuestionsShippingAndReturnsPage();
});

$(".footer-link.questions").click(function () {
  ShowQuestionsPage();
});

$(".footer-link.buying").click(function () {
  ShowQuestionsPage();
  ShowQuestionsBuyingPage();
});

$(".footer-link.selling").click(function () {
  ShowQuestionsPage();
  ShowQuestionsSellingPage();
});

$(".footer-link.payment").click(function () {
  ShowQuestionsPage();
  ShowQuestionsPaymentPage();
});

$(".footer-link.collecting").click(function () {
  ShowQuestionsPage();
  ShowQuestionsCollectingPage();
});

//SHOPPING-CART and CHECKOUT
$(document).on("click", "#checkout-button", function() {
  ShowCheckoutPage();
});

});


