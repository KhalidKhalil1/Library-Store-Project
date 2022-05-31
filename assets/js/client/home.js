db.ref("/book-type").on("value", function (snap) {
    let categoryObj = snap.val()
    let categoryArr = Object.entries(categoryObj).reverse().slice(0, 9);
    let idObjectArray = categoryArr.map(item => {
        return {
            id: item[0],
            ...item[1]
        }
    })

    renderCategoryPage(idObjectArray);
})

function renderCategoryPage(arr) {
    $("#homeCatalog").html(arr.map((item) => {
        return `<a href="./catalog.html" class="catalog-box col-md-3  d-flex justify-content-center align-items-center"> ${item.category}</a>`
    }))
}

// $(document).on("click", ".catalog-box", function () {
//     localStorage.setItem("category", $(this).text());
// })