var app = {
  url : ajaxURL,
  init: function() {
    //evt sur btn
    $('.btn-isactive').on('click', app.isActive);
  },
  isActive: function(evt) {
    var btn = $(evt.target);
    var id = btn.attr('data-id');
    // donnée en JSON
    var data = {
      id: id
    };
    app.updateisActive(data, btn);
  },
  updateisActive: function(id, evt) {
    $.ajax(app.url, {
      method: 'POST',
      data: id
    }).done(function(message) {
      $(evt).text(message.class);
      $(evt).toggleClass('btn-success');
      $(evt).toggleClass('btn-danger');
    });
  },
};

$(app.init);
