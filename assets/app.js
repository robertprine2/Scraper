$(document).ready(function(){
	
	$(function() {
    	$("form").submit(function() { return false; });
	});

	var app = {
		dataTitle: "",
		comment: ""
	} // end of app object

	$('.commentSubmit').on('click',function(){
			
		app.dataTitle = ($(this).data("title"));
		console.log(app.dataTitle);
		app.comment = ($('.comment[data-title="' + app.dataTitle + '"]').val().trim());
		
		console.log(app.comment);

		$('.comment[data-title="' + app.dataTitle + '"]').val("");

		$('.comments[data-title="' + app.dataTitle + '"]').append(app.comment);
		//post comment
		$.ajax({
			type:'POST',
			url: "/comments",
			data: app.comment
		}).done(function(data) {

			console.log(data);
		
		}); // end of ajax post

		return false;
	
	}); // end of submit register button

}); // end of document.ready function

