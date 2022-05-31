db.ref('about-store').on("value", function (snap) {
    $(".loadingSpinner").fadeOut();
    $(".about-title").text(snap.val()["about-title"]);
    $(".about-description").text(snap.val()["about-description"]);
    $(".about-img img").attr("src", snap.val()["about-url"]);
})