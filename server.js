// Getting server, socket and redis
var app = require('express')();
var http = require('http').Server(app);
var server = require('http').createServer();
var io = require('socket.io').listen(server);
var redis = require('socket.io-redis');

///////////////////////////////////////////////////////////////////////////////
// Connexion à la bdd via mysql
var mysql = require('mysql');

var db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'projetz'
});

// On se connecte à la bdd et on vérifie que la connexion est établie
db.connect(function(err) {
  if (err)
    console.log(err);
});

// On récupère les stats de base des factions stockées en bdd
var factionsBaseStats = {};
db.query('SELECT * FROM faction').on('result', function(result) {
  var faction = (result.name).toLowerCase();
  factionsBaseStats[faction] = {};

  Object.keys(result).forEach(function(column, index) {
    factionsBaseStats[faction][column] = result[column];
  });
}).on('end', function() {
  console.log('\n////////////////////////////////////////////////////////////');
  console.log('Stats de base des factions:');
  console.log(factionsBaseStats);
  console.log('////////////////////////////////////////////////////////////');
});
///////////////////////////////////////////////////////////////////////////////

// Adapter SocketIO - Redis
io.adapter(redis({host: '127.0.0.1', port: 6379}));

// Aperçu des parties en cours avec dans chacune la liste des joueurs
var games = {};
var disconnectedPlayers = {};

io.on('connection', function(socket) {
  // Lorsqu'un joueur rejoint une partie
  socket.on('CLIENT_JOIN_GAME', function(data) {
    socket.join(data.room);

    // S'il s'agit du premier joueur entrant dans la partie
    // On initialise la partie dans la liste 'games'
    if (games[data.room] === undefined) {
      var map = createMap();
      games[data.room] = {
        name: data.room,
        map: map,
        saintsPoint: 0,
        zombiesPoint: 0,
        scoreSaintInterval: '',
        scoreZombieInterval: '',
        areas: {
          area1: {
            name: 'ferme',
            capturedBy: 'none',
            captureInProgressBy: 'none',
            progress: 0,
            progressInterval: '',
            releaseInterval: '',
            playersOnArea: [],
            saintsCount: 0,
            zombiesCount: 0
          },
          area2: {
            name: 'bois',
            capturedBy: 'none',
            captureInProgressBy: 'none',
            progress: 0,
            progressInterval: '',
            releaseInterval: '',
            playersOnArea: [],
            saintsCount: 0,
            zombiesCount: 0
          },
          area3: {
            name: 'tour',
            capturedBy: 'none',
            captureInProgressBy: 'none',
            progress: 0,
            progressInterval: '',
            releaseInterval: '',
            playersOnArea: [],
            saintsCount: 0,
            zombiesCount: 0
          },
          area4: {
            name: 'moulin',
            capturedBy: 'none',
            captureInProgressBy: 'none',
            progress: 0,
            progressInterval: '',
            releaseInterval: '',
            playersOnArea: [],
            saintsCount: 0,
            zombiesCount: 0
          }
        },
        sprites: {
          saints: ['saint_man_1', 'saint_man_2', 'saint_man_3', 'saint_man_4', 'saint_woman_1', 'saint_woman_2', 'saint_woman_3', 'saint_woman_4'],
          zombies: ['zombie_man_1', 'zombie_man_2', 'zombie_man_3', 'zombie_man_4', 'zombie_woman_1', 'zombie_woman_2', 'zombie_woman_3', 'zombie_woman_4']
        },
        gameOver: false,
        players: {},
        gameDurationInterval: '',
        gameDuration: {
          hours: 0,
          minutes: 0,
          seconds: 0
        }
      };
      games[data.room].gameDurationInterval = setInterval(function() {
        games[data.room].gameDuration.seconds++;
        if (games[data.room].gameDuration.seconds === 60) {
          games[data.room].gameDuration.minutes++;
          games[data.room].gameDuration.seconds = 0;
          if (games[data.room].gameDuration.minutes === 60) {
            games[data.room].gameDuration.hours++;
            games[data.room].gameDuration.minutes = 0;
          }
        }
        io.in(games[data.room].name).emit('SERVER_UPDATE_GAME_DURATION', games[data.room].gameDuration);
      }, 1000);
    }

    if (games[data.room].players[data.username] === undefined) {
      // On initialise le nouveau joueur
      socket.player = {};
      initializeUser(data.username, data.room, data.faction, data.slot);
    } else {
      clearTimeout(disconnectedPlayers[data.username]);

      socket.player = games[data.room].players[data.username];
      socket.broadcast.to(socket.player.game.name).emit('SERVER_NEW_PLAYER', socket.player);
      socket.emit('SERVER_INIT_GAME', {
        player: socket.player,
        shops: shops,
        map: games[data.room].map
      });

      console.log('\n////////////////////////////////////////////////////////////');
      console.log(data.username + ' reconnected');
      console.log('////////////////////////////////////////////////////////////');
    }
  });

  // A la réception d'un message du chat
  socket.on('CLIENT_CHAT_MESSAGE', function(data) {
    io.emit('SERVER_CHAT_MESSAGE', data);
  });

  // Requête du client: le client demande la liste des autres joueurs déjà connectés
  // Objectif: Créer les sprites des autres joueurs déjà dans la partie
  socket.on('CLIENT_GET_OTHER_PLAYERS', function() {
    // On récupère une liste des players dans la game, hormis le user passé en paramètre
    var players = getOtherPlayersList(socket.player.user.username, socket.player.game.name);

    socket.emit('SERVER_OTHER_PLAYERS_LIST', players);
  });

  // MàJ du client: le client envoi sa nouvelle position
  // Objectif: Mettre à jour sa position dans le serveur et l'envoyer aux autres joueurs
  socket.on('CLIENT_UPDATE_PLAYER_POSITION', function(data) {
    //////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////
    /////SUPPRIMER LE IF UNDEFINED DANS LA VERSION FINALE/////
    //////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////
    if (socket.player !== undefined) {
      socket.player.data.pos.x = data.x;
      socket.player.data.pos.y = data.y;

      socket.broadcast.to(socket.player.game.name).emit('SERVER_UPDATE_OTHER_PLAYER_POSITION', {
        username: socket.player.user.username,
        posX: socket.player.data.pos.x,
        posY: socket.player.data.pos.y
      });
    }
  });

  // // MàJ du client: le client envoi le contenu de son inventaire
  // // Objectif: Mettre à jour son inventaire dans le serveur et l'envoyer aux autres joueurs
  // socket.on('CLIENT_UPDATE_PLAYER_INVENTORY', function(inventory) {
  //   socket.player.data.inventory.gold = inventory.gold;
  //   socket.player.data.inventory.potion = inventory.potion;
  //   socket.player.data.inventory.equipment = inventory.equipment;
  //
  //   socket.broadcast.to(socket.player.game.name).emit('SERVER_UPDATE_OTHER_PLAYER_INVENTORY', {
  //     username: socket.player.user.username,
  //     inventory: socket.player.data.inventory
  //   });
  // });

  // // MàJ du client: le client envoi ses statistiques
  // // Objectif: Mettre à jour ses statistiques dans le serveur et l'envoyer aux autres joueurs
  // socket.on('CLIENT_UPDATE_PLAYER_STATS', function(stats) {
  //   socket.player.data.stats = stats;
  //
  //   socket.broadcast.to(socket.player.game.name).emit('SERVER_UPDATE_OTHER_PLAYER_STATS', {
  //     username: socket.player.user.username,
  //     stats: socket.player.data.stats
  //   });
  // });

  // // MàJ du client: le client envoi son expérience
  // // Objectif: Mettre à jour son expérience dans le serveur et l'envoyer aux autres joueurs
  // socket.on('CLIENT_UPDATE_PLAYER_EXP', function(exp) {
  //   socket.player.data.exp = exp;
  //   // On calcul son niveau d'après son expérience
  //   socket.player.data.level = 1;
  //
  //   socket.broadcast.to(socket.player.game.name).emit('SERVER_UPDATE_OTHER_PLAYER_EXP', {
  //     username: socket.player.user.username,
  //     level: socket.player.data.level,
  //     exp: socket.player.data.exp
  //   });
  // });

  // MàJ du client: le client envoi un player sur une area
  // Objectif: informer les autres joueurs qu'une capture de zone est en cours
  socket.on('CLIENT_UPDATE_PLAYER_ON_AREA', function(areaNumber) {
    if (games[socket.player.game.name].gameOver === false) {
      //console.log(areaNumber);
      var area = games[socket.player.game.name].areas['area' + areaNumber];

      // on ajoute le nom du player dans la game en cours dans l'area en cours de capture
      area.playersOnArea.push([ socket.player.user.username, socket.player.faction.name ]);

      // affiche le nom du (des) player(s) se trouvant sur la zone
      //console.log(games[socket.player.game.name].areas['area' + areaNumber].playersOnArea);

      var listNbFactionOnArea = [];
      for (var player in area.playersOnArea) {
        listNbFactionOnArea.push(area.playersOnArea[player][1]);
      }

      // Permet de compter combien de Saints ou de Zombies présent sur une zone
      var counts = count(listNbFactionOnArea);

      // On vérifie si il y a un zombie et un saint en même temps sur l'area
      // On initialise des variables de test
      // Zombies ET Saints présents sur le zone
      var allFactions = false;
      // Minimum 2 joueurs de mon équipe sur la zone
      var myFactionRepresent = false;

      ((counts['zombie'] > 0) && (counts['saint'] > 0))? allFactions = true : allFactions = false;
      (counts[socket.player.faction.name] > 1)? myFactionRepresent = true : myFactionRepresent = false;

      if (allFactions) {
        clearInterval(area.progressInterval);
      } else if (myFactionRepresent) {
        // stay cool area in capture by le copain
        // a voir pour ajouter un multiplicateur de point car on est bcp sur zone maintenant...
      } else {
        clearInterval(area.releaseInterval);
        captureInProgress(area, areaNumber, socket.player.faction.name, socket.player.user.username);
      }
    }
  });

  // MàJ du client: le client envoi un player qui n'est plus sur une area
  // Objectif: informer les autres joueurs qu'une capture de zone est stoppée
  socket.on('CLIENT_UPDATE_PLAYER_OFF_AREA', function(areaNumber) {
    if (games[socket.player.game.name].gameOver === false) {
      var area = games[socket.player.game.name].areas['area' + areaNumber];

      // On retire le nom du player de la zone en cours de capture
      for (var i = 0; i < area.playersOnArea.length; i++) {
        (
          (socket.player.user.username === area.playersOnArea[i][0])
          &&
          (socket.player.faction.name === area.playersOnArea[i][1])
        )? area.playersOnArea.splice(i, 1) : '';
      }

      // On affiche les joueurs qui sont encore présent sur cette zone
      //console.log(games[socket.player.game.name].areas['area' + areaNumber].playersOnArea);

      var listNbFactionOnArea = [];
      for (var player in area.playersOnArea) {
        listNbFactionOnArea.push(area.playersOnArea[player][1]);
      }

      // Permet de compter combien de Saints ou de Zombies présent sur une zone
      var counts = count(listNbFactionOnArea);

      // On initialise des variables de test
      // Zombies ET Saints présents sur le zone
      var allFactions = false;
      // Minimum 2 joueurs de mon équipe sur la zone
      var myFactionRepresent = false;
      // Minimum 1 joueur adversaire encore la
      var adverseFactionRepresent = false;
      // Faction adverse
      var adverseFactionName = '';

      ((counts['zombie'] > 0) && (counts['saint'] > 0))? allFactions = true : allFactions = false;
      (counts[socket.player.faction.name] > 1)? myFactionRepresent = true : myFactionRepresent = false;
      if (socket.player.faction.name === 'saint') {
        adverseFactionName = 'zombie';
        (counts['zombie'] > 0)? adverseFactionRepresent = true : adverseFactionRepresent = false;
      } else {
        adverseFactionName = 'saint';
        (counts['saint'] > 0)? adverseFactionRepresent = true : adverseFactionRepresent = false;
      }

      if (allFactions) {
        clearInterval(area.progressInterval);
      } else if (adverseFactionRepresent && !myFactionRepresent) {
        (area.captureInProgressBy !== socket.player.faction.name)? '' : area.progress = 0;
        captureInProgress(area, areaNumber, adverseFactionName);
      } else if (myFactionRepresent) {
        (area.captureInProgressBy === socket.player.faction.name)? '' : area.progress = 0;
        clearInterval(area.releaseInterval);
        captureInProgress(area, areaNumber, socket.player.faction.name);
      } else {
        clearInterval(area.progressInterval);
        captureRelease(area);
      }
    }
  });

  // MàJ du client: le client indique qu'une zone a été capturée
  // Objectif: informer les autres joueurs qu'une zone est capturée
  socket.on('CLIENT_UPDATE_AREA_CAPTURED', function() {
    if (games[socket.player.game.name].gameOver === false) {
      var area = games[socket.player.game.name].areas;
      var game = games[socket.player.game.name];

      // Création d'un tableau contenant les factions qui ont capturées une zone
      // ex capturedBy = ['saint', 'saint', 'none', 'zombie']
      // Zone 1 et 2 capturées par les Saints,
      // Zone 3 encore neutre
      // Zone 4 par les Zombies
      var capturedBy = [area.area1.capturedBy, area.area2.capturedBy, area.area3.capturedBy, area.area4.capturedBy];

      // Permet de compter combien de zone capturée par les Saints ou les Zombies
      // Utile pour un coeff multiplicateur qui augmente plus rapidement les points pour le score
      var counts = count(capturedBy);

      // On lance un interval pour faire augmenter le score
      (socket.player.faction.name === 'saint')? intervalSaint(game, counts['saint'], area) : intervalZombie(game, counts['zombie'], area);
    }
  });

  // Requête du client: le client demande à acheter un objet
  // Objectif: Mettre à jour son invetaire et ses golds dans le serveur et lui renvoyer
  socket.on('CLIENT_BUY_ITEM_FROM_SHOP', function(itemData) {
    var item = shops[socket.player.faction.name].content[itemData.itemCategory][itemData.itemName];

    var transactionSuccess = false;
    var code = -1;

    if (item.price <= socket.player.data.inventory.gold) {
      if (itemData.itemCategory === 'consumable') {
        if (itemData.itemName === 'healingPotion') {
          if (socket.player.data.inventory.potion < 3) {
            socket.player.data.inventory.potion++;
            transactionSuccess = true;
          } else {
            code = -21;
          }
        } else {
          code = -2;
        }
      } else if (itemData.itemCategory === 'weapon') {
        if (socket.player.data.inventory.equipment.weapon === null) {
          socket.player.data.inventory.equipment.weapon = itemData.itemName;
          transactionSuccess = true;
        } else {
          code = -10;
        }
      } else if (itemData.itemCategory === 'armor') {
        if (socket.player.data.inventory.equipment.armor === null) {
          socket.player.data.inventory.equipment.armor = itemData.itemName;
          transactionSuccess = true;
        } else {
          code = -20;
        }
      } else {
        code = -3;
      }
    } else {
      code = -303;
    }

    if (transactionSuccess) {
      socket.player.data.inventory.gold -= item.price;

      socket.player.data.itemsAddedStats = updatePlayerItemsAddedStats(socket.player.data.inventory.equipment);

      socket.player.data.stats = updatePlayerStats(socket.player.data, socket.player.faction.name);

      // On envoi les stats du player pour update le front de tous les joueurs
      io.emit('SERVER_UPDATE_OTHER_PLAYER_STATS', {
        username: socket.player.user.username,
        stats: socket.player.data.stats
      });

      socket.emit('SERVER_SEND_ITEM_FROM_SHOP', {
        inventory: socket.player.data.inventory,
        code: 1
      });
      socket.broadcast.to(socket.player.game.name).emit('SERVER_UPDATE_OTHER_PLAYER_INVENTORY', {
        username: socket.player.user.username,
        inventory: socket.player.data.inventory
      });
    } else {
      socket.emit('SERVER_SEND_ITEM_FROM_SHOP', {code: code});
    }
  });

  // Requête du client: le player souhaite vendre son arme
  // Objectif: vendre son arme et lui donner des golds
  socket.on('CLIENT_SELL_WEAPON_FROM_EQUIPMENT', function() {
    var weaponToSell = socket.player.data.inventory.equipment.weapon;

    if (weaponToSell !== null) {
      socket.player.data.inventory.gold += Math.floor(shops[socket.player.faction.name].content.weapon[weaponToSell].price / 2);

      socket.player.data.inventory.equipment.weapon = null;

      socket.player.data.itemsAddedStats = updatePlayerItemsAddedStats(socket.player.data.inventory.equipment);

      socket.player.data.stats = updatePlayerStats(socket.player.data, socket.player.faction.name);

      // On envoi les stats du player pour update le front de tous les joueurs
      io.emit('SERVER_UPDATE_OTHER_PLAYER_STATS', {
        username: socket.player.user.username,
        stats: socket.player.data.stats
      });

      socket.emit('SERVER_UPDATE_PLAYER_INVENTORY', {
        inventory: socket.player.data.inventory
      });

      socket.broadcast.to(socket.player.game.name).emit('SERVER_UPDATE_OTHER_PLAYER_INVENTORY', {
        username: socket.player.user.username,
        inventory: socket.player.data.inventory
      });
    }
  });

  // Requête du client: le player souhaite vendre son armure
  // Objectif: vendre son armure et lui donner des golds
  socket.on('CLIENT_SELL_ARMOR_FROM_EQUIPMENT', function() {
    var armorToSell = socket.player.data.inventory.equipment.armor;

    if (armorToSell !== null) {
      socket.player.data.inventory.gold += Math.floor(shops[socket.player.faction.name].content.armor[armorToSell].price / 2);

      socket.player.data.inventory.equipment.armor = null;

      socket.player.data.itemsAddedStats = updatePlayerItemsAddedStats(socket.player.data.inventory.equipment);

      socket.player.data.stats = updatePlayerStats(socket.player.data, socket.player.faction.name);

      // On envoi les stats du player pour update le front de tous les joueurs
      io.emit('SERVER_UPDATE_OTHER_PLAYER_STATS', {
        username: socket.player.user.username,
        stats: socket.player.data.stats
      });

      socket.emit('SERVER_UPDATE_PLAYER_INVENTORY', {
        inventory: socket.player.data.inventory
      });

      socket.broadcast.to(socket.player.game.name).emit('SERVER_UPDATE_OTHER_PLAYER_INVENTORY', {
        username: socket.player.user.username,
        inventory: socket.player.data.inventory
      });
    }
  });

  // Requête du client: le player a utilisé une potion
  // Objectif: Le soigner et mettre à jour les données chez tous les joueurs
  socket.on('CLIENT_PLAYER_USE_POTION', function() {
    if (socket.player.data.inventory.potion > 0 && socket.player.data.stats.currenthp < socket.player.data.stats.maxhp) {
      if (socket.player.data.stats.currenthp + 50 >= socket.player.data.stats.maxhp) {
        socket.player.data.stats.currenthp = socket.player.data.stats.maxhp;
      }
      else {
        socket.player.data.stats.currenthp += 50;
      }

      socket.player.data.inventory.potion--;

      io.in(socket.player.game.name).emit('SERVER_UPDATE_OTHER_PLAYER_STATS', {
        username: socket.player.user.username,
        stats: games[socket.player.game.name].players[socket.player.user.username].data.stats
      });

      socket.emit('SERVER_UPDATE_PLAYER_POTION', socket.player.data.inventory.potion);
    }
  });

  // Requête du client: le joueur indique au serveur qu'il a attaqué
  // Objectif: Notifier les autres joueurs de la partie pour leur faire jouer en local l'animation du joueur
  socket.on('CLIENT_PLAYER_ATTACKED', function(attackName) {
    socket.broadcast.to(socket.player.game.name).emit('SERVER_OTHER_PLAYER_ATTACKED', {
      username: socket.player.user.username,
      attackName: attackName
    });
  });

  // Requête du client: le 'joueur 1' a infligé une attaque au 'joueur 2'
  // Objectif: Calculer les dégâts de l'attaque et en déduire de la santé du 'joueur 2'
  socket.on('CLIENT_PLAYER_HIT_ENEMY', function(data) {
    var playerDamaged = games[socket.player.game.name].players[data.p2Username];

    // Empêche les alliés de s'infliger des dégâts
    if (playerDamaged.faction.name === socket.player.faction.name) {
      return;
    }

    // Si le joueur est mort, il ne peut plus être tapé et doit être achevé
    if (!playerDamaged.data.isAlive) {
      return;
    }

    var damages = calcDamage(socket.player.game.name, data.p1Username, data.p2Username);

    if (playerDamaged.data.stats.currenthp <= damages) {
      playerDamaged.data.stats.currenthp = 0;
      playerDamaged.data.deaths++;
      playerDamaged.data.isAlive = false;

      socket.player.data.kills++;
      addGolds(socket.player, 100);

      // On augmente ou réduit le nombre d'expérience obtenu selon le niveau des 2 joueurs
      var ratioExp = 1;
      if (socket.player.data.level > playerDamaged.data.level) {
        ratioExp = 1 - ((socket.player.data.level - playerDamaged.data.level)/8);
      } else if (socket.player.data.level < playerDamaged.data.level) {
        ratioExp = 1 + ((playerDamaged.data.level - socket.player.data.level)/10);
      }

      ratioExp < 0.25 ? ratioExp = 0.25 : '';

      var expEarn = Math.floor(150 * ratioExp);
      addExp(socket.player, expEarn);

      updateLevel(socket.player);

      socket.broadcast.to(socket.player.game.name).emit('SERVER_UPDATE_OTHER_PLAYER_EXP', {
        username: socket.player.user.username,
        level: socket.player.data.level,
        exp: socket.player.data.exp,
        toNextExp: socket.player.data.toNextExp
      });

      var teammates = getPlayerTeammates(socket.player.user.username, socket.player.game.name);
      for (var index in teammates) {
        if (teammates.hasOwnProperty(index)) {
          var teammate = games[socket.player.game.name].players[teammates[index]];
          teammate.data.inventory.gold += 50;

          io.in(socket.player.game.name).emit('SERVER_UPDATE_OTHER_PLAYER_GOLD', {
            username: teammates[index],
            golds: teammate.data.inventory.gold
          });

          addExp(teammate, Math.floor(expEarn/2));
          updateLevel(teammate);

          io.in(socket.player.game.name).emit('SERVER_UPDATE_OTHER_PLAYER_EXP', {
            username: teammates[index],
            level: teammate.data.level,
            exp: teammate.data.exp,
            toNextExp: teammate.data.toNextExp
          });
        }
      }

      io.in(socket.player.game.name).emit('SERVER_PLAYER_DEAD', {username: data.p2Username});
      socket.emit('SERVER_UPDATE_PLAYER_AFTER_KILL', {
        gold: socket.player.data.inventory.gold,
        level: socket.player.data.level,
        exp: socket.player.data.exp,
        toNextExp: socket.player.data.toNextExp
      });

      io.in(socket.player.game.name).emit('SERVER_UPDATE_OTHER_PLAYER_KILLS_DEATHS', {
        username: socket.player.user.username,
        kills: socket.player.data.kills,
        deaths: socket.player.data.deaths
      });
      io.in(socket.player.game.name).emit('SERVER_UPDATE_OTHER_PLAYER_KILLS_DEATHS', {
        username: playerDamaged.user.username,
        kills: playerDamaged.data.kills,
        deaths: playerDamaged.data.deaths
      });
    } else {
      playerDamaged.data.stats.currenthp -= damages;
    }

    io.in(socket.player.game.name).emit('SERVER_UPDATE_OTHER_PLAYER_STATS', {
      username: data.p2Username,
      stats: games[socket.player.game.name].players[data.p2Username].data.stats
    });
  });

  // Requête du client: demande de respawn d'un joueur
  // Objectif: Faire respawn un joueur et update ses stats
  socket.on('CLIENT_PLAYER_RESPAWN', function(data) {

    var player = games[socket.player.game.name].players[data.username];

    player.data.isAlive = true;
    player.data.stats.currenthp = player.data.stats.maxhp;

    io.in(socket.player.game.name).emit('SERVER_PLAYER_RESPAWN', {
      username: data.username,
      hp: player.data.stats.currenthp
    });
  });

  // Lorsqu'un user se déconnecte
  socket.on('disconnect', function() {
    // Evite de faire crash le serveur si le socket.player n'existe pas
    // Cela se produit lorsque l'on arrête le serveur sans faire quitter les
    // joueurs au préalable
    if (socket.player === undefined) {
      return;
    }

    // Garde en mémoire le joueur 30sec avant de le supprimer définitivement de la partie
    disconnectedPlayers[socket.player.user.username] = setTimeout(function(){
      var area = games[socket.player.game.name].areas;
      removePlayerFromGame(socket.player, area);
    }, 30000);

    // On envoi à tous les joueurs le username du joueur qui vient de se déconnecter
    io.in(socket.player.game.name).emit('SERVER_PLAYER_DISCONNECTED', {username: socket.player.user.username});

    console.log('\n////////////////////////////////////////////////////////////');
    console.log(socket.player.user.username + ' disconnected');
    console.log('////////////////////////////////////////////////////////////');
  });

  // Envoi les points de progression pour une capture de zone
  function captureInProgress(area, areaNumber, faction) {
    // interval 1 point par seconde
    // 15 secondes pour capturer une zone

    area.captureInProgressBy = faction;

    if(area.capturedBy !== socket.player.faction.name) {
      (area.capturedBy === 'none')? '' : area.progress = 0;
    }

    area.progressInterval = setInterval(function() {
      if (area.progress < 15) {
        area.progress++;
        // On met à jour sur tous les clients la barre de progression de capture de zone
        io.in(socket.player.game.name).emit('SERVER_UPDATE_OTHER_PLAYER_ON_AREA', {
          faction: faction,
          points: area.progress,
          area: area.name
        });
      } else {
        // Capture done : on stop l'interval
        clearInterval(area.progressInterval);
        // On stocke le nom de la faction dans la game, dans la zone capturée
        area.capturedBy = faction;
        // On met à jour sur tous les clients la zone capturée
        io.in(socket.player.game.name).emit('SERVER_UPDATE_AREA_CAPTURED', {
          faction: faction,
          area: area.name,
          areaNumber: areaNumber
        });
      }
    }, 1000);
  }

  function intervalSaint(game, counts, area) {
    clearInterval(area.scoreSaintInterval);
    area.scoreSaintInterval = setInterval(function() {
      var addPoint = 0.2;
      // Si au moins 1 zone a été capturé par les Saints
      // On augmente le score et on test si ils arrivent au score final (100 actuellement)
      if (counts > 0 && game.saintsPoint < 100) {
        game.saintsPoint += addPoint * counts;
        //console.log(socket.player.user.username+' '+game.saintsPoint);
        if (game.saintsPoint >= 100) {
          console.log('And the winner is : Sainnnnnnnnts - clap clap clap');
        }
      }
      if (game.saintsPoint >= 50 && !socket.player.finished_game) {
        clearInterval(area.progressInterval);
        clearInterval(area.releaseInterval);
        clearInterval(area.scoreSaintInterval);
        clearInterval(area.scoreZombieInterval);
        clearInterval(game.gameDurationInterval);
        games[socket.player.game.name].gameOver = true;
        // On envoie à tous les clients le message de fin de match
        io.in(socket.player.game.name).emit('SERVER_GAME_ENDING', {
          win: 'saint',
        });
        addFinishedGame('Saint');
      }

      (game.saintsPoint > 100)? game.saintsPoint = 100 : '';
      // On envoie à tous les clients le score pour afficher la barre de progression et le score de chaque faction
      io.in(socket.player.game.name).emit('SERVER_UPDATE_SCORE_SAINT', {
        faction: 'saint',
        score: game.saintsPoint,
      });
    }, 1000);
  }

  function intervalZombie(game, counts, area) {
    clearInterval(area.scoreZombieInterval);
    area.scoreZombieInterval = setInterval(function() {
      var addPointZombie = 0.2;
      // Si au moins 1 zone a été capturé par les Saints
      // On augmente le score et on test si ils arrivent au score final (3 actuellement)
      if (counts > 0 && game.zombiesPoint < 100) {
        game.zombiesPoint += addPointZombie * counts;
        //console.log(socket.player.user.username+' '+game.zombiesPoint);
        if (game.zombiesPoint >= 100) {
          console.log('And the winner is : Zombieeeeeeeees - clap clap clap');
        }
      }
      if (game.zombiesPoint >= 50 && !socket.player.finished_game) {
        clearInterval(area.progressInterval);
        clearInterval(area.releaseInterval);
        clearInterval(area.scoreSaintInterval);
        clearInterval(area.scoreZombieInterval);
        clearInterval(game.gameDurationInterval);
        games[socket.player.game.name].gameOver = true;
        // On envoie à tous les clients le message de fin de match
        io.in(socket.player.game.name).emit('SERVER_GAME_ENDING', {
          win: 'zombie',
        });
        addFinishedGame('Zombie');
      }

      (game.zombiesPoint > 100)? game.zombiesPoint = 100 : '';
      // On envoie à tous les clients le score pour afficher la barre de progression et le score de chaque faction
      io.in(socket.player.game.name).emit('SERVER_UPDATE_SCORE_ZOMBIE', {
        faction: 'zombie',
        score: game.zombiesPoint,
      });
    }, 1000);
  }

  function addFinishedGame(winner) {
    //on récupère la faction gagnante
    db.query('SELECT * FROM faction WHERE faction.name = ?', winner).on('result', function(winnerResult) {
      var values = {
       faction_id: winnerResult.id
     }
     // on récupère les info sur la partie qui vient de se terminer
      db.query('SELECT * FROM ongoing_game WHERE ongoing_game.slug = ?', socket.player.game.name).on('result', function(gameResult) {
        Number.prototype.padLeft = function(base,chr){
          var  len = (String(base || 10).length - String(this).length)+1;
          return len > 0? new Array(len).join(chr || '0')+this : this;
        }
        // formatage de la date de fin de partie en Datetime
        var d = new Date,
        dformat = [d.getFullYear(),
                (d.getMonth()+1).padLeft(),
                 d.getDate().padLeft()].join('-') +' ' +
                [d.getHours().padLeft(),
                 d.getMinutes().padLeft(),
                 d.getSeconds().padLeft()].join(':');

        values.title = gameResult.name;
        values.played_at = gameResult.created_at;
        values.finished_at = dformat;
        // on insert les données dans  finished_game si elle n'existe pas encore
        db.query('INSERT INTO `finished_game` SET ? ', values, function(error, result) {
          if (error) {
            console.log(error.message);
          } else {
            db.query('DELETE FROM ongoing_game WHERE ongoing_game.slug = ?', socket.player.game.name);
            io.in(socket.player.game.name).emit('SERVER_INSERT_PLAYERS', result.insertId);
          }
      });
    })
  })
}

  socket.on('CLIENT_INSERT_PLAYERS', function(gameId){
    db.query('SELECT * FROM faction WHERE faction.name = ?', socket.player.faction.name).on('result', function(playerFaction) {
      players = {
        user_id: socket.player.user.id,
        faction_id: playerFaction.id,
        finished_game_id: gameId,
        gold: socket.player.data.inventory.gold,
        killed: socket.player.data.kills,
        revive: 0,
        death: socket.player.data.deaths,
        level: socket.player.data.level
      }
      db.query('INSERT INTO `players` SET ?', players, function(error, result) {
        if (error) {
          console.log(error.message);
        } else {

        }
      });
    })
  });


  // Points de progression qui diminue lorsqu'une faction qui une zone non capturée
  // Envoi les points de progression pour une capture de zone
  function captureRelease(area) {
    // interval 1 point par seconde
    // 15 secondes pour capturer une zone
    if (area.capturedBy !== socket.player.faction.name) {
      area.releaseInterval = setInterval(function() {
        if (area.progress > 0) {
          area.progress--;
          // On met à jour sur tous les clients la barre de progression de capture de zone
          io.in(socket.player.game.name).emit('SERVER_UPDATE_OTHER_PLAYER_ON_AREA', {
            faction: socket.player.faction.name,
            points: area.progress,
            area: area.name
          });
        } else {
          // Plus de point de progression pour cette faction
          // On stoppe l'interval
          clearInterval(area.releaseInterval);

          // On envoi l'info sur tous les clients
          io.in(socket.player.game.name).emit('SERVER_UPDATE_OTHER_PLAYER_OFF_AREA', {
            faction: socket.player.faction.name,
            points: area.progress,
            area: area.name
          });
        }
      }, 1000);
    }
  }


  // Initialise un nouveau joueur
  // Récupère ses données en bdd et créé les infos nécessaire au jeu
  function initializeUser(username, room, faction, slot) {
    db.query('SELECT user.id, user.experience, user.attack, user.defense, user.hit_point, user.speed FROM user WHERE user.username = ?', username).on('result', function(result) {
      // Données du joueur
      socket.player = {
        user: {
          id: result.id,
          username: username,
          accountLevel: getAccountLevelFromExperience(result.experience),
          accountExp: result.experience
        },
        faction: {
          name: faction,
          slot: slot
        },
        game: {
          name: room
        },
        data: {
          level: 1,
          exp: 0,
          toNextExp: Math.floor(Math.pow(100, 1+1/25)),
          isAlive: true,
          kills: 0,
          deaths: 0,
          // spriteName: ['woman', 'man'][Math.floor(Math.random() * ['woman', 'man'].length)] + '_' + Math.floor((Math.random() * 4) + 1),
          spriteName: getRandSprite(username, faction, room),
          pos: {
            x: Math.floor(Math.random() * 200) + 1,
            y: Math.floor(Math.random() * 200) + 1
          },
          inventory: {
            gold: 200,
            potion: 1,
            equipment: {
              weapon: null,
              armor: null
            }
          },
          bonusStats: {
            atk: result.attack,
            def: result.defense,
            hp: result.hit_point,
            spd: result.speed
          },
          baseStats: {
            atk: Math.floor(factionsBaseStats[faction].base_attack * (1 + result.attack / 100.00)),
            def: Math.floor(factionsBaseStats[faction].base_defense * (1 + result.defense / 100.00)),
            hp: Math.floor(factionsBaseStats[faction].base_hit_point * (1 + result.hit_point / 100.00)),
            spd: Math.floor(factionsBaseStats[faction].base_speed * (1 + result.speed / 100.00))
          },
          itemsAddedStats: {
            atk: 0,
            def: 0,
            hp: 0,
            spd: 0
          },
          levelsAddedStats: {
            atk: 0,
            def: 0,
            hp: 0,
            spd: 0
          },
          stats: {
            atk: Math.floor(factionsBaseStats[faction].base_attack * (1 + result.attack / 100.00)),
            def: Math.floor(factionsBaseStats[faction].base_defense * (1 + result.defense / 100.00)),
            currenthp: Math.floor(factionsBaseStats[faction].base_hit_point * (1 + result.hit_point / 100.00)),
            maxhp: Math.floor(factionsBaseStats[faction].base_hit_point * (1 + result.hit_point / 100.00)),
            spd: Math.floor(factionsBaseStats[faction].base_speed * (1 + result.speed / 100.00))
          }
        }
      };
    }).on('end', function() {
      console.log('\n////////////////////////////////////////////////////////////');
      console.log('New player: ' + socket.player.user.username);
      // console.log(socket.player);

      // On ajoute le joueur dans la liste des parties en cours
      games[room].players[username] = socket.player;
      // console.log('\nAperçu des parties en cours:');
      // console.log(games);
      console.log('////////////////////////////////////////////////////////////');

      // On envoi à tous les joueur de la game la liste des participants
      // pour mettre à jour l'affichage de l'en-tête
      // var players = {};
      // for (var playerName in games[room].players) {
      //   if (games[room].players.hasOwnProperty(playerName)) {
      //     var player = games[room].players[playerName];
      //     players[playerName] = {
      //       username: player.user.username,
      //       faction: player.faction.name,
      //       slot: player.faction.slot,
      //       level: player.user.accountLevel
      //     };
      //   }
      // }
      // io.in(room).emit('SERVER_UPDATE_HEADER_PLAYERS', players);

      // On informe tous les joueurs déjà dans la partie de la connexion
      // d'un nouveau joueur
      socket.broadcast.to(socket.player.game.name).emit('SERVER_NEW_PLAYER', socket.player);
      socket.emit('SERVER_INIT_GAME', {
        player: socket.player,
        shops: shops,
        map: games[room].map
      });
    });
  }
});

// Retourne la liste des autres joueurs d'une room (games[roomName]) excepté le
// joueur passé en paramètre
function getOtherPlayersList(playerToExclude, roomName) {
  var players = games[roomName].players;
  var otherPlayers = {};

  Object.keys(players).forEach(function(player) {
    if (player !== playerToExclude) {
      otherPlayers[player] = players[player];
    }
  });

  return otherPlayers;
}

// Calcul le niveau de compte d'un joueur d'après son expérience
function getAccountLevelFromExperience(exp) {
  var level = 0;
  var i = 0;

  while (exp >= Math.floor(100 * i + Math.pow(i, 2.5))) {
    i++;
  }

  level = i;

  return level;
}

// Retourne les pseudos des alliés du joueur
function getPlayerTeammates(playerName, gameName) {
  var teammates = [];
  var players = games[gameName].players;

  Object.keys(players).forEach(function(player) {
    if (games[gameName].players[player].faction.name === games[gameName].players[playerName].faction.name) {
      if (player !== playerName) {
        teammates.push(player);
      }
    }
  });

  // console.log(teammates);

  return teammates;
}

// Retourne les dégâts infligés au 'joueur 2' par le 'joueur 1'
function calcDamage(gameName, p1Username, p2Username) {
  var damage = 0;
  var player1Stats = games[gameName].players[p1Username].data.stats;
  var player2Stats = games[gameName].players[p2Username].data.stats;

  damage = (player1Stats.atk / 4) - (player2Stats.def / 10);
  damage < 10
    ? damage = 10
    : '';

  return Math.floor(damage);
}

// Ajoute des golds au joueur passé en paramètre
function addGolds(player, amount) {
  player.data.inventory.gold += amount;
}

// Ajoute de l'expérience au joueur passé en paramètre
function addExp(player, amount) {
  player.data.exp += amount;
}

// Met à jour le niveau d'un joueur d'après son expérience
function updateLevel(player) {
  var level;
  var exp = player.data.exp;
  var totalExp = 0;
  var i = 1;

  while (exp >= Math.floor(100*(i-1) + Math.pow(100, 1+i/25))) {
    i++;
  }

  totalExp = Math.floor(100*(i-1) + Math.pow(100, 1+i/25));

  level = i;

  player.data.level = level;
  player.data.toNextExp = totalExp - exp;
}

// Retourne les stats du joueur après un changement (nouvel équipement, montée de niveau)
function updatePlayerStats(playerAllStats, faction) {
  var newStats = {
    atk: playerAllStats.atk,
    def: playerAllStats.def,
    currenthp: playerAllStats.stats.currenthp,
    maxhp: playerAllStats.stats.maxhp,
    spd: playerAllStats.spd
  };

  newStats.atk = Math.floor(factionsBaseStats[faction].base_attack * (1 + playerAllStats.bonusStats.atk / 100.00) + playerAllStats.itemsAddedStats.atk + playerAllStats.levelsAddedStats.atk);
  newStats.atk < 25 ? newStats.atk = 25 : '';

  newStats.def = Math.floor(factionsBaseStats[faction].base_defense * (1 + playerAllStats.bonusStats.def / 100.00) + playerAllStats.itemsAddedStats.def + playerAllStats.levelsAddedStats.def);
  newStats.def < 25 ? newStats.def = 25 : '';

  newStats.maxhp = Math.floor(factionsBaseStats[faction].base_hit_point * (1 + playerAllStats.bonusStats.hp / 100.00) + playerAllStats.itemsAddedStats.hp + playerAllStats.levelsAddedStats.hp);
  newStats.maxhp < 50 ? newStats.maxhp = 50 : '';

  newStats.currenthp = playerAllStats.stats.currenthp + (newStats.maxhp - playerAllStats.stats.maxhp);

  newStats.spd = Math.floor(factionsBaseStats[faction].base_speed * (1 + playerAllStats.bonusStats.spd / 100.00) + playerAllStats.itemsAddedStats.spd + playerAllStats.levelsAddedStats.spd);
  newStats.spd < 50 ? newStats.spd = 50 : '';

  return newStats;
}

// Met à jour les stats obtenues des armes/armures du player
function updatePlayerItemsAddedStats(equipment) {
  var newItemStats = {
    atk: 0,
    def: 0,
    hp: 0,
    spd: 0
  };

  if (equipment.weapon !== null) {
    newItemStats.atk += items[equipment.weapon].stats.atk;
    newItemStats.def += items[equipment.weapon].stats.def;
    newItemStats.hp += items[equipment.weapon].stats.hp;
    newItemStats.spd += items[equipment.weapon].stats.spd;
  }

  if (equipment.armor !== null) {
    newItemStats.atk += items[equipment.armor].stats.atk;
    newItemStats.def += items[equipment.armor].stats.def;
    newItemStats.hp += items[equipment.armor].stats.hp;
    newItemStats.spd += items[equipment.armor].stats.spd;
  }

  return newItemStats;
}

// Retourne le nom d'un sprite aléatoire et le supprime du tableau des sprites dispo
function getRandSprite(username, faction, room) {
  var availableSprites = games[room].sprites[faction+'s'];
  var randIndex = Math.floor(Math.random() * availableSprites.length);
  var randSprite = availableSprites[randIndex];

  games[room].sprites[faction+'s'].splice(randIndex, 1);

  return randSprite;
}

// Teste si un objet est vide
function isEmpty(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false;
    }
  }

  return true;
}

var items = {
  velenSword: {
    stats: {
      hp: 0,
      atk: 50,
      def: 0,
      spd: -30
    }
  },
  feralSword: {
    stats: {
      hp: 20,
      atk: 30,
      def: 0,
      spd: 0
    }
  },
  phantomRapier: {
    stats: {
      hp: 30,
      atk: 0,
      def: 30,
      spd: 0
    }
  },
  rustyKatana: {
    stats: {
      hp: 0,
      atk: 30,
      def: 0,
      spd: 20
    }
  },
  skullCrusher: {
    stats: {
      hp: 0,
      atk: 50,
      def: -20,
      spd: 0
    }
  },
  silencer: {
    stats: {
      hp: 20,
      atk: 0,
      def: 0,
      spd: 30
    }
  },
  theVoid: {
    stats: {
      hp: 0,
      atk: 40,
      def: 0,
      spd: 0
    }
  },
  massacre: {
    stats: {
      hp: -30,
      atk: 80,
      def: -30,
      spd: 0
    }
  },
  lightning: {
    stats: {
      hp: 0,
      atk: 0,
      def: -20,
      spd: 60
    }
  },
  adamanthArmor: {
    stats: {
      hp: 40,
      atk: -30,
      def: 40,
      spd: 0
    }
  },
  gloryOfLimbo: {
    stats: {
      hp: 0,
      atk: 0,
      def: 40,
      spd: 20
    }
  },
  scaledTunic: {
    stats: {
      hp: 30,
      atk: 0,
      def: 30,
      spd: 0
    }
  },
  reachOfZeal: {
    stats: {
      hp: 0,
      atk: 30,
      def: 20,
      spd: 0
    }
  },
  steelOfTheNightstalker: {
    stats: {
      hp: 0,
      atk: 30,
      def: 0,
      spd: 20
    }
  },
  visageOfAbsorption: {
    stats: {
      hp: 20,
      atk: 0,
      def: 40,
      spd: 0
    }
  },
  blightOfTrust: {
    stats: {
      hp: 30,
      atk: 0,
      def: 0,
      spd: 20
    }
  },
  guardOfTheStars: {
    stats: {
      hp: 0,
      atk: -20,
      def: 80,
      spd: 0
    }
  },
  tunicOfHell: {
    stats: {
      hp: 0,
      atk: 60,
      def: -10,
      spd: -10
    }
  },
  rottenHand: {
    stats: {
      hp: 0,
      atk: 60,
      def: -40,
      spd: 0
    }
  },
  smellyFish: {
    stats: {
      hp: 0,
      atk: 20,
      def: 0,
      spd: 10
    }
  },
  heinousGrapple: {
    stats: {
      hp: 30,
      atk: 20,
      def: 0,
      spd: 0
    }
  },
  hatefulEbonTalon: {
    stats: {
      hp: 0,
      atk: 0,
      def: 20,
      spd: 30
    }
  },
  gutpuncher: {
    stats: {
      hp: 10,
      atk: 40,
      def: 0,
      spd: 0
    }
  },
  venomMithrilBlades: {
    stats: {
      hp: 0,
      atk: 60,
      def: 0,
      spd: -20
    }
  },
  tranquillizer: {
    stats: {
      hp: 40,
      atk: 0,
      def: 20,
      spd: 0
    }
  },
  deathsScalpel: {
    stats: {
      hp: -30,
      atk: 100,
      def: -30,
      spd: 0
    }
  },
  glintingGouger: {
    stats: {
      hp: 0,
      atk: -30,
      def: -10,
      spd: 80
    }
  },
  rustyRag: {
    stats: {
      hp: 0,
      atk: 0,
      def: -30,
      spd: 50
    }
  },
  vampireDust: {
    stats: {
      hp: 0,
      atk: 30,
      def: 0,
      spd: 20
    }
  },
  bonedust: {
    stats: {
      hp: 30,
      atk: 0,
      def: 0,
      spd: 20
    }
  },
  fogbane: {
    stats: {
      hp: 0,
      atk: 0,
      def: 10,
      spd: 40
    }
  },
  ghastlyDuscle: {
    stats: {
      hp: 30,
      atk: 0,
      def: 30,
      spd: 0
    }
  },
  hempain: {
    stats: {
      hp: 40,
      atk: 0,
      def: 0,
      spd: 10
    }
  },
  tormentHops: {
    stats: {
      hp: 0,
      atk: 60,
      def: -20,
      spd: 0
    }
  },
  touchMeNever: {
    stats: {
      hp: 50,
      atk: -50,
      def: 50,
      spd: 0
    }
  },
  necroticThimbleberry: {
    stats: {
      hp: 0,
      atk: 10,
      def: 30,
      spd: 10
    }
  }
};

var shops = {
  saint: {
    isActive: false,
    content: {
      consumable: {
        healingPotion: {
          name: 'Healing potion',
          description: 'A potion that restore up to 50hp.',
          category: 'heal',
          quantity: 1,
          price: 50,
          available: true,
          img: 'potion-heal-small.png'
        }
      },
      weapon: {
        velenSword: {
          name: 'Velen Sword',
          description: 'A cheap sword with decent damage and range.',
          category: 'weapon',
          stats: items['velenSword'].stats,
          quantity: 1,
          price: 200,
          available: true,
          img: 'unknown-small.png'
        },
        feralSword: {
          name: 'Feral Sword',
          description: 'No description.',
          category: 'weapon',
          stats: items['feralSword'].stats,
          quantity: 1,
          price: 220,
          available: true,
          img: 'unknown-small.png'
        },
        phantomRapier: {
          name: 'Phantom Rapier',
          description: 'No description.',
          category: 'weapon',
          stats: items['phantomRapier'].stats,
          quantity: 1,
          price: 210,
          available: true,
          img: 'unknown-small.png'
        },
        rustyKatana: {
          name: 'Rusty Katana',
          description: 'No description.',
          category: 'weapon',
          stats: items['rustyKatana'].stats,
          quantity: 1,
          price: 200,
          available: true,
          img: 'unknown-small.png'
        },
        skullCrusher: {
          name: 'Skullcrusher',
          description: 'No description.',
          category: 'weapon',
          stats: items['skullCrusher'].stats,
          quantity: 1,
          price: 230,
          available: true,
          img: 'unknown-small.png'
        },
        silencer: {
          name: 'Silencer',
          description: 'No description.',
          category: 'weapon',
          stats: items['silencer'].stats,
          quantity: 1,
          price: 225,
          available: true,
          img: 'unknown-small.png'
        },
        theVoid: {
          name: 'The Void',
          description: 'No description.',
          category: 'weapon',
          stats: items['theVoid'].stats,
          quantity: 1,
          price: 250,
          available: true,
          img: 'unknown-small.png'
        },
        massacre: {
          name: 'Massacre',
          description: 'No description.',
          category: 'weapon',
          stats: items['massacre'].stats,
          quantity: 1,
          price: 300,
          available: true,
          img: 'unknown-small.png'
        },
        lightning: {
          name: 'Lightning',
          description: 'No description.',
          category: 'weapon',
          stats: items['lightning'].stats,
          quantity: 1,
          price: 320,
          available: true,
          img: 'unknown-small.png'
        }
      },
      armor: {
        adamanthArmor: {
          name: 'Adamanth Armor',
          description: 'A strong armor made with the purests ores.',
          category: 'armor',
          stats: items['adamanthArmor'].stats,
          quantity: 1,
          price: 250,
          available: true,
          img: 'unknown-small.png'
        },
        gloryOfLimbo: {
          name: 'Glory of Limbo',
          description: 'No description.',
          category: 'armor',
          stats: items['gloryOfLimbo'].stats,
          quantity: 1,
          price: 240,
          available: true,
          img: 'unknown-small.png'
        },
        scaledTunic: {
          name: 'Scaled Tunic',
          description: 'No description.',
          category: 'armor',
          stats: items['scaledTunic'].stats,
          quantity: 1,
          price: 260,
          available: true,
          img: 'unknown-small.png'
        },
        reachOfZeal: {
          name: 'Reach of Zeal',
          description: 'No description.',
          category: 'armor',
          stats: items['reachOfZeal'].stats,
          quantity: 1,
          price: 255,
          available: true,
          img: 'unknown-small.png'
        },
        steelOfTheNightstalker: {
          name: 'Steel of the Nightstalker',
          description: 'No description.',
          category: 'armor',
          stats: items['steelOfTheNightstalker'].stats,
          quantity: 1,
          price: 240,
          available: true,
          img: 'unknown-small.png'
        },
        visageOfAbsorption: {
          name: 'Visage of Absorption',
          description: 'No description.',
          category: 'armor',
          stats: items['visageOfAbsorption'].stats,
          quantity: 1,
          price: 230,
          available: true,
          img: 'unknown-small.png'
        },
        blightOfTrust: {
          name: 'Blight of Trust',
          description: 'No description.',
          category: 'armor',
          stats: items['blightOfTrust'].stats,
          quantity: 1,
          price: 250,
          available: true,
          img: 'unknown-small.png'
        },
        guardOfTheStars: {
          name: 'Guard of the Stars',
          description: 'No description.',
          category: 'armor',
          stats: items['guardOfTheStars'].stats,
          quantity: 1,
          price: 300,
          available: true,
          img: 'unknown-small.png'
        },
        tunicOfHell: {
          name: 'Tunic of Hell',
          description: 'No description.',
          category: 'armor',
          stats: items['tunicOfHell'].stats,
          quantity: 1,
          price: 340,
          available: true,
          img: 'unknown-small.png'
        }
      }
    }
  },
  zombie: {
    isActive: false,
    content: {
      consumable: {
        healingPotion: {
          name: 'Healing potion',
          description: 'A potion that restore up to 50hp.',
          category: 'heal',
          quantity: 1,
          price: 50,
          available: true,
          img: 'potion-heal-small.png'
        }
      },
      weapon: {
        rottenHand: {
          name: 'Rotten hand',
          description: 'A rotten hand that deals good damage against Saints.',
          category: 'weapon',
          stats: items['rottenHand'].stats,
          quantity: 1,
          price: 200,
          available: true,
          img: 'unknown-small.png'
        },
        smellyFish: {
          name: 'Smelly fish',
          description: 'A fish that smells good... if you are a zombie of course.',
          category: 'weapon',
          stats: items['smellyFish'].stats,
          quantity: 1,
          price: 210,
          available: true,
          img: 'unknown-small.png'
        },
        heinousGrapple: {
          name: 'Heinous Grapple',
          description: 'No description.',
          category: 'weapon',
          stats: items['heinousGrapple'].stats,
          quantity: 1,
          price: 220,
          available: true,
          img: 'unknown-small.png'
        },
        hatefulEbonTalon: {
          name: 'Hateful Ebon Talon',
          description: 'No description.',
          category: 'weapon',
          stats: items['hatefulEbonTalon'].stats,
          quantity: 1,
          price: 200,
          available: true,
          img: 'unknown-small.png'
        },
        gutpuncher: {
          name: 'Gutpuncher',
          description: 'No description.',
          category: 'weapon',
          stats: items['gutpuncher'].stats,
          quantity: 1,
          price: 230,
          available: true,
          img: 'unknown-small.png'
        },
        venomMithrilBlades: {
          name: 'Venom Mithril Blades',
          description: 'No description.',
          category: 'weapon',
          stats: items['venomMithrilBlades'].stats,
          quantity: 1,
          price: 215,
          available: true,
          img: 'unknown-small.png'
        },
        tranquillizer: {
          name: 'Tranquillizer',
          description: 'No description.',
          category: 'weapon',
          stats: items['tranquillizer'].stats,
          quantity: 1,
          price: 210,
          available: true,
          img: 'unknown-small.png'
        },
        deathsScalpel: {
          name: 'Death\'s Scalpel',
          description: 'No description.',
          category: 'weapon',
          stats: items['deathsScalpel'].stats,
          quantity: 1,
          price: 350,
          available: true,
          img: 'unknown-small.png'
        },
        glintingGouger: {
          name: 'Glinting Gouger',
          description: 'No description.',
          category: 'weapon',
          stats: items['glintingGouger'].stats,
          quantity: 1,
          price: 340,
          available: true,
          img: 'unknown-small.png'
        }
      },
      armor: {
        rustyRag: {
          name: 'Rusty rag',
          description: 'This rag allow you to move more freely at cost of defense.',
          category: 'armor',
          stats: items['rustyRag'].stats,
          quantity: 1,
          price: 250,
          available: true,
          img: 'unknown-small.png'
        },
        vampireDust: {
          name: 'Vampire Dust',
          description: 'No description.',
          category: 'armor',
          stats: items['vampireDust'].stats,
          quantity: 1,
          price: 240,
          available: true,
          img: 'unknown-small.png'
        },
        bonedust: {
          name: 'Bonedust',
          description: 'No description.',
          category: 'armor',
          stats: items['bonedust'].stats,
          quantity: 1,
          price: 260,
          available: true,
          img: 'unknown-small.png'
        },
        fogbane: {
          name: 'Fogbane',
          description: 'No description.',
          category: 'armor',
          stats: items['fogbane'].stats,
          quantity: 1,
          price: 255,
          available: true,
          img: 'unknown-small.png'
        },
        ghastlyDuscle: {
          name: 'Ghastly Duscle',
          description: 'No description.',
          category: 'armor',
          stats: items['ghastlyDuscle'].stats,
          quantity: 1,
          price: 240,
          available: true,
          img: 'unknown-small.png'
        },
        hempain: {
          name: 'Hempain',
          description: 'No description.',
          category: 'armor',
          stats: items['hempain'].stats,
          quantity: 1,
          price: 250,
          available: true,
          img: 'unknown-small.png'
        },
        tormentHops: {
          name: 'Torment Hops',
          description: 'No description.',
          category: 'armor',
          stats: items['tormentHops'].stats,
          quantity: 1,
          price: 350,
          available: true,
          img: 'unknown-small.png'
        },
        touchMeNever: {
          name: 'Touch-me-never',
          description: 'No description.',
          category: 'armor',
          stats: items['touchMeNever'].stats,
          quantity: 1,
          price: 320,
          available: true,
          img: 'unknown-small.png'
        },
        necroticThimbleberry: {
          name: 'Necrotic Thimbleberry',
          description: 'No description.',
          category: 'armor',
          stats: items['necroticThimbleberry'].stats,
          quantity: 1,
          price: 280,
          available: true,
          img: 'unknown-small.png'
        }
      }
    }
  }
};

// Création de la map de la room
function createMap() {
  // génération aléatoire du décor
  var data = '';
  for (var y = 0; y < 75; y++) {
    for (var x = 0; x < 75; x++) {
      var nbr = Math.floor(Math.random() * (30 - 0)) + 0;
      if (nbr !== 0) {
        data += '9';
      } else {
        data += (Math.floor(Math.random() * (5 - 0)) + 0).toString();
      }
      if (x < 74) {
        data += ',';
      }
    }
    if (y < 74) {
      data += '\n';
    }
  }

  return data;
}

// Retourne un tableau qui identifie combien de fois la même valeur apparait dedans
function count(array) {
  var counts = {};
  for (var i = 0; i < array.length; i++) {
    var key = array[i];
    counts[key] = (counts[key])
      ? counts[key] + 1
      : 1;
  }

  return counts;
}

function removePlayerFromGame(player, area) {
  // On récupère le nom de la partie ainsi que le slot qu'occupait le joueur
  var gameName = player.game.name;
  var slotToFree = player.faction.name + '_' + player.faction.slot + '_id';

  // On le supprime en bdd en mettant à NULL le slot qu'il occupait
  switch (slotToFree) {
    case 'saint_1_id':
      db.query('UPDATE ongoing_game SET saint_1_id = NULL WHERE ongoing_game.slug = ?', gameName);
      break;
    case 'saint_2_id':
      db.query('UPDATE ongoing_game SET saint_2_id = NULL WHERE ongoing_game.slug = ?', gameName);
      break;
    case 'saint_3_id':
      db.query('UPDATE ongoing_game SET saint_3_id = NULL WHERE ongoing_game.slug = ?', gameName);
      break;
    case 'zombie_1_id':
      db.query('UPDATE ongoing_game SET zombie_1_id = NULL WHERE ongoing_game.slug = ?', gameName);
      break;
    case 'zombie_2_id':
      db.query('UPDATE ongoing_game SET zombie_2_id = NULL WHERE ongoing_game.slug = ?', gameName);
      break;
    case 'zombie_3_id':
      db.query('UPDATE ongoing_game SET zombie_3_id = NULL WHERE ongoing_game.slug = ?', gameName);
      break;
    default:
      '';
  }

  // On supprime le joueur de la liste 'games'
  delete games[gameName].players[player.user.username];

  // S'il n'y a plus aucun joueur dans la partie on la supprime de la liste
  // des parties en cours en bdd ainsi que dans la liste 'games'
  if (isEmpty(games[gameName].players)) {
    clearInterval(area.progressInterval);
    clearInterval(area.releaseInterval);
    clearInterval(area.scoreSaintInterval);
    clearInterval(area.scoreZombieInterval);
    clearInterval(games[gameName].gameDurationInterval);
    db.query('DELETE FROM ongoing_game WHERE ongoing_game.slug = ?', gameName);
    delete games[gameName];
  }

  console.log('\n////////////////////////////////////////////////////////////');
  console.log(player.user.username + ' removed from: ' + player.game.name);
  // console.log('Aperçu des parties en cours:');
  // console.log(games);
  console.log('////////////////////////////////////////////////////////////');
}

server.listen(8081);
