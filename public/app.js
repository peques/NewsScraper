//Grab Articles as a JSON
$.getJSON('/articles', function(data){
    //For each one, display info on page
    for (var i = 0; i < data.length; i++) {
        $('#articles').append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
    }
});


//When a "P" tag is clicked...
$(document).on('click', "p", function(){
    //Empty Notes from note section
    $('#notes').empty();
    //Save ID from P tag
    var thisId = $(this).attr('data-id');

    //AJAX call for Article
    $.ajax({
        method: "GET",
        url: "/articles/" + thisId
    })
    //Once call complete, add note info to page
    .done(function(data){
        console.log(data);
        //Title of Article
        $("#notes").append("<h2>" + data.title + "</h2>");
        //Input to enter a new title
        $("#notes").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

      //If there's a Note in the Article
        if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});

//When "Save Note" Button is clicked...
$(document).on("click", "#savenote", function(){
    //Grab ID associated with the Article from the Submit Button
    var thisId = $(this).attr("data-id");

    //Run a POST req to change Note, using info in inputs
    $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
            //Value from Title input
            title: $("#titleinput").val(),
            //Value from Note text area
            body: $("#bodyinput").val()
        }
    })
        //Once done...
        .done(function(data){
            console.log(data);
            //Empty Notes section
            $("#notes").empty();
        });

    //Remove values from input and text fields
    $("#titleinput").val("");
    $("#bodyinput").val("");
});