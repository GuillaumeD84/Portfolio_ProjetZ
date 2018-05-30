var editEmail = {
  init: function() {
   $('#editEmail').on('click', editEmail.editForm)
   $('#updateEmail').on('submit', editEmail.update)
  },
  editForm: function(evt) {
    var div = $('#editEmail');
    var email = $.trim(div.text());

    $('#updateEmail').children().first().val(email);

    div.hide();
    $('#updateEmail').show();

  },
  update: function(evt) {
    evt.preventDefault();

    var url = $('#updateEmail').attr('action');
    var userId = $('#email').data('id');
    var email = $('#updateEmail').children().first().val();

    // ici, ajax pour la modif en bdd
    $.ajax(url, {
      method: 'POST',
      data: {
        id: userId,
        email: email,
      },
      dataType: 'json',
    }).done(function(response) {
      $("#email").text(response);
    });

    $('#updateEmail').hide();
    $('#editEmail').show();
  }
};

$(editEmail.init);
