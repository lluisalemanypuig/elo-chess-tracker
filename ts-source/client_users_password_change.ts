async function submit_button_clicked() {
	let old_password_box = document.getElementById("old_password_box") as HTMLInputElement;
	let new_password_box = document.getElementById("new_password_box") as HTMLInputElement;
	let repeat_password_box = document.getElementById("repeat_password_box") as HTMLInputElement;

	if (new_password_box.value != repeat_password_box.value) {
		alert("The passwords must coincide");
		return;
	}

	const response = await fetch(
		"/users_password_change",
		{
			method: 'POST',
			body : JSON.stringify({'old' : old_password_box.value, 'new' : new_password_box.value}),
			headers: { 'Content-type': 'application/json; charset=UTF-8' }
		}
	);
	const data = await response.json();

	if (data.r == '0') {
		alert(data.reason);
		return;
	}

	// return to login page
	window.location.href = "/";
}

window.onload = function () {
	let submit_button = document.getElementById("submit_button") as HTMLButtonElement;
	submit_button.onclick = submit_button_clicked;
}