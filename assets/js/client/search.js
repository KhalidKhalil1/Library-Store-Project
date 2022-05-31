let resultArr = [];
let count = 0;

if (localStorage.getItem("search")) {
    let localSearch = localStorage.getItem("search");
    db.ref("/books").on("value", function (snap) {
        let bookObj = snap.val()
        let bookArr = Object.entries(bookObj).reverse();
        let bookObjArr = bookArr.map(item => {
            return {
                id: item[0],
                ...item[1]
            }
        })
        renderBooks(bookObjArr, localSearch);
        if (resultArr.length == 0) {
            $(".slider-section").addClass('d-none');
            localStorage.removeItem("search");
            return swal({
                icon: 'error',
                title: 'Error...',
                text: 'No results found for your search',
            })
        }
        resultArr = [];
        count = 0;
    })

}

$("#searchBtn").on("click", function (e) {
    e.preventDefault();
    let search = $("#searchInput").val().trim();
    $("#searchInput").val("")
    if (search === "") {
        return swal({
            icon: 'warning',
            title: 'Warning...',
            text: 'Please, enter the search text',
        })
    } else {
        db.ref("/books").on("value", function (snap) {
            let bookObj = snap.val()
            let bookArr = Object.entries(bookObj).reverse();
            let bookObjArr = bookArr.map(item => {
                return {
                    id: item[0],
                    ...item[1]
                }
            })

            renderBooks(bookObjArr, search);

            if (resultArr.length == 0) {
                $(".slider-section").addClass('d-none');
                localStorage.removeItem("search");
                return swal({
                    icon: 'error',
                    title: 'Error...',
                    text: 'No results found for your search',
                })
            }
            resultArr = [];
            count = 0;
        })
    }
})

function renderBooks(arr, search) {
    $("#searchSlider").html(arr.map((item) => {
        if (item.bookName.toLowerCase().indexOf(search.toLowerCase()) !== -1) {
            localStorage.setItem("search", search)
            $(".slider-section").removeClass('d-none');
            count++;
            resultArr.push(item);
            let image = '';
            let cardNew = ''
            item.image ? image = item.image : image = "https://www.iconattitude.com/icons/open_icon_library/oxygen-style/png/256/x-office-address-book.png";
            item.isNew === true ? cardNew = '<span class="card-new">NEW</span>' : false;

            let result = `<div class="carousel-item ${count == 1 ? 'active' : ''}">
            <div class="row">
                    <div class="col-lg-4 col-md-4 col-sm-12 col-12 img-section">
                    ${cardNew}
                        <img class="img-thumbnail" src="${image}"
                            alt="">
                    </div>
                    <div class="col-lg-8 col-md-8 col-sm-12 col-12">
                        <h2 class="book-name">${item.bookName.substring(0, 40)}</h2>
                        <p class="author-name">${item.authorName}</p>
                        <p class="book-description">${item.description.substring(0, 250)}</p>
                    </div>
                </div>
            </div>`

            if (resultArr.length === 1) {
                $(".carousel-control-prev").addClass('d-none')
                $(".carousel-control-next").addClass('d-none')
                return result;
            } else {
                $(".carousel-control-prev").removeClass('d-none')
                $(".carousel-control-next").removeClass('d-none')
                return result;
            }
        }
    }))
}