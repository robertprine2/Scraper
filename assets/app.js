$(document).ready(function(){
	
	var app = {
		comment: []
	} // end of app object

	$('#commentSubmit').on('click',function(){
			
		app.comment.push($('#comment').val().trim());
		console.log(app.comment);
		//post comment
		$.post(app.currentURL + "/", app.comment,
		    function(data){
		    			    	
		    });

		return false;
	
	}); // end of submit register button

}); // end of document.ready function

