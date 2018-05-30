var Client = {};

$(document).ready(function() {
  Client.socket = io('http://127.0.0.1:8081');

  // Demande d'ajout du player dans la 'room' avec un username et un slot
  // Objectif: créer le player dans le serveur node et l'ajouter dans la 'room'
  Client.socket.emit('CLIENT_JOIN_GAME', {
    room: $('#gameData').data('name'),
    username: $('#gameData').data('user'),
    faction: $('#gameData').data('slot')[0] === 's'
      ? 'saint'
      : 'zombie',
    slot: parseInt($('#gameData').data('slot')[1])
  });

  Client.socket.on('SERVER_INIT_GAME', function(data) {
    // Initialise la partie lorsque les données du joueur seront reçu
    initGame(data);

    // Demande au serveur les données concernant les autres joueurs déjà connectés
    // Objectif: Récupérer les autres joueurs déjà dans la game afin de les afficher
    Client.getOtherPlayersData = function() {
      Client.socket.emit('CLIENT_GET_OTHER_PLAYERS');
    }

    // Envoi au serveur la position de 'player'
    // Objectif: mettre à jour les stats du joueur dans le serveur
    Client.updatePlayerPosition = function(x, y) {
      Client.socket.emit('CLIENT_UPDATE_PLAYER_POSITION', {
        x: x,
        y: y
      });
    }

    // Un joueur utilise une potion
    // Objectif: soigner le joueur et lui retirer une potion de son inventaire
    Client.playerUsePotion = function() {
      Client.socket.emit('CLIENT_PLAYER_USE_POTION');
    }

    // Envoi au serveur les stats de 'player'
    // Objectif: mettre à jour les stats du joueur dans le serveur
    Client.updateStats = function(stats) {
      Client.socket.emit('CLIENT_UPDATE_PLAYER_STATS', stats);
    }

    // Envoi au serveur l'expérience de 'player'
    // Objectif: mettre à jour l'exp et le level du joueur dans le serveur
    Client.updateExp = function(exp) {
      Client.socket.emit('CLIENT_UPDATE_PLAYER_EXP', exp);
    }

    // Envoi au serveur l'info qu'une capture de zone est en cours
    // Objectif: informer les autres joueurs
    Client.updatePlayerOnArea = function(area) {
      Client.socket.emit('CLIENT_UPDATE_PLAYER_ON_AREA', area);
    }

    // Envoi au serveur l'info qu'une capture de zone est délaissée
    // Objectif: informer les autres joueurs
    Client.updatePlayerOffArea = function(area) {
      Client.socket.emit('CLIENT_UPDATE_PLAYER_OFF_AREA', area);
    }

    // Envoi au serveur l'info qu'une zone est capturée | ajout de point à la faction
    // Objectif: ajouter des points à une faction lorsque une zone est capturée
    Client.updateFactionPoints = function() {
      Client.socket.emit('CLIENT_UPDATE_AREA_CAPTURED');
    }

    // Envoi une requête au serveur pour acheter un objet dans le shop
    // Objectif: acheter un objet et mettre à jour l'inventaire + golds du joueur
    Client.buyItemFromShop = function(itemName, itemCategory) {
      Client.socket.emit('CLIENT_BUY_ITEM_FROM_SHOP', {
        itemName: itemName,
        itemCategory: itemCategory
      });
    }

    // Envoi une requête au serveur pour vendre son arme
    // Objectif: vendre l'arme du player et lui donner des golds
    Client.sellWeaponFromEquipment = function() {
      Client.socket.emit('CLIENT_SELL_WEAPON_FROM_EQUIPMENT');
    }

    // Envoi une requête au serveur pour vendre son armure
    // Objectif: vendre l'armure du player et lui donner des golds
    Client.sellArmorFromEquipment = function() {
      Client.socket.emit('CLIENT_SELL_ARMOR_FROM_EQUIPMENT');
    }

    // Envoi une requête au serveur avec le nom de l'attaque effectuée
    // Objectif: faire jouer l'animation d'attaque du player chez tous les clients
    Client.playerAttacked = function(attackName) {
      Client.socket.emit('CLIENT_PLAYER_ATTACKED', attackName);
    }

    // Envoi une requête au serveur pour indiquer que le player a infligé des dégâts à un ennemi
    // Objectif: calculer les dégâts infligés et en soustraire de la santé de l'ennemi le résultat
    Client.hitEnemy = function(p1Username, p2Username) {
      Client.socket.emit('CLIENT_PLAYER_HIT_ENEMY', {
        p1Username: p1Username,
        p2Username: p2Username
      });
    }

    // Envoi une requête au serveur pour indiquer qu'un joueur doit respawn
    // Objectif: Renvoyer le joueur dans sa safezone et vivant
    Client.revivePlayer = function(username) {
      Client.socket.emit('CLIENT_PLAYER_RESPAWN', {username: username});
    }

    // Chat
    Client.socket.on('SERVER_CHAT_MESSAGE', function(data) {
      if (data.receivers === 'all' || (data.receivers === 'team' && data.faction === player.faction.name)) {
        var senderFaction = data.faction === player.faction.name ? 'ally' : 'enemy';
        senderFaction = data.user === player.user.username ? 'yourself' : senderFaction;

        var username = $('<span>').addClass('msg-sender ' + senderFaction).text(data.user + ': ');
        var message = $('<span>').addClass('text-' + data.color).text(data.message);
        var fullMsg = $('<li>').addClass('list-group-item username').append(username).append(message);
        $('#messages').append(fullMsg);
        $('#chat').scrollTop($('#messages').height());
      }
    });

    $('.msg-btn').on('click', function(evt) {
      var data = {
        user: player.user.username,
        faction: player.faction.name,
        receivers: $(evt.target).data('receivers'),
        message: $(evt.target).text(),
        color: $(evt.target).data('color')
      };
      Client.socket.emit('CLIENT_CHAT_MESSAGE', data);

      return false;
    });

    // Met à jour la liste des joueurs dans l'en-tête
    Client.socket.on('SERVER_UPDATE_HEADER_PLAYERS', function(players) {
      for (var playerName in players) {
        if (players.hasOwnProperty(playerName)) {
          var factionSlot = '.' + players[playerName].faction + '.slot' + players[playerName].slot;
          $(factionSlot + '.username').text(players[playerName].username);
          $(factionSlot + '.level').text(players[playerName].level);
        }
      }
    });

    // Réponse du serveur: contient toutes les données de 'player'
    // Objectif: initialise les stats de 'player'
    Client.socket.on('SERVER_UPDATE_PLAYER_DATA', function(data) {
      Game.setPlayerData(data);
    });

    // Réponse du serveur: contient le nombre de potion restante du 'player'
    // Objectif: mettre à jour les potions du joueur en local
    Client.socket.on('SERVER_UPDATE_PLAYER_POTION', function(potionCount) {
      Game.updatePlayerPotion(potionCount);
    });

    // Réponse du serveur: contient le nombre de golds du 'player'
    // Objectif: mettre à jour les golds du joueur en local
    Client.socket.on('SERVER_UPDATE_PLAYER_GOLD', function(goldCount) {
      Game.updatePlayerGold(goldCount);
    });

    // Réponse du serveur: contient le nombre de golds d'un joueur
    // Objectif: mettre à jour les golds d'un joueur en local
    Client.socket.on('SERVER_UPDATE_OTHER_PLAYER_GOLD', function(data) {
      if (data.username === player.user.username) {
        Game.updatePlayerGold(data.golds);
      } else {
        Game.updateOtherPlayerGold(data.username, data.golds);
      }
    });

    // Réponse du serveur: contient toutes les données d'un autre joueur
    // Objectif: initialise un nouveau joueur qui vient de se connecter
    Client.socket.on('SERVER_NEW_PLAYER', function(data) {
      Game.addNewPlayer(data);
    });

    // Réponse du serveur: contient toutes les données des autres joueurs déjà présents
    // Objectif: Créer et affiche les sprites des joueurs déjà dans la partie
    Client.socket.on('SERVER_OTHER_PLAYERS_LIST', function(data) {
      Object.keys(data).forEach(function(player) {
        Game.addNewPlayer(data[player]);
      });
    });

    // Réponse du serveur: contient la position d'un autre joueur et son username
    // Objectif: Mettre à jour la position d'un joueur d'après son username
    Client.socket.on('SERVER_UPDATE_OTHER_PLAYER_POSITION', function(data) {
      Game.updateOtherPlayersPos(data.username, data.posX, data.posY);
    });

    // Réponse du serveur: contient l'inventaire d'un autre joueur et son username
    // Objectif: Mettre à jour l'inventaire d'un joueur d'après son username
    Client.socket.on('SERVER_UPDATE_OTHER_PLAYER_INVENTORY', function(data) {
      Game.updateOtherPlayerInventory(data.username, data.inventory);
    });

    // Réponse du serveur: contient l'inventaire du player
    // Objectif: Mettre à jour l'inventaire du player
    Client.socket.on('SERVER_UPDATE_PLAYER_INVENTORY', function(data) {
      Game.updatePlayerInventory(data.inventory);
    });

    // Réponse du serveur: contient les stats d'un autre joueur et son username
    // Objectif: Mettre à jour les stats d'un joueur d'après son username
    Client.socket.on('SERVER_UPDATE_OTHER_PLAYER_STATS', function(data) {
      if (data.username === player.user.username) {
        Game.updatePlayerStats(data.stats);
      } else {
        Game.updateOtherPlayerStats(data.username, data.stats);
      }
    });

    // Réponse du serveur: contient le level, l'exp d'un autre joueur et son username
    // Objectif: Mettre à jour le level et l'exp d'un joueur d'après son username
    Client.socket.on('SERVER_UPDATE_OTHER_PLAYER_EXP', function(data) {
      if (data.username === player.user.username) {
        Game.updatePlayerExp(data.level, data.exp, data.toNextExp);
      }
      else {
        Game.updateOtherPlayerExp(data.username, data.level, data.exp, data.toNextExp);
      }
    });

    // Réponse du serveur: contient username du player et la zone en cours de capture
    // Objectif: indiquer qu'une zone est en cours de capture
    Client.socket.on('SERVER_UPDATE_OTHER_PLAYER_ON_AREA', function(data) {
      Game.updateOtherPlayerOnArea(data.faction, data.points, data.area);
    });

    // Réponse du serveur: contient username du player et la zone de capture délaissé
    // Objectif: indiquer qu'une capture de zone a été stoppé (non capturé)
    Client.socket.on('SERVER_UPDATE_OTHER_PLAYER_OFF_AREA', function(data) {
      Game.updateOtherPlayerOffArea(data.faction, data.points, data.area);
    });

    // Réponse du serveur: contient username du player et la zone capturée
    // Objectif: indiquer que la zone a été capturée
    Client.socket.on('SERVER_UPDATE_AREA_CAPTURED', function(data) {
      Game.updateOtherPlayerAreaCaptured(data.faction, data.area, data.areaNumber);
    });

    // Réponse du serveur: contient score des 2 factions
    // Objectif: augmenter le score des Saints
    Client.socket.on('SERVER_UPDATE_SCORE_SAINT', function(data) {
      Game.updateFactionsScore(data.faction, data.score);
    });

    // Réponse du serveur: contient score des 2 factions
    // Objectif: augmenter le score des Zombies
    Client.socket.on('SERVER_UPDATE_SCORE_ZOMBIE', function(data) {
      Game.updateFactionsScore(data.faction, data.score);
    });

    // Réponse du serveur: contient la faction gagnante
    // Objectif : afficher un message de fin de partie
    Client.socket.on('SERVER_GAME_ENDING', function(data) {
      Game.updateGameEnding(data.win);
    });

    // Réponse du serveur: contient le username et l'action d'un joueur
    // Objectif: faire jouer l'animation d'attaque d'un autre joueur
    Client.socket.on('SERVER_OTHER_PLAYER_ATTACKED', function(data) {
      Game.playOtherPlayerAttack(data.username, data.attackName);
    });

    // Réponse du serveur: contient le username du joueur ayant perdu toute sa santé
    // Objectif: Mettre à jour l'état 'isAlive' du joueur n'ayant plus de santé
    Client.socket.on('SERVER_PLAYER_DEAD', function(data) {
      if (data.username === player.user.username) {
        Game.playerDead();
        Game.updatePlayerHeadText();
      } else {
        Game.otherPlayerDead(data.username);
        Game.updateOtherPlayerHeadText(data.username);
      }
    });

    // Réponse du serveur: contient le niveau, l'exp et les golds du player
    // Objectif: Mettre à jour les données du joueur après un kill
    Client.socket.on('SERVER_UPDATE_PLAYER_AFTER_KILL', function(data) {
      Game.updatePlayerGold(data.gold);
      Game.updatePlayerExp(data.level, data.exp, data.toNextExp);
    });

    // Réponse du serveur: contient le username du joueur ayant perdu toute sa santé
    // Objectif: Mettre à jour l'état 'isAlive' du joueur n'ayant plus de santé
    Client.socket.on('SERVER_UPDATE_OTHER_PLAYER_KILLS_DEATHS', function(data) {
      if (data.username === player.user.username) {
        Game.updatePlayerKillsDeaths(data.kills, data.deaths);
      } else {
        Game.updateOtherPlayerKillsDeaths(data.username, data.kills, data.deaths);
      }
    });

    // Réponse du serveur: contient le username et les hp du joueur devant respawn
    // Objectif: Faire respawn le joueur
    Client.socket.on('SERVER_PLAYER_RESPAWN', function(data) {
      if (data.username === player.user.username) {
        Game.respawnPlayer(data.hp);
      } else {
        Game.respawnOtherPlayer(data.username, data.hp);
      }
    });

    // Réponse du serveur: contient l'état de l'inventaire du player
    // Objectif: Mettre à jour l'inventaire du joueur après l'achat d'un item
    Client.socket.on('SERVER_SEND_ITEM_FROM_SHOP', function(data) {
      switch (data.code) {
      case 1:
        Game.updatePlayerInventory(data.inventory);
        break;
      case -1:
        console.log('Purchase failed with: Unknown error | code = ' + data.code);
        break;
      case -2:
        console.log('Purchase failed with: Consumable not found | code = ' + data.code);
        break;
      case -3:
        console.log('Purchase failed with: Category unknown | code = ' + data.code);
        break;
      case -10:
        console.log('Purchase failed with: Player already have a weapon | code = ' + data.code);
        break;
      case -20:
        console.log('Purchase failed with: Player already have an armor | code = ' + data.code);
        break;
      case -21:
        console.log('Purchase failed with: Player cannot buy more potions | code = ' + data.code);
        break;
      case -303:
        console.log('Purchase failed with: Not enough gold | code = ' + data.code);
        break;
      default:
      }
    });

    Client.socket.on('SERVER_INSERT_PLAYERS', function(gameId) {
      Client.socket.emit('CLIENT_INSERT_PLAYERS', gameId);
    });

    Client.socket.on('SERVER_UPDATE_GAME_DURATION', function(duration) {
      if (duration.hours < 10) {
        var hours = '0'+ duration.hours;
      }
      else {
        var hours = duration.hours.toString()
      }
      if (duration.minutes < 10) {
        var minutes = '0'+ duration.minutes;
      }
      else {
        var minutes = duration.minutes.toString()
      }
      if (duration.seconds < 10) {
        var seconds = '0'+ duration.seconds;
      }
      else {
        var seconds = duration.seconds.toString()
      }
      var formattedDuration = hours +':'+ minutes +':'+ seconds;
      $('#time-elapsed').text(formattedDuration);
    })

    // Message du serveur: contient le username du joueur qui vient de se déconnecter
    // Objectif: Supprimer de Game.playerMap le joueur ainsi que son sprite
    Client.socket.on('SERVER_PLAYER_DISCONNECTED', function(data) {
      Game.removePlayer(data.username);
    });
  });
});
