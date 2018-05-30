var searchGame = {
  init: function() {
    //evt sur btn
    $('.search-game').on('keyup', searchGame.showGame);
  },
  showGame: function(evt) {
    var string = $(evt.target).val();

    $('.nameGame').each(function(){
      var result = $(this).text().toLowerCase().match(string.toLowerCase());

      if (result === null) {
        $(this).parent().addClass('hide');
      } else {
        $(this).parent().removeClass('hide');
      }
    });
  },
};

$(searchGame.init);
