// **************************************
// Login section
let loginPage = $("#loginPage");
let adminPage = $("#adminPage");

if (localStorage.getItem("login")) {
    loginPage.hide();
    adminPage.show();
} else {
    loginPage.show();
    adminPage.hide();
}

$("#loginBtn").on("click", (e) => {
    e.preventDefault();
    let usernameVal = $("#userName").val().trim();
    let passwordVal = $("#password").val().trim();
    let title = "";

    let clearInput = () => {
        $("#userName").val("");
        $("#password").val("");
    }

    if (usernameVal === "") {
        title = "Username can't be empty!"
    } else if (passwordVal === "") {
        title = "Password can't be empty!"
    } else if (passwordVal.length < 8) {
        title = "Password can't be shorter than 8 characters!"
    } else {
        db.ref('/login').on("value", function (snap) {
            let username = snap.val().name;
            let password = snap.val().password;
            if (usernameVal == username && passwordVal == password) {
                localStorage.setItem("login", JSON.stringify(snap.val()));
                clearInput();
                loginPage.hide();
                adminPage.show();
            } else {
                swal({
                    icon: 'error',
                    title: 'Error...',
                    text: 'Username or password is incorrect',
                })
                clearInput();
            }
        });
        return;
    }

    swal({
        icon: 'error',
        title: 'Error...',
        text: title,
    })

    clearInput();
})

// **************************************
// Logout section

$(".logout-BTN").on("click", () => {
    localStorage.removeItem("login");
    loginPage.show();
    adminPage.hide();
})

// **************************************
// Clear input of book section

let clearBookInput = () => {
    $("#bookName").val("");
    $("#authorName").val("");
    $("#bookImageUrl").val("");
    $("#addBookDescription").val("");
    $("#publicationYear").val("");
    $("#isNew").prop("checked", false);
}

// **************************************
// Search section

$("#searchBtn").on("click", (e) => {
    e.preventDefault();
    $("#searchInput").val() !== "" ? $("#searchResult").show() : false;
})

$("#searchResult").on("click", () => {
    $("#searchResult").hide();
    $("#searchInput").val("");
});

$("#searchBtn").on("click", () => {
    $("#searchResult ul").html(`<img id="loadingImg" src="./assets/img/loading.gif" width="50" class="d-block m-auto" alt="">`);
    let search = $("#searchInput").val();
    const books = {
        "async": true,
        "crossDomain": true,
        "url": `https://www.googleapis.com/books/v1/volumes?q=${search}`,
        "method": "GET",
    };

    $.ajax(books).then(function (response) {
        $("#searchResult ul").html("");
        let dataArr = response.items;
        if (!dataArr) {
            $("#searchResult ul").css({ "overflow-y": "hidden" })
            $("#searchResult ul").html(`<p class="text-danger">No results found for your search</p>`);
        } else {
            for (let item of dataArr) {
                let data = item.volumeInfo;
                let searchImg = '';
                data.imageLinks.thumbnail ? searchImg = data.imageLinks.thumbnail : searchImg = './assets/img/book.png';
                let searchRes = $("<li>").addClass("row align-items-center mb-3 cursor-pointer").attr("data-name", data.authors);
                searchRes.html(`<img src="${searchImg}" class="col-4 search-img" alt=""><span class="col-8">${data.authors}</span>`);
                $("#searchResult ul").append(searchRes);
                searchRes.on("click", function () {
                    clearBookInput();
                    getBookInfo(data);
                })
            }
        }
    })
})

// **************************************
// Textarea limit function

function countLimit(textarea, countDiv, textDiv) {
    $(textarea).on("change keyup paste", () => {
        $(countDiv).text($(textarea).val().length);
        if ($(textarea).val().length >= 1000) {
            $(textDiv).addClass("text-danger");
        } else {
            $(textDiv).removeClass("text-danger");
        }
    })
}

countLimit("#addBookDescription", "#bookTextareaCount", "#bookTextarea");


// ***************************************
// Get book information and write to input

function getBookInfo(data) {
    $("#bookName").val(data.title);
    $("#authorName").val(data.authors);
    if (data.imageLinks.thumbnail) {
        $("#bookImageUrl").val(data.imageLinks.thumbnail);
    }

    let descriptionCount = (data.description).length;

    $("#addBookDescription").val(data.description.substring(0, 1000));

    descriptionCount < 1000 ? descriptionCount = descriptionCount : descriptionCount = 1000;

    $("#bookTextareaCount").text(descriptionCount);

    if (data.publishedDate) {
        let publishYear = parseInt(data.publishedDate.substring(0, 4))
        let thisYear = new Date().getFullYear();
        $("#publicationYear").val(publishYear);

        if (publishYear >= (thisYear - 2)) {
            $("#isNew").prop("checked", true);
        }
    }
}

// **************************************
// Add and Show Book Type Section

let addTypeSection = $('#addTypeSection');
let dbBookType = db.ref("/book-type");
let bookTypeInput = $("#bookTypeInput");

$('#addTypeBtn').click(function (e) {
    addTypeSection.toggle();
    e.stopPropagation();
});

$("body").click(function () {
    addTypeSection.hide();
});

addTypeSection.click(function (e) {
    e.stopPropagation();
});

dbBookType.on("value", function (snap) {
    let categoryObj = snap.val()
    let categoryArr = Object.entries(categoryObj).reverse();
    let idObjectArray = categoryArr.map(item => {
        return {
            id: item[0],
            ...item[1]
        }
    })

    renderCategoryPage(idObjectArray);
})

function renderCategoryPage(arr) {
    $("#categorySelect").html(arr.map(item => {
        return `<option value="${item.category}">${item.category}</option>`
    }))
}

$("#bookTypeBtn").on("click", (e) => {
    e.preventDefault();
    addTypeSection.hide();
    let typeVal = bookTypeInput.val().trim();
    if (typeVal) {
        dbBookType.push().set({ category: typeVal })
        swal({
            icon: 'success',
            title: 'Success...',
            text: "Book type successfully added!",
        })
    } else {
        swal({
            icon: 'error',
            title: 'Error...',
            text: "Book type can't be empty!",
        })
    }
    bookTypeInput.val("");
})


// **************************************
// Add book to firebase section

$("#addBookBtn").on("click", function () {
    let bookName = $("#bookName").val().trim();
    let authorName = $("#authorName").val().trim();
    let image = $("#bookImageUrl").val().trim();
    let year = $("#publicationYear").val();
    let description = $("#addBookDescription").val().trim();
    let category = $("#categorySelect").val();
    let isNew = $("#isNew").is(":checked");

    function GetTodayDate() {
        var tdate = new Date();
        var dd = tdate.getDate();
        var MM = tdate.toLocaleString('default', { month: 'long' }).toLowerCase();
        var yyyy = tdate.getFullYear();
        var hh = tdate.getHours();
        var minutes = tdate.getMinutes();
        hh < 10 ? hh = "0" + hh : hh;
        minutes < 10 ? minutes = "0" + minutes : minutes;
        var currentDate = dd + " " + MM + " " + yyyy + " " + hh + ":" + minutes;
        return currentDate;
    }

    // console.log(GetTodayDate());

    let addDate = GetTodayDate();

    if (bookName === "" || authorName === "" || description === "") {
        swal({
            icon: 'error',
            title: 'Error...',
            text: "Book data can't be empty",
        })
        return;
    }

    let bookObj = {
        bookName,
        authorName,
        image,
        year,
        description,
        isNew,
        category,
        addDate,
    }

    db.ref("/books").push().set(bookObj);

    swal({
        icon: 'success',
        title: 'Success...',
        text: "Book successfully added",
    })
    clearBookInput();

})

// *****************************
// About store section

countLimit("#aboutDescription", "#aboutTextareaCount", "#aboutTextarea");

db.ref('about-store').on("value", function (snap) {
    $("#title").val(snap.val()["about-title"]);
    $("#imageUrl").val(snap.val()["about-url"]);
    $("#aboutDescription").val(snap.val()["about-description"]);

    let aboutCount = (snap.val()["about-description"]).length;
    $("#aboutTextareaCount").text(aboutCount);
})

$(".about-info-add").on("click", (e) => {
    e.preventDefault();
    let title = $("#title").val().trim();
    let imageUrl = $("#imageUrl").val().trim();
    let aboutDescription = $("#aboutDescription").val().trim();


    if (title === "" || imageUrl === "" || aboutDescription === "") {
        swal({
            icon: 'error',
            title: 'Error...',
            text: "Information can't be empty",
        })
        return
    }
    db.ref('about-store').set({
        "about-title": title,
        "about-url": imageUrl,
        "about-description": aboutDescription
    });

    swal({
        icon: 'success',
        title: 'Success...',
        text: "Information successfully updated",
    })
})

// End of about store section
// *****************************

// *****************************
// Join us section 

let userCollection = db.ref("/users");
userCollection.on("value", function (snap) {
    let data = Object.entries(snap.val()).map((item) => {
        return {
            id: item[0],
            ...item[1]

        }
    })
    renderPage(data)
})

function renderPage(arr) {
    $("#joinUsTbody").html(
        arr.map((item, index) => {
            return `
        <tr>
            <th scope="row">${index + 1}</th>
            <td>${item.joinFullName}</td>
            <td>${item.joinEmail}</td>
        </tr>
        `
        })
    )
}

// End of join us section
// *****************************


// *****************************
// Contact us section
db.ref('/contactUs').on("value", function (snap) {
    let data = Object.entries(snap.val()).map((item) => {
        return {
            id: item[0],
            ...item[1]

        }
    })
    renderContactPage(data)
})

function renderContactPage(arr) {
    $("#contactUsTbody").html(
        arr.map((item, index) => {
            return `
        <tr>
            <th scope="row">${index + 1}</th>
            <td>${item.fullName}</td>
            <td>${item.address}</td>
            <td>${item.email}</td>
            <td>${item.phone}</td>
        </tr>
        `
        })
    )
}

// End of contact us section
// *****************************

// Sidebar

var hamburger = document.getElementById("hamburger");
var clikedFunctionFirst1 = document.getElementById("clikedFunctionFirst1")
var clikedFunctionFirst2 = document.getElementById("clikedFunctionFirst2")
var backColour = document.getElementById("backColour")
hamburger.addEventListener("click", function () {
    $(".CloseMenuHeaderSection").removeClass("d-none")
    $(".CloseMenuHeaderSection").addClass("d-block")
    document.body.classList.add("OpenMenuSTART")
    clikedFunctionFirst1.classList.add("opavisib")
    clikedFunctionFirst2.classList.add("opavisib")
    backColour.classList.add("backcolor")
})
var closeBtn = document.getElementById("closeBtn");
closeBtn.addEventListener("click", function () {
    document.body.classList.remove("OpenMenuSTART")
    backColour.classList.remove("backcolor")
})
$(document).on("click", ".home", function () {
    $("body").removeClass("OpenMenuSTART")
    backColour.classList.remove("backcolor")
});