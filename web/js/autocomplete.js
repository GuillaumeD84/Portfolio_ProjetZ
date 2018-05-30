var autocomplete = {
  url : '/user/search',
  init: function() {
    //evt sur btn
    $('.search-player').on('keyup', autocomplete.search);
  },
  search: function(evt) {
    var input = $(evt.target);
    var string = input.val();
    // donnée en JSON
    var data = {
      string: string
    };
    autocomplete.findUsers(data, input);
  },
  findUsers: function(string) {
    var li = '';
    //console.log(string);
    $.ajax(autocomplete.url, {
      method: 'POST',
      data: string
    }).done(function(users) {
      $.each(users, function(key, user){
        $.each(user, function(key, username){
          //console.log(key);
          li += '<li>'+'<a href="/user/'+username+'">'+username+'</a></li>';
        });
      });
      if(li.length !== 0) {
        $('.search-user-list').removeClass('d-none');
        $('.search-user-list').html(li);
      } else {
        $('.search-user-list').addClass('d-none');
      }
    });
  },
};

$(autocomplete.init);
