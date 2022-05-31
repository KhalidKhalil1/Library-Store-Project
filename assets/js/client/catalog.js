$(document).ready(function () {
    $('.owl-carousel1').owlCarousel({
        autoplay: true,
        autoplayTimeout: 3000,
        loop: true,
        margin: 30,
        nav: true,
        navText: ["<img src='./assets/img/left-arrow.svg'>","<img src='./assets/img/right-arrow.svg'>"],
        responsive: {
            0: {
                items: 1
            },
            480: {
                items: 2
            },
            992: {
                items: 3
            },
            1100: {
                items: 4
            },
            1200: {
                items: 5
            }
        }
    })

    $(document).on('click', ".category-item", function () {
        $('.category-item').not(this).removeClass('active');
        $(this).addClass("active");
    })

    db.ref("/book-type").on("value", function (snap) {
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
        $("#categoryAppend").html(arr.map(item => {
            if (item.category === localStorage.getItem("category")) {
                return `<span class="category-item active" value="${item.category}">${item.category}</span>`
            } else {
                return `<span class="category-item" value="${item.category}">${item.category}</span>`
            }
        }))
    }


    function getBooks() {
        db.ref("/books").on("value", function (snap) {
            let bookObj = snap.val()
            let bookArr = Object.entries(bookObj).reverse();
            let bookObjArr = bookArr.map(item => {
                return {
                    id: item[0],
                    ...item[1]
                }
            })

            let localCat = localStorage.getItem("category");

            renderCatPage(bookObjArr, localCat);
            renderBestseller(bookObjArr);
            renderNewBooks(bookObjArr);
        })
    }

    getBooks();

    function showBooks(item, tagName) {
        $(".loadingSpinner").fadeOut();
        let bookName = item.bookName.substring(0, 12);
        let authorName = item.authorName.substring(0, 15);
        let image = '';
        let cardNew = ''
        item.image ? image = item.image : image = "https://www.iconattitude.com/icons/open_icon_library/oxygen-style/png/256/x-office-address-book.png";
        item.isNew === true ? cardNew = '<span class="card-new">NEW</span>' : false;
        let div = $("<div>").addClass("card position-relative").html(`
                ${cardNew}
              <img class="card-img-top d-block"
                src="${image}"
                alt="">
             <div class="card-body px-0 text-center">
                 <h6 class="card-book-name">${bookName}</h6>
              <p class="card-author-name">${authorName}</p>
            <a href="./product.html" data-value="${item.id}" class="btn btn-block product-link card-btn">Read more</a>
            </div>`);

        $(tagName).trigger('add.owl.carousel', div)
    }

    function renderBestseller(arr) {
        for (let item of arr) {
            if (item.category === 'bestseller') {
                showBooks(item, '#bestsellerBooks');
            }
        }
    }

    function renderNewBooks(arr) {
        for (let item of arr) {
            if (item.isNew === true) {
                showBooks(item, '#newReleases');
            }
        }
    }

    $(document).on("click", ".category-item", function () {
        $(".loadingSpinner").fadeIn();
        localStorage.setItem("category", $(this).text());
        getBooks();
    })

    function renderCatPage(arr, localCat) {
        for (let item of arr) {
            if (localCat) {
                if (item.category === localCat) {
                    var length = $('.all-book-carousel .owl-item').length;
                    for (var i = 0; i < length; i++) {
                        $(".all-book-carousel").trigger('remove.owl.carousel', [i])
                            .trigger('refresh.owl.carousel');
                    }
                    setTimeout(() => {
                        showBooks(item, '#allBookList');
                    }, 1000)
                } else if (localCat === 'all') {
                    $("#allCategory").addClass('active');
                    showBooks(item, '#allBookList');
                } 
            } else {
                $("#allCategory").addClass('active');
                showBooks(item, '#allBookList');
            }
        }
    }

    $(document).on("click", ".product-link", function () {
        localStorage.setItem("bookId", $(this).data("value"))
    })
});