$(document).on('click', '#btn-sent-contactPG', () => {
	if (!$("[data-input='name']").val() || !$("#phone").val()) {
		swal({
			icon: 'error',
			title: 'Error...',
			text: "Fields can't be empty!",
		})
	}
	else {
		db.ref('/contactUs').push().set({
			fullName: $("[data-input='name']").val(),
			email: $("[data-input='email']").val(),
			address: $("[data-input='address']").val(),
			phone: $("#phone").val(),
		})

		$("[data-input='name']").val(null)
		$("[data-input='email']").val(null)
		$("[data-input='address']").val(null)
		$("#phone").val(null)

		return swal({
			icon: 'success',
			title: 'Success...',
			text: "The request was sent successfully",
		})
	}
})

$('#phone').usPhoneFormat({
	format: '(xxx) xxx-xxxx',
});

var countryData = window.intlTelInputGlobals.getCountryData(),
	input = document.querySelector("#phone");

var iti = window.intlTelInput(input, {
	hiddenInput: "full_phone",
	utilsScript: "https://intl-tel-input.com/node_modules/intl-tel-input/build/js/utils.js?1549804213570"
});

for (var i = 0; i < countryData.length; i++) {
	var country = countryData[i];
	var optionNode = document.createElement("option");
	optionNode.value = country.iso2;
	var textNode = document.createTextNode(country.name);
	optionNode.appendChild(textNode);
}