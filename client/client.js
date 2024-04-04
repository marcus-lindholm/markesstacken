var signedIn = false;
var guserId;

//drop-down for profile 
$(document).ready(function () {
  $('.dropdown-toggle').dropdown();
});

//HOME-PAGE
function ShowHomePage() {
  $(".nav-link.login, .nav-link.sign-up").toggleClass('d-none', signedIn);
  $(".nav-link.logout, .nav-link.cars").toggleClass('d-none', !signedIn);
  $(".container").html($("#view-home").html());
}

//LOGIN-PAGE
function ShowLoginPage() {
  $(".container").html($("#view-login").html());
}

//REGISTER-PAGE
function ShowRegisterPage() {
  $(".container").html($("#view-register").html());
}

//ABOUTUS-PAGE
function ShowAboutusPage() {
  $(".container").html($("#view-aboutus").html());
}

//FAVORITES-PAGE
function ShowFavoritesPage() {
  $(".container").html($("#view-favorites").html());
}

//PURCHASE-PAGE
function ShowPurchasePage() {
  $(".container").html($("#view-purchase").html());
}

//SELL-PAGE
function ShowSellPage() {
  $(".container").html($("#view-sell").html());
}

function ShowContactPage() {
  $(".container").html($("#view-contact").html());
}

function addProduct(){
  console.log("adding product");
  const name = document.getElementById("product-name").value;
  console.log(name);
  const description = document.getElementById("product-description").value;
  const price = document.getElementById("product-price").value;
  const quantity = document.getElementById("product-quantity").value;
  //const img = document.getElementById("product-img").value;

  console.log(name, description, price, quantity);

  $.ajax({
    url: '/products',
    type: 'POST',
    //headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
    contentType: 'application/json',
    data: JSON.stringify({
      name: name,
      description: description, 
      price: price,
      quantity: quantity}),
    success: function (response) {
        console.log(response);
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

//CHECKOUT-PAGE
function ShowCheckoutPage() {
 $(".container").html($("#view-checkout").html());
}

//ORDERS-PAGE
function ShowOrdersPage() {
  $(".container").html($("#view-orders").html());
}

//RETURNS-PAGE
function ShowReturnsPage(){
  $(".container").html($("#view-returns").html());
}

//PROFILE-PAGE
function ShowProfileinfoPage(){
  $(".container").html($("#view-profileinfo").html());
}

//SETTINGS-PAGE
function ShowSettingsPage(){
  $(".container").html($("#view-settings").html());
}

//LOGOUT-PAGE
function ShowLogoutPage(){
  $(".container").html($("#view-logout").html());
}

//QUESTION-PAGES
function ShowQuestionsPage(){
  $(".container").html($("#view-questions").html());
}

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



// function ShowCarsPage() {
//   $(".container").html($("#view-cars").html());

//   displayCarList();

//   if (JSON.parse(sessionStorage.getItem('auth')).user.is_admin) {
//     $(".add-car-btn").show();
//   } else {
//     $(".add-car-btn").hide();
//   }
// }



//FUNCTIONS
function refreshCarList() {

  $(".car-list").empty();

  // Display each car in the updated list
  displayCarList();

  showAlert("success", "Car List Updated!", "The car list has been successfully updated.");
}

host = window.location.protocol + '//' + location.host

function displayCarList() {
  $.ajax({
    url: host + '/cars',
    type: 'GET',
    headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
    success: function(cars) {
      cars.forEach(function (car) {
        var carHTML = `
        <div class="card mb-3" data-car-id="${car.id}">
          <div class="card-body">
            <h5 class="card-title">${car.make} ${car.model}</h5>`;
      
      if (JSON.parse(sessionStorage.getItem('auth')).user.is_admin) {
        carHTML += `
            <p class="card-text"><strong>User:</strong> ${car.user_id ? car.user_id.name : 'No user'}</p>
            <button class="btn btn-primary mr-2 edit-car-btn">Edit</button>
            <button class="btn btn-danger delete-car-btn">Delete</button>`;
      } else {
        // Check if the car is booked
        if (car.user_id) {
          carHTML += `<p class="card-text"><strong>Booked by:</strong> ${car.user_id.name}</p>`;
        } else {
          carHTML += `<button class="btn btn-success book-car-btn">Book</button>`;
        }
      }
      if (car.user_id && car.user_id.id === guserId) {
        carHTML += `<button class="btn btn-warning unbook-car-btn">Unbook</button>`;
      }
      
      carHTML += `
          </div>
        </div>`;
      
  
        var $carElement = $(carHTML);
  
        $carElement.find('.edit-car-btn').on('click', function() {
          var carId = $carElement.data('car-id');
          editCar(carId);
        });
  
        $carElement.find('.delete-car-btn').on('click', function() {
          var carId = $carElement.data('car-id');
          deleteCar(carId);
          $carElement.remove();
        });
        $carElement.find(".book-car-btn").on('click', function() {
          
          var car_id = $carElement.data('car-id');
          var bookUserID = JSON.parse(sessionStorage.getItem('auth')).user.id;
       
          $.ajax({
             url: host + '/cars/' + car_id + '/booking',
             type: 'POST',
             contentType: 'application/json',
             data: JSON.stringify({ user_id: bookUserID}),
             headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
             success: function(response) {
                refreshCarList();
                showAlert("success", "Car Booked!", "Nice!");
             },
             error: function() {
                alert("Error booking car.");
             } 
          });

        });
        $carElement.find('.unbook-car-btn').on('click', function() {
          var car_id = $carElement.data('car-id');

          $.ajax({
            url: host + '/cars/' + car_id,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({ user_id: 0}),
            headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
            success: function(response) {
              showAlert("success", "Car Is Un Booked!", "Nice!");
              refreshCarList();
            },
            error: function() {
               alert("Error cancelling car.");
            } 
         });

        });
  
        $(".car-list").append($carElement);
      });
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.error("Status Code: " + jqXHR.status);
      console.error("Response: " + jqXHR.responseText);
      console.error("Error Thrown: " + errorThrown);
    }
    
  });
}
  

function deleteCar(carId) {

  $.ajax({
    url: host + '/cars/' + carId,
    type: 'DELETE', // eller 'PUT', 'POST' eller 'DELETE'
    headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
    // ...
    success: function(cars) {
     
       alert('Delete car with ID ' + carId);
       refreshCarList();
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.error("Status Code: " + jqXHR.status);
      console.error("Response: " + jqXHR.responseText);
      console.error("Error Thrown: " + errorThrown);
    }
    })

  }
var currentCarId; 

function editCar(carId) {
  currentCarId = carId;

  $.ajax({
    url: host + '/cars/' + carId,
    type: 'GET', // eller 'PUT', 'POST' eller 'DELETE'
    headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
    // ...
    success: function(car) {
      console.log("hej2");
      $("#editMake").val(car.make);
      $("#editModel").val(car.model);
      $("#editUser").val(car.user_id);
      $("#editCarModal").modal('show');
    }
  })
}

$("#editCarForm").submit(function (event) {
  event.preventDefault();

  var carId = currentCarId;
  var editedCarData = {
    make: $("#editMake").val(),
    model: $("#editModel").val(),
    user_id: $("#editUser").val(),
  };

  if (editedCarData.user_id !== "" && !isNaN(editedCarData.user_id) && !userExists(parseInt(editedCarData.user_id))) {
    showAlert("danger", "Error", "User ID does not exist!");
    $("#editCarModal").modal('hide');
    return; 
  }


  $.ajax({
    url: host + '/cars/' + carId,
    type: 'PUT', // eller 'PUT', 'POST' eller 'DELETE'
    contentType: 'application/json',  
    data: JSON.stringify(editedCarData), 
    headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
    success: function() {
      $("#editCarModal").modal('hide');

      refreshCarList();
      showAlert("success", "Car Updated!", "Nice!");
    }
  })
});


function userExists(UserId) {
  return $.ajax({
    url: host + '/users/' + UserId,
    type: 'GET',
    headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
    success: function (response) {
        return response.exists;
    },
    error: function () {
        console.error("Failed to check user existence!");
        return false; // You might want to handle errors appropriately
    }
});
}


$(".add-car-btn").on('click', function() {
  $("#addMake, #addModel").val('');
});

$("#addCarForm").submit(function (event) {
  event.preventDefault();

  var newCarData = {
      make: $("#addMake").val(),
      model: $("#addModel").val(),
  };

  $.ajax({
      url: host + '/cars',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({make: newCarData.make, model : newCarData.model}),
      headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
      success: function (addedCar) {
          $("#addCarModal").modal('hide');
          refreshCarList();
          showAlert("success", "Car Added!", "Good job!");
      },
      error: function (xhr, textStatus, errorThrown) {
          showAlert("error", "Failed to add car. Please try again.");
      }
  });
});


function ShowSignUpPage() {

  var signUpViewTemplate = $("#view-sign-up").html();

  $("#content-container").html(signUpViewTemplate);

  $("#registerForm").submit(function (event) {
      event.preventDefault();

      var formData = {
          name: $("#name").val(),
          email: $("#email").val(),
          password: $("#password").val()
      };

      $.ajax({
          url: host + '/sign-up',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({name: formData.name,email: formData.email, password: formData.password}),
          success: function (response) {

              ShowHomePage();
          }, 
          error: function (error) {
              console.error(error);
          }
      });
  });
}

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

          console.log(signedIn);
          signedIn = sessionStorage.getItem('auth') !== null;
          console.log(signedIn);
          guserId = JSON.parse(sessionStorage.getItem('auth')).user.id;

          ShowHomePage();
          showAlert("success", "Du är nu inloggad", "Välkommen att kika runt!");
        },
        error: function (error) {
          console.error(error);
          showAlert("danger", "Inloggning misslyckades!", "Fel användarnamn eller lösenord");
        }
      });
    });
}

function ShowLogoutPage() {
  var logoutViewTemplate = $("#view-logout").html();

  $("#content-container").html(logoutViewTemplate);

  $("#logoutForm").submit(function (event) {
    event.preventDefault();

    sessionStorage.removeItem('auth');

    signedIn = sessionStorage.getItem('auth') !== null;
    ShowHomePage();
    
  });

}

//CLICK-EVENTS

$(document).ready(function () {
  // Show home page on initial load
  ShowHomePage();

  signedIn = sessionStorage.getItem('auth') !== null;
  console.log(signedIn);

  $(".nav-link.login, .nav-link.sign-up").toggleClass('d-none', signedIn);

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

  $(".nav-link.register").click(function () {
    //if (!signedIn) {
    //  ShowRegisterPage();
   // }
   ShowRegisterPage();
  });

  $(".nav-link.login").click(function () {
   // if (!signedIn) {
   //   ShowLoginPage();
   // }
   ShowLoginPage();
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


// $(document).on("click", ".refresh-car-btn", function () {
//   refreshCarList();
// });

