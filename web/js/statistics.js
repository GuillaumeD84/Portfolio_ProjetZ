var app = {
  // Liste des tris possible avec le label correspondant
  choices: {level_desc: 'Highest level', victories_desc: 'Victories', ennemies_killed_desc: 'Enemies killed', player_revived_desc: 'Player revived', game_played_desc: 'Game played', areas_captured_desc: 'Areas captured'},
  init: function() {
    $('.ladder-choice').on('click', app.displayHallOfFame);
  },
  displayHallOfFame: function(evt) {
    evt.preventDefault();
    // On récupère le choix du joueur pour le tri
    var choice = evt.target.dataset.choice;

    // Requête AJAX (voir DefaultController, route : /statistics)
    $.ajax({
      url: statisticsRoute,
      method: 'GET',
      data: {
        choice: choice
      }
    })
      .done(function(result) {
        // On récupère le template du tbody
        var template = app.getTbodyTemplate(result.data);

        // On remplace le body actuel par le nouveau
        $('#ladder-tbody').remove();
        template.insertAfter($('#ladder-thead'));

        // On modifie le label du bouton dropdown
        $('#ladder-choice-btn').text(app.choices[choice]);
      });
  },
  // Génère un tbody en fonction des données reçu dans la requête AJAX
  getTbodyTemplate: function(data) {
    var body = $('<tbody>');
    body.attr('id', 'ladder-tbody');

    for (var i = 0; i < data.length; i++) {
      var tr = $('<tr>');

      var th = $('<th scope="row">');
      var a = $('<a href="' + userProfileRoute.slice(0, -1) + data[i].id + '">');
      a.text(data[i].username.substring(0, 1).toUpperCase() + data[i].username.substring(1));
      th.append(a);

      var td = $('<td>');
      td.text(data[i].value);

      tr.append(th);
      tr.append(td);

      body.append(tr);
    }

    return body;
  }
};

$(app.init);
