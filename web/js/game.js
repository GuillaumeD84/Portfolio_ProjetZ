var game;
var Game = {};

var map;
var layer;

// Joueur que l'utilisateur contrôle
var defaultPlayerData;
var player;

// Group contenant les autres joueurs
var playerGroup;

var factionPoints = {
  'saint' : 0,
  'zombie' : 0,
};

var merchants = {
    saint: '',
    zombie: ''
};
var merchHitboxes = {
    saint: '',
    zombie: ''
};
var shops;
var dataMap = '';

var playerOnArea = 0;

var areas = {
    area1: {
        sprite: '',
        hitbox: '',
        status: 'neutral',
    },
    area2: {
        sprite: '',
        hitbox: '',
        status: 'neutral',
    },
    area3: {
        sprite: '',
        hitbox: '',
        status: 'neutral',
    },
    area4: {
        sprite: '',
        hitbox: '',
        status: 'neutral',
    }
};

var spawnPoints = {
  s1: {
    x: 140,
    y: 1000
  },
  s2: {
    x: 230,
    y: 1200
  },
  s3: {
    x: 140,
    y: 1400
  },
  z1: {
    x: 2260,
    y: 1000
  },
  z2: {
    x: 2170,
    y: 1200
  },
  z3: {
    x: 2260,
    y: 1400
  },
}
var safeZones = {
    saint: '',
    zombie: ''
};

// Textes pour l'affichages des golds et de la santé du player
var goldDisplay;
var heartDisplay;

// Mapping des touches
var cursors;
// Booléens utilisables dans la fonction update que l'on pourra passer à true
// afin de déclencher qu'une seul fois un bout de code présent dans un if()
// game.input.keyboard.justPressed(Phaser.Keyboard.ONE) est une alternative pour s'en passer
var buttonsPressed = {
    z: false,
    q: false,
    s: false,
    d: false,
    space: false,
    one: false,
    mouseLeft: false,
    mouseRight: false
}

// Indique l'orientation du joueur
var orientation = 'bot';
var attacking = false;
// Liste des joueurs touchés pendant une attaque
var playersHit = [];

var capturTimer = true;
var increasePointsTimer = true;

Game.preload = function() {
  game.load.image('map', '/assets/images/mega-map.png');
  game.load.image('area1', '/assets/images/area1.png');
  game.load.image('area2', '/assets/images/area2.png');
  game.load.image('area3', '/assets/images/area3.png');
  game.load.image('area4', '/assets/images/area4.png');
  game.load.image('area-hitbox', '/assets/images/area-hitbox.png')
  game.load.image('graveyard', '/assets/images/graveyard.png');

  // game.load.image('backgroundMap', '/assets/images/big-map.png');
  game.load.image('gold', '/assets/images/shop/gold-small.png');
  game.load.image('heart', '/assets/images/heart-small.png');

  // Players sprites
  // game.load.atlasXML('player_alien_1', '/assets/atlas/alien_1.png', '/assets/atlas/alien_1.xml');

  game.load.atlasXML('player_saint_man_1', '/assets/atlas/saints/saint_man_1.png', '/assets/atlas/saints/saint_man_1.xml');
  game.load.atlasXML('player_saint_man_2', '/assets/atlas/saints/saint_man_2.png', '/assets/atlas/saints/saint_man_2.xml');
  game.load.atlasXML('player_saint_man_3', '/assets/atlas/saints/saint_man_3.png', '/assets/atlas/saints/saint_man_3.xml');
  game.load.atlasXML('player_saint_man_4', '/assets/atlas/saints/saint_man_4.png', '/assets/atlas/saints/saint_man_4.xml');

  game.load.atlasXML('player_saint_woman_1', '/assets/atlas/saints/saint_woman_1.png', '/assets/atlas/saints/saint_woman_1.xml');
  game.load.atlasXML('player_saint_woman_2', '/assets/atlas/saints/saint_woman_2.png', '/assets/atlas/saints/saint_woman_2.xml');
  game.load.atlasXML('player_saint_woman_3', '/assets/atlas/saints/saint_woman_3.png', '/assets/atlas/saints/saint_woman_3.xml');
  game.load.atlasXML('player_saint_woman_4', '/assets/atlas/saints/saint_woman_4.png', '/assets/atlas/saints/saint_woman_4.xml');

  game.load.atlasXML('player_zombie_man_1', '/assets/atlas/zombies/zombie_man_1.png', '/assets/atlas/zombies/zombie_man_1.xml');
  game.load.atlasXML('player_zombie_man_2', '/assets/atlas/zombies/zombie_man_2.png', '/assets/atlas/zombies/zombie_man_2.xml');
  game.load.atlasXML('player_zombie_man_3', '/assets/atlas/zombies/zombie_man_3.png', '/assets/atlas/zombies/zombie_man_3.xml');
  game.load.atlasXML('player_zombie_man_4', '/assets/atlas/zombies/zombie_man_4.png', '/assets/atlas/zombies/zombie_man_4.xml');

  game.load.atlasXML('player_zombie_woman_1', '/assets/atlas/zombies/zombie_woman_1.png', '/assets/atlas/zombies/zombie_woman_1.xml');
  game.load.atlasXML('player_zombie_woman_2', '/assets/atlas/zombies/zombie_woman_2.png', '/assets/atlas/zombies/zombie_woman_2.xml');
  game.load.atlasXML('player_zombie_woman_3', '/assets/atlas/zombies/zombie_woman_3.png', '/assets/atlas/zombies/zombie_woman_3.xml');
  game.load.atlasXML('player_zombie_woman_4', '/assets/atlas/zombies/zombie_woman_4.png', '/assets/atlas/zombies/zombie_woman_4.xml');

  // game.load.atlasXML('player_rapier', '/assets/atlas/character_1_with_rapier.png', '/assets/atlas/character_1_with_rapier.xml');
  // game.load.atlasXML('player_saint', '/assets/images/saint.png', '/atlasXML/player.xml')
  // game.load.atlasXML('player_zombie', '/assets/images/zombie.png', '/atlasXML/player.xml');

  // Enemi
  // game.load.atlasXML('enemy_skeleton', '/assets/images/skeleton_atlas.png', '/atlasXML/skeleton_atlas.xml');
  game.load.atlasXML('merch_saint', '/assets/images/merchantSaint.png', '/atlasXML/skeleton_atlas.xml');
  game.load.atlasXML('merch_zombie', '/assets/images/merchantZombie.png', '/atlasXML/skeleton_atlas.xml');
};

Game.create = function() {
    // Liste des autres joueurs sur la map
    Game.playerMap = {};

    game.stage.disableVisibilityChange = true;
    game.world.setBounds(0, 0, 2400, 2400);
    game.physics.startSystem(Phaser.Physics.ARCADE);

    $('#tour').show();
    $('#ferme').show();
    $('#moulin').show();
    $('#bois').show();

    // var background = game.add.tileSprite(0, 0, 1600, 1200, 'backgroundMap');
    var background = game.add.tileSprite(0, 0, 2400, 2400, 'map');

    // Décor
    // Traduction du CSV en tiles
    game.cache.addTilemap('tileset', null, dataMap, Phaser.Tilemap.CSV);
    // Ajout de la tilemap
    map = game.add.tilemap('tileset', 32, 32);
    // Fichier utilisé pour les tiles
    map.addTilesetImage('graveyard', 'graveyard');

    // Configuration de la couche décor
    layer = map.createLayer(0);
    layer.resizeWorld();
    // Collisions activées sur les élément de décor (index entre 0 et 5)
    map.setCollisionBetween(0, 5);

    cursors = game.input.keyboard.addKeys({
        'up': Phaser.KeyCode.Z,
        'left': Phaser.KeyCode.Q,
        'down': Phaser.KeyCode.S,
        'right': Phaser.KeyCode.D,
        'space': Phaser.KeyCode.SPACEBAR,
    });

    // Empêche le clic droit d'ouvrir le menu sur la fenêtre de jeu
    game.canvas.oncontextmenu = function (evt) { evt.preventDefault(); }

    // Ajoute un joueur par défaut (pour ne pas faire planter la fonction update)
    Game.addPlayer();

    Game.addAreas();
    Game.addSafeZones();
    Game.addMerchants();
    Game.addShops();
    Game.addSellEquipmentWindow();
    Game.updateSellEquipmentDiv();

    // On envoie x fois par secondes la position du joueur au serveur
    // Elle sera redistribuée à tous les autres joueurs
    game.time.events.loop(50, function() {Client.updatePlayerPosition(player.x, player.y);}, this);

    game.time.events.loop(500, function() {for (var i = 1; i <= 4.; i++) {
      if((areas['area'+i].status) != 'neutral') {
        factionPoints[areas['area'+i].status] += 1/6;
      }
    }}, this);


    // On créé notre groupe qui contiendra les autres joueurs
    playerGroup = game.add.group();

    // On demande aux serveurs les données des autres joueurs déjà présents dans la game
    Client.getOtherPlayersData();

    // Camera
    game.camera.follow(player);
    game.camera.deadzone = new Phaser.Rectangle(330, 250, 140, 100);
};

Game.update = function() {
    ///////////////////////////////////////////////////////////////////////////
    //////////////////////////// Début: COLLISIONS ////////////////////////////

    // Active la collision entre le player et les autres joueurs
    game.physics.arcade.collide(player, playerGroup);

    // On test si le player overlap un autre joueur pendant son attaque
    if (attacking) {
        // La fonction se déclenche à chaque boucle de l'update pendant l'attaque
        game.physics.arcade.overlap(player, playerGroup, function(player1, player2) {
            // On empêche un joueur de frapper un ennemi plus d'une fois par attaque
            if (playersHit.indexOf(player2.user.username) === -1) {
                Game.hitEnemy(player1.user.username, player2.user.username);
                // On push l'ennemi touché dans une liste
                playersHit.push(player2.user.username);
            }
        });
    }

    // Collision entre le joueur et les éléments du décor
    game.physics.arcade.collide(player, layer);

    // Collision entre le joueur et une area
    game.physics.arcade.collide(player, areas.area1.sprite);
    game.physics.arcade.collide(player, areas.area2.sprite);
    game.physics.arcade.collide(player, areas.area3.sprite);
    game.physics.arcade.collide(player, areas.area4.sprite);

    // Collision entre le joueur et les marchands
    game.physics.arcade.collide(player, merchants.saint);
    game.physics.arcade.collide(player, merchants.zombie);

    // Collision autour des marchands pour afficher le shop
    if (!shops[player.faction.name].isActive) {
        game.physics.arcade.overlap(player, merchHitboxes[player.faction.name], function() {
            shops[player.faction.name].isActive = true;
            Game.showShop();
        });
    }
    else {
        if (!game.physics.arcade.overlap(player, merchHitboxes[player.faction.name])) {
            shops[player.faction.name].isActive = false;
            Game.closeShop();
        }
    }

    // Empêche l'accès au joueur à la safezone de la faction adverse
    if (player.faction.name === 'saint') {
      game.physics.arcade.collide(player, safeZones.zombie);
    }
    else {
      game.physics.arcade.collide(player, safeZones.saint);
    }

    // Ajout de point à un joueur sur une area définie
    //game.physics.arcade.overlap(areas.area1.hitbox, player, function() { addPointArea('ferme', areas.area1.sprite); }, null, this);
    // game.physics.arcade.overlap(areas.area2.hitbox, player, function() { addPointArea('bois', areas.area2.sprite); }, null, this);
    // game.physics.arcade.overlap(areas.area3.hitbox, player, function() { addPointArea('tour', areas.area3.sprite); }, null, this);
    // game.physics.arcade.overlap(areas.area4.hitbox, player, function() { addPointArea('moulin', areas.area4.sprite); }, null, this);

    // On attribue des points au joueur ainsi qu'à la zone en question
    // Arrivé à 25% (3 zones) le décompte s'arrête, la zone est capturée
    function addPointArea(areaName, area) {

        var faction = player.faction.name;
        if (
            (area[faction +'sPoint'] <= 10 && areas[area.key] !== faction)
        ) {
            if (capturTimer == true) {
                capturTimer = false;

                game.time.events.add(Phaser.Timer.SECOND / 5, function(){
                    $('.captur-progress').show();
                    player.area['a'+area.key[4]] += 0.2;
                    area[faction +'sPoint'] += 0.2;
                    $('.captur-fill').width(Math.floor(area[faction +'sPoint']*100/10)+'%');
                    //console.log(area[faction +'sPoint']);
                    capturTimer = true;
                }, this);
            }
        }
        else {
            $('#'+areaName).hide();
            (faction === 'saint')? $('#'+areaName+'-bleu').show() : $('#'+areaName+'-bleu').hide();
            (faction === 'zombie')? $('#'+areaName+'-rouge').show() : $('#'+areaName+'-rouge').hide();

            if (areas[area.key].status != faction) {
                factionPoints[player.faction.name] += 10;
                areas[area.key].status = faction;
                $('.captur-progress').hide();
            }
        }
    }

    var onArea = 0;
    game.physics.arcade.overlap(areas.area1.hitbox, player, function() {onArea = 1}, null, this);
    game.physics.arcade.overlap(areas.area2.hitbox, player, function() {onArea = 2}, null, this);
    game.physics.arcade.overlap(areas.area3.hitbox, player, function() {onArea = 3}, null, this);
    game.physics.arcade.overlap(areas.area4.hitbox, player, function() {onArea = 4}, null, this);

    if (onArea) {
      if (!playerOnArea) {
          playerOnArea = onArea;
          //console.log('on area' + onArea + ' !');
          Client.updatePlayerOnArea(playerOnArea);
      }
    }
    else if (playerOnArea) {
      //console.log('not on area' + playerOnArea + ' :(');
      Client.updatePlayerOffArea(playerOnArea);
      playerOnArea = 0;
    }

    ///////////////////////////// Fin: COLLISIONS /////////////////////////////
    ///////////////////////////////////////////////////////////////////////////



    ///////////////////////////////////////////////////////////////////////////
    ////////////////////////////// Début: INPUTS //////////////////////////////

    // Vélocité du joueur lorsqu'il ne bouge pas
    player.body.velocity.x = 0;
    player.body.velocity.y = 0;

    // On empêche le joueur de bouger s'il est mort
    if (player.data.isAlive) {
        // Lorsque le joueur appuis sur la touche '1' il utilise une potion
        // Ne se déclenche qu'une seule fois et cette fois-ci sans le booléen
        if (game.input.keyboard.justPressed(Phaser.Keyboard.ONE)) {
            Game.usePotion();
        }

        // On adapte la vitesse de déplacement lorsque le player se déplace en diagonale
        if ((cursors.up.isDown || cursors.down.isDown) && (cursors.left.isDown || cursors.right.isDown)) {
            var velocity = player.data.stats.spd*2 * 1/Math.sqrt(2);
        } else {
            var velocity = player.data.stats.spd*2;
        }

        if (game.input.activePointer.leftButton.isDown && !buttonsPressed.mouseLeft) {
            if (!attacking) {
                // On gère l'orientation de l'attaque ici
                player.animations.play('slash_' + orientation, '', false);
                Client.playerAttacked('slash');

                // Vaut true lorsque la touche à été préssée et false une fois relâché
                buttonsPressed.mouseLeft = true;
            }
        } else if (game.input.activePointer.leftButton.isUp && buttonsPressed.mouseLeft) {
            buttonsPressed.mouseLeft = false;
        }

        if (!attacking && cursors.left.isDown) {
            player.body.velocity.x = -velocity;

            // Empêche l'animation d'être jouée si haut ou bas est enfoncé
            // Sinon les animations s'alternent et la personnage sera bloqué frame 0
            if (cursors.up.isUp && cursors.down.isUp) {
                orientation = 'left';
                player.animations.play('walk_left');
            }
        }
        else if (!attacking && cursors.right.isDown) {
            player.body.velocity.x = +velocity;

            if (cursors.up.isUp && cursors.down.isUp) {
                orientation = 'right';
                player.animations.play('walk_right');
            }
        }

        if (!attacking && cursors.up.isDown) {
            player.body.velocity.y = -velocity;
            orientation = 'top';
            player.animations.play('walk_top');
        }
        else if (!attacking && cursors.down.isDown) {
            player.body.velocity.y = +velocity;
            orientation = 'bot';
            player.animations.play('walk_bot');
        }

        // Définie la position d'attente en fonction de la dernière orientation du joueur
        if (!attacking && cursors.left.isUp && cursors.right.isUp && cursors.up.isUp && cursors.down.isUp) {
            if (orientation === 'top') {
                player.animations.play('idle_top');
            }
            else if (orientation === 'left') {
                player.animations.play('idle_left');
            }
            else if (orientation === 'right') {
                player.animations.play('idle_right');
            }
            else {
                player.animations.play('idle_bot');
            }
            player.animations.stop();
        }
    }

    /////////////////////////////// Fin: INPUTS ///////////////////////////////
    ///////////////////////////////////////////////////////////////////////////



    ///////////////////////////////////////////////////////////////////////////
    /////////////////////////// Début: PLAYERS ANIMS //////////////////////////

    for (var otherPlayerName in Game.playerMap) {
      var otherPlayer = Game.playerMap[otherPlayerName];

      if (!otherPlayer.data.isAlive) {
      }
      else if (otherPlayer.attacking) {
      }
      else if (otherPlayer.oldPos.x === otherPlayer.data.pos.x && otherPlayer.oldPos.y === otherPlayer.data.pos.y) {
        otherPlayer.animations.play('idle_' + otherPlayer.orientation);
      }
      else if (otherPlayer.oldPos.y < otherPlayer.data.pos.y) {
        otherPlayer.animations.play('walk_bot');
        otherPlayer.orientation = 'bot';
      }
      else if (otherPlayer.oldPos.y > otherPlayer.data.pos.y) {
        otherPlayer.animations.play('walk_top');
        otherPlayer.orientation = 'top';
      }
      else if (otherPlayer.oldPos.x < otherPlayer.data.pos.x) {
        otherPlayer.animations.play('walk_right');
        otherPlayer.orientation = 'right';
      }
      else if (otherPlayer.oldPos.x > otherPlayer.data.pos.x) {
        otherPlayer.animations.play('walk_left');
        otherPlayer.orientation = 'left';
      }
    }

    //////////////////////////// Fin: PLAYERS ANIMS ///////////////////////////
    ///////////////////////////////////////////////////////////////////////////
};

Game.render = function() {
    // game.debug.body(player, "rgba(255, 0, 0, 0.3)");
    // game.debug.physicsGroup(playerGroup, "rgba(0, 0, 0, 0.3)");
    //
    // game.debug.body(areas.area1.sprite, "rgba(0, 0, 0, 0.3)");
    //
    // game.debug.body(areas.area1.hitbox, "rgba(0, 0, 0, 0.3)");
    // game.debug.body(areas.area2.hitbox, "rgba(0, 0, 0, 0.3)");
    // game.debug.body(areas.area3.hitbox, "rgba(0, 0, 0, 0.3)");
    // game.debug.body(areas.area4.hitbox, "rgba(0, 0, 0, 0.3)");
    // game.debug.body(areas.area4.hitbox, "rgba(0, 0, 0, 0.3)");
    //
    // // Deadzone
    // // game.debug.geom(game.camera.deadzone, '#0fffff', false);
    // game.debug.body(merchHitboxes.saint, "rgba(255, 0, 0, 0.3)", false);
    // game.debug.body(merchHitboxes.zombie, "rgba(255, 0, 0, 0.3)", false);
    //
    if (player.faction.name === 'saint') {
      game.debug.physicsGroup(safeZones.saint, "rgba(40, 255, 40, 0.2)", false);
      game.debug.physicsGroup(safeZones.zombie, "rgba(255, 40, 40, 0.2)", false);
    } else {
      game.debug.physicsGroup(safeZones.saint, "rgba(255, 40, 40, 0.2)", false);
      game.debug.physicsGroup(safeZones.zombie, "rgba(40, 255, 40, 0.2)", false);
    }
};

// Retire une potion de l'inventaire du joueur et le soigne
Game.usePotion = function() {
    if (player.data.inventory.potion > 0) {
        console.log('Potion used');
        if (player.data.stats.currenthp + 50 >= player.data.stats.maxhp) {
          player.data.stats.currenthp = player.data.stats.maxhp;
        }
        else {
          player.data.stats.currenthp += 50;
        }

        Client.playerUsePotion();
    }
    else {
        console.log('No potions left');
    }
};

// Ajoute le player par défaut sur la map (sans les données du serveur)
Game.addPlayer = function() {
    // player = game.add.sprite(defaultPlayerData.data.pos.x, defaultPlayerData.data.pos.y, 'player_' + defaultPlayerData.faction.name);
    player = game.add.sprite(defaultPlayerData.data.pos.x, defaultPlayerData.data.pos.y, 'player_' + defaultPlayerData.data.spriteName);
    player.anchor.set(0.5, 0.5);
    player.data = defaultPlayerData.data;
    player.faction = defaultPlayerData.faction;
    player.user = defaultPlayerData.user;

    var spawnPoint = Game.getPlayerSpawnPoint();
    player.x = spawnPoint.x;
    player.y = spawnPoint.y;

    game.physics.arcade.enable(player);
    player.body.collideWorldBounds = true;
    player.body.setSize(30, 50, player.width/2-15, player.height/2-25+6);

    Game.addPlayerAnimation(player);

    Game.updateHudStats();
    Game.updateHudLevelExpKD();
    Game.updateHudGoldPotion();
    Game.updateHudEquipment();

    player.headText = game.add.text(0, 0, player.user.username + '\n\u2764' + player.data.stats.currenthp);
    player.headText.align = 'center';
    player.headText.fontSize = '2em';
    player.headText.lineSpacing = -10;
    player.headText.addColor('#ff0000', player.user.username.length);
    player.headText.addColor('#ff6666', player.user.username.length + 1);
    player.headText.setShadow(1, 1, 'rgba(0, 0, 0, 1)', 0);

    player.headText.x = -player.headText.width/2;
    player.headText.y = -(player.height/2 + player.headText.height/2 + 4);
    player.addChild(player.headText);
};

// Décode l'atlas du sprite du joueur pour créer des animations
Game.addPlayerAnimation = function(sprite, other = false) {
    var idleTopAnim = sprite.animations.add('idle_top', Phaser.Animation.generateFrameNames('walk_top_', 0, 0, '', 2), 10, true);
    idleTopAnim.onStart.add(function() {
        // player.body.setSize(30, 50, player.width/2-15, player.height/2-25+6);
    }, this);
    var idleLeftAnim = sprite.animations.add('idle_left', Phaser.Animation.generateFrameNames('walk_left_', 0, 0, '', 2), 10, true);
    idleLeftAnim.onStart.add(function() {
        // player.body.setSize(30, 50, player.width/2-15, player.height/2-25+6);
    }, this);
    var idleBotAnim = sprite.animations.add('idle_bot', Phaser.Animation.generateFrameNames('walk_bot_', 0, 0, '', 2), 10, true);
    idleBotAnim.onStart.add(function() {
        // player.body.setSize(30, 50, player.width/2-15, player.height/2-25+6);
    }, this);
    var idleRightAnim = sprite.animations.add('idle_right', Phaser.Animation.generateFrameNames('walk_right_', 0, 0, '', 2), 10, true);
    idleRightAnim.onStart.add(function() {
        // player.body.setSize(30, 50, player.width/2-15, player.height/2-25+6);
    }, this);

    sprite.animations.add('spellcast_top', Phaser.Animation.generateFrameNames('spellcast_top_', 0, 6, '', 2), 10, true);
    sprite.animations.add('spellcast_left', Phaser.Animation.generateFrameNames('spellcast_left_', 0, 6, '', 2), 10, true);
    sprite.animations.add('spellcast_bot', Phaser.Animation.generateFrameNames('spellcast_bot_', 0, 6, '', 2), 10, true);
    sprite.animations.add('spellcast_right', Phaser.Animation.generateFrameNames('spellcast_right_', 0, 6, '', 2), 10, true);

    sprite.animations.add('walk_top', Phaser.Animation.generateFrameNames('walk_top_', 0, 8, '', 2), 10, true);
    sprite.animations.add('walk_left', Phaser.Animation.generateFrameNames('walk_left_', 0, 8, '', 2), 10, true);
    sprite.animations.add('walk_bot', Phaser.Animation.generateFrameNames('walk_bot_', 0, 8, '', 2), 10, true);
    sprite.animations.add('walk_right', Phaser.Animation.generateFrameNames('walk_right_', 0, 8, '', 2), 10, true);

    var hurtBotAnim = sprite.animations.add('hurt_bot', Phaser.Animation.generateFrameNames('hurt_bot_', 0, 5, '', 2), 10, false);
    // On réduit la hitbox des joueurs morts
    hurtBotAnim.onComplete.add(function() {
        if (!player.data.isAlive) {
            player.body.setSize(36, 36, 17, 28);
        }

        for (var otherPlayer in Game.playerMap) {
            if (Game.playerMap.hasOwnProperty(otherPlayer)) {
                if (!Game.playerMap[otherPlayer].data.isAlive) {
                    Game.playerMap[otherPlayer].body.setSize(36, 36, 17, 28);
                }
            }
        }
    }, this);

    //////////////////////////////// SLASH TOP ////////////////////////////////
    var slashTopAnim = sprite.animations.add('slash_top', Phaser.Animation.generateFrameNames('slash_top_', 0, 5, '', 2), 10, false);
    slashTopAnim.enableUpdate = true;
    slashTopAnim.onStart.add(function() {
        if (!other) {
          setTimeout(function(){ player.body.setSize(30, 50, player.width/2-15, player.height/2-25+6); }, 1);
          attacking = true;
        }
        else {
          setTimeout(function(){ sprite.body.setSize(30, 50, sprite.width/2-15, sprite.height/2-25+6); }, 1);
          sprite.attacking = true;
        }
    }, this);
    slashTopAnim.onUpdate.add(function() {
      // console.log('update');
      if (!other) {
        switch (player.animations.currentAnim._frameIndex) {
          case 1:
            player.body.setSize(30, 50, player.width/2-15, player.height/2-25+6);
            // console.log(player.animations.currentAnim.name + ' | frame: ' + player.animations.currentAnim._frameIndex);
            break;
          case 2:
            player.body.setSize(30, 50, player.width/2-15, player.height/2-25+6);
            // console.log(player.animations.currentAnim.name + ' | frame: ' + player.animations.currentAnim._frameIndex);
            break;
          case 3:
            player.body.setSize(55, 50, player.width/2-15-25, player.height/2-25+6);
            // console.log(player.animations.currentAnim.name + ' | frame: ' + player.animations.currentAnim._frameIndex);
            break;
          case 4:
            player.body.setSize(70, 68, player.width/2-15, player.height/2-25+6-18);
            // console.log(player.animations.currentAnim.name + ' | frame: ' + player.animations.currentAnim._frameIndex);
            break;
          case 5:
            player.body.setSize(78, 60, player.width/2-15, player.height/2-25+6-10);
            // console.log(player.animations.currentAnim.name + ' | frame: ' + player.animations.currentAnim._frameIndex);
            break;
          default:
            // console.log('anim frame unknown');
        }
      }
    }, this);
    slashTopAnim.onComplete.add(function() {
        if (!other) {
          setTimeout(function(){ player.body.setSize(30, 50, player.width/2-15, player.height/2-25+6); }, 1);
          attacking = false;
          playersHit.length = 0;
          setTimeout(function(){ Game.updatePlayerHeadText(); }, 1);
        }
        else {
          setTimeout(function(){ sprite.body.setSize(30, 50, sprite.width/2-15, sprite.height/2-25+6); }, 1);
          sprite.attacking = false;
          setTimeout(function(){ Game.updateOtherPlayerHeadText(sprite.user.username); }, 1);
        }
    }, this);

    //////////////////////////////// SLASH LEFT ///////////////////////////////
    var slashLeftAnim = sprite.animations.add('slash_left', Phaser.Animation.generateFrameNames('slash_left_', 0, 5, '', 2), 10, false);
    slashLeftAnim.enableUpdate = true;
    slashLeftAnim.onStart.add(function() {
        if (!other) {
          setTimeout(function(){ player.body.setSize(30, 50, player.width/2-15, player.height/2-25+6); }, 1);
          attacking = true;
        }
        else {
          setTimeout(function(){ sprite.body.setSize(30, 50, sprite.width/2-15, sprite.height/2-25+6); }, 1);
          sprite.attacking = true;
        }
    }, this);
    slashLeftAnim.onUpdate.add(function() {
      // console.log('update');
      if (!other) {
        switch (player.animations.currentAnim._frameIndex) {
          case 1:
            player.body.setSize(38, 50, player.width/2-15, player.height/2-25+6);
            // console.log(player.animations.currentAnim.name + ' | frame: ' + player.animations.currentAnim._frameIndex);
            break;
          case 2:
            player.body.setSize(38, 50, player.width/2-15, player.height/2-25+6);
            // console.log(player.animations.currentAnim.name + ' | frame: ' + player.animations.currentAnim._frameIndex);
            break;
          case 3:
            player.body.setSize(38, 50, player.width/2-15, player.height/2-25+6);
            // console.log(player.animations.currentAnim.name + ' | frame: ' + player.animations.currentAnim._frameIndex);
            break;
          case 4:
            player.body.setSize(94, 50, player.width/2-15-64, player.height/2-25+6);
            // console.log(player.animations.currentAnim.name + ' | frame: ' + player.animations.currentAnim._frameIndex);
            break;
          case 5:
            player.body.setSize(70, 50, player.width/2-15-40, player.height/2-25+6);
            // console.log(player.animations.currentAnim.name + ' | frame: ' + player.animations.currentAnim._frameIndex);
            break;
          default:
            // console.log('anim frame unknown');
        }
      }
    }, this);
    slashLeftAnim.onComplete.add(function() {
        if (!other) {
          setTimeout(function(){ player.body.setSize(30, 50, player.width/2-15, player.height/2-25+6); }, 1);
          attacking = false;
          playersHit.length = 0;
          setTimeout(function(){ Game.updatePlayerHeadText(); }, 1);
        }
        else {
          setTimeout(function(){ sprite.body.setSize(30, 50, sprite.width/2-15, sprite.height/2-25+6); }, 1);
          sprite.attacking = false;
          setTimeout(function(){ Game.updateOtherPlayerHeadText(sprite.user.username); }, 1);
        }
    }, this);

    //////////////////////////////// SLASH BOT ////////////////////////////////
    var slashBotAnim = sprite.animations.add('slash_bot', Phaser.Animation.generateFrameNames('slash_bot_', 0, 5, '', 2), 10, false);
    slashBotAnim.enableUpdate = true;
    slashBotAnim.onStart.add(function() {
        if (!other) {
          setTimeout(function(){ player.body.setSize(30, 50, player.width/2-15, player.height/2-25+6); }, 1);
          attacking = true;
        }
        else {
          setTimeout(function(){ sprite.body.setSize(30, 50, sprite.width/2-15, sprite.height/2-25+6); }, 1);
          sprite.attacking = true;
        }
    }, this);
    slashBotAnim.onUpdate.add(function() {
      // console.log('update');
      if (!other) {
        switch (player.animations.currentAnim._frameIndex) {
          case 1:
            player.body.setSize(30, 50, player.width/2-15, player.height/2-25+6);
            // console.log(player.animations.currentAnim.name + ' | frame: ' + player.animations.currentAnim._frameIndex);
            break;
          case 2:
            player.body.setSize(30, 50, player.width/2-15, player.height/2-25+6);
            // console.log(player.animations.currentAnim.name + ' | frame: ' + player.animations.currentAnim._frameIndex);
            break;
          case 3:
            player.body.setSize(55, 50, player.width/2-15-25, player.height/2-25+6);
            // console.log(player.animations.currentAnim.name + ' | frame: ' + player.animations.currentAnim._frameIndex);
            break;
          case 4:
            player.body.setSize(70, 68, player.width/2-15, player.height/2-25+6);
            // console.log(player.animations.currentAnim.name + ' | frame: ' + player.animations.currentAnim._frameIndex);
            break;
          case 5:
            player.body.setSize(78, 60, player.width/2-15, player.height/2-25+6);
            // console.log(player.animations.currentAnim.name + ' | frame: ' + player.animations.currentAnim._frameIndex);
            break;
          default:
            // console.log('anim frame unknown');
        }
      }
    }, this);
    slashBotAnim.onComplete.add(function() {
        if (!other) {
          setTimeout(function(){ player.body.setSize(30, 50, player.width/2-15, player.height/2-25+6); }, 1);
          attacking = false;
          playersHit.length = 0;
          setTimeout(function(){ Game.updatePlayerHeadText(); }, 1);
        }
        else {
          setTimeout(function(){ sprite.body.setSize(30, 50, sprite.width/2-15, sprite.height/2-25+6); }, 1);
          sprite.attacking = false;
          setTimeout(function(){ Game.updateOtherPlayerHeadText(sprite.user.username); }, 1);
        }
    }, this);

    /////////////////////////////// SLASH RIGHT ///////////////////////////////
    var slashRightAnim = sprite.animations.add('slash_right', Phaser.Animation.generateFrameNames('slash_right_', 0, 5, '', 2), 10, false);
    slashRightAnim.enableUpdate = true;
    slashRightAnim.onStart.add(function() {
        if (!other) {
          setTimeout(function(){ player.body.setSize(30, 50, player.width/2-15, player.height/2-25+6); }, 1);
          attacking = true;
        }
        else {
          setTimeout(function(){ sprite.body.setSize(30, 50, sprite.width/2-15, sprite.height/2-25+6); }, 1);
          sprite.attacking = true;
        }
    }, this);
    slashRightAnim.onUpdate.add(function() {
      // console.log('update');
      if (!other) {
        switch (player.animations.currentAnim._frameIndex) {
          case 1:
            player.body.setSize(38, 50, player.width/2-15-8, player.height/2-25+6);
            // console.log(player.animations.currentAnim.name + ' | frame: ' + player.animations.currentAnim._frameIndex);
            break;
          case 2:
            player.body.setSize(38, 50, player.width/2-15-8, player.height/2-25+6);
            // console.log(player.animations.currentAnim.name + ' | frame: ' + player.animations.currentAnim._frameIndex);
            break;
          case 3:
            player.body.setSize(38, 50, player.width/2-15-8, player.height/2-25+6);
            // console.log(player.animations.currentAnim.name + ' | frame: ' + player.animations.currentAnim._frameIndex);
            break;
          case 4:
            player.body.setSize(94, 50, player.width/2-15, player.height/2-25+6);
            // console.log(player.animations.currentAnim.name + ' | frame: ' + player.animations.currentAnim._frameIndex);
            break;
          case 5:
            player.body.setSize(70, 50, player.width/2-15, player.height/2-25+6);
            // console.log(player.animations.currentAnim.name + ' | frame: ' + player.animations.currentAnim._frameIndex);
            break;
          default:
            // console.log('anim frame unknown');
        }
      }
    }, this);
    slashRightAnim.onComplete.add(function() {
        if (!other) {
          setTimeout(function(){ player.body.setSize(30, 50, player.width/2-15, player.height/2-25+6); }, 1);
          attacking = false;
          playersHit.length = 0;
          setTimeout(function(){ Game.updatePlayerHeadText(); }, 1);
        }
        else {
          setTimeout(function(){ sprite.body.setSize(30, 50, sprite.width/2-15, sprite.height/2-25+6); }, 1);
          sprite.attacking = false;
          setTimeout(function(){ Game.updateOtherPlayerHeadText(sprite.user.username); }, 1);
        }
    }, this);
};

Game.addMerchants = function() {
    // Saint merchant
    merchants.saint = game.add.sprite(100, 1100, 'merch_saint');
    merchants.saint.frame = 18;
    game.physics.arcade.enable(merchants.saint);
    merchants.saint.body.allowGravity = false;
    merchants.saint.body.immovable = true;

    merchHitboxes.saint = game.add.sprite(merchants.saint.x-17, merchants.saint.y-17, null);
    game.physics.enable(merchHitboxes.saint, Phaser.Physics.ARCADE);
    merchHitboxes.saint.body.setSize(
        merchants.saint.width+34, merchants.saint.height+34,
        0, 0
    );
    merchHitboxes.saint.name = "merch_saint_hitbox";

    // Zombie merchant
    merchants.zombie = game.add.sprite(2300, 1100, 'merch_zombie');
    merchants.zombie.frame = 18;
    game.physics.arcade.enable(merchants.zombie);
    merchants.zombie.body.allowGravity = false;
    merchants.zombie.body.immovable = true;

    merchHitboxes.zombie = game.add.sprite(merchants.zombie.x-17, merchants.zombie.y-17, null);
    game.physics.enable(merchHitboxes.zombie, Phaser.Physics.ARCADE);
    merchHitboxes.zombie.body.setSize(
        merchants.zombie.width+34, merchants.zombie.height+34,
        0, 0
    );
    merchHitboxes.zombie.name = "merch_zombie_hitbox";
};

Game.addShops = function() {
    var shopDiv = document.createElement('div');
    var width = '350';
    var height = '500';

    shopDiv.id = player.faction.name + 'Shop';
    shopDiv.style.display = 'none';
    shopDiv.style.overflowX = 'hidden';
    shopDiv.style.overflowY = 'auto';
    shopDiv.style.backgroundColor = 'rgba(255, 224, 177, 0.5)';
    shopDiv.style.borderTop = '8px ridge rgba(81, 39, 17, 0.75)';
    shopDiv.style.borderLeft = '8px ridge rgba(81, 39, 17, 0.75)';
    shopDiv.style.borderRight = '8px groove rgba(81, 39, 17, 0.75)';
    shopDiv.style.borderBottom = '8px groove rgba(81, 39, 17, 0.75)';
    shopDiv.style.boxShadow = '0 0 18px #888888';
    shopDiv.style.position = 'absolute';
    shopDiv.style.left = player.faction.name === 'saint' ? '200px' : '550px';
    shopDiv.style.top = '50px';
    shopDiv.style.height = height + 'px';
    shopDiv.style.width = width + 'px';

    var shopTitle = document.createElement('h1');
    var capitalizedFaction = player.faction.name.charAt(0).toUpperCase() + player.faction.name.slice(1);
    shopTitle.textContent = capitalizedFaction + 's\'s shop';
    shopTitle.style.textAlign = 'center';

    shopDiv.appendChild(shopTitle);

    var shopContent = shops[player.faction.name].content;

    Object.keys(shopContent).forEach(function(category) {
        var categoryTitle = document.createElement('h5');
        categoryTitle.style.marginTop = '10px';
        categoryTitle.textContent = '~ ' + category.charAt(0).toUpperCase() + category.slice(1) + 's ~';
        categoryTitle.style.textAlign = 'center';
        shopDiv.appendChild(categoryTitle);

        Object.keys(shopContent[category]).forEach(function(item) {
            var itemData = shopContent[category][item];

            var itemDiv = document.createElement('div');
            itemDiv.id = item;
            itemDiv.dataset.category = category;
            itemDiv.style.display = 'flex';
            itemDiv.style.justifyContent = 'space-around';
            itemDiv.style.alignItems = 'center';
            itemDiv.style.position = 'relative';
            itemDiv.style.backgroundColor = 'gainsboro';
            itemDiv.style.border = '2px solid black';
            itemDiv.style.borderRadius = '2px';
            itemDiv.style.boxSizing = 'border-box';
            itemDiv.style.margin = 'auto';
            itemDiv.style.marginTop = '6px';
            itemDiv.style.width = '90%';
            itemDiv.style.height = '50px';

            var itemImageDiv = document.createElement('div');
            itemImageDiv.style.backgroundImage = 'url("../../assets/images/shop/' + itemData.img + '")';
            itemImageDiv.style.backgroundRepeat = 'no-repeat';
            itemImageDiv.style.backgroundPosition = 'center';
            itemImageDiv.style.display = 'inline-block';
            // itemImageDiv.style.padding = '4px';
            itemImageDiv.style.width = '15%';
            itemImageDiv.style.height = '100%';
            itemImageDiv.style.textAlign = 'center';
            itemImageDiv.style.lineHeight = '46px';

            var itemNameDiv = document.createElement('div');
            itemNameDiv.textContent = itemData.name;
            itemNameDiv.style.display = 'inline-block';
            itemNameDiv.style.fontWeight = 'bold';
            itemNameDiv.style.textSize = '20px';
            itemNameDiv.style.width = '70%';
            itemNameDiv.style.height = '100%';
            itemNameDiv.style.textAlign = 'center';
            itemNameDiv.style.lineHeight = '46px';

            var itemPriceDiv = document.createElement('div');
            itemPriceDiv.textContent = itemData.price;
            itemPriceDiv.style.display = 'inline-block';
            itemPriceDiv.style.backgroundImage = 'url("../../assets/images/shop/gold-small.png")';
            itemPriceDiv.style.backgroundRepeat = 'no-repeat';
            itemPriceDiv.style.backgroundPosition = 'center';
            itemPriceDiv.style.fontWeight = 'bold';
            itemPriceDiv.style.textShadow = '0 0 20px #ffffff, 0 0 20px #ffffff, 0 0 20px #ffffff';
            itemPriceDiv.style.width = '15%';
            itemPriceDiv.style.height = '100%';
            itemPriceDiv.style.textAlign = 'center';
            itemPriceDiv.style.lineHeight = '46px';

            itemDiv.appendChild(itemImageDiv);
            itemDiv.appendChild(itemNameDiv);
            itemDiv.appendChild(itemPriceDiv);

            var tooltip = document.createElement('span');
            if (itemData.stats === undefined) {
                tooltip.textContent = itemData.description;
            }
            else {
                var statsItem = '';
                Object.keys(itemData.stats).forEach(function(stat) {
                    statsItem += itemData.stats[stat] > 0 ? (stat + ':+' + itemData.stats[stat] + ' ') : '';
                    statsItem += itemData.stats[stat] < 0 ? (stat + ':' + itemData.stats[stat] + ' ') : '';
                });
                if (statsItem.length > 0) {
                    statsItem = statsItem.slice(0, -1);
                }

                tooltip.innerHTML =
                '<p style="padding: 0; margin-bottom: 0;">' + itemData.description + '</p>' +
                '<p style="padding: 0; padding-top: 4px; margin-bottom: 0;">' + statsItem + '</p>'
                ;
            }
            tooltip.style.visibility = 'hidden';
            tooltip.style.width = '200px';
            tooltip.style.backgroundColor = 'black';
            tooltip.style.color = '#fff';
            tooltip.style.textAlign = 'center';
            tooltip.style.borderRadius = '2px';
            tooltip.style.padding = '5px 0';
            tooltip.style.position = 'absolute';
            tooltip.style.left = 90 + 'px';
            tooltip.style.bottom = 50 + 'px';
            tooltip.style.zIndex = '1';

            $(itemDiv).hover(function() {
                $(this).find('span').css('visibility', 'visible');
                $(this).css('box-shadow', '0 0 6px #444444');
                $(this).css('cursor', 'pointer');
            }, function() {
                $(this).find('span').css('visibility', 'hidden');
                $(this).css('box-shadow', 'none');
                $(this).css('cursor', 'default');
            });

            $(itemDiv).on('click', function(evt) {
                var itemTarget = $(evt.target);

                if (itemTarget[0].id !== '') {
                    Game.buyItemFromShop(itemTarget[0].id, itemTarget[0].dataset.category);
                }
                else {
                    Game.buyItemFromShop(itemTarget.parent()[0].id, itemTarget.parent()[0].dataset.category);
                }
            });

            itemDiv.appendChild(tooltip);

            shopDiv.appendChild(itemDiv);
        });
    });

    document.querySelector('#gameCanvas').appendChild(shopDiv);

    // $('#saintShop').on('click', Game.closeShop);
};

Game.addSellEquipmentWindow = function() {
  // DIV principale
  var sellDiv = document.createElement('div');
  var width = '250';
  var height = '250';

  sellDiv.id = 'sellEquipmentWindow';
  sellDiv.style.display = 'none';
  sellDiv.style.backgroundColor = 'rgba(255, 224, 177, 0.5)';
  sellDiv.style.borderTop = '8px ridge rgba(81, 39, 17, 0.75)';
  sellDiv.style.borderLeft = '8px ridge rgba(81, 39, 17, 0.75)';
  sellDiv.style.borderRight = '8px groove rgba(81, 39, 17, 0.75)';
  sellDiv.style.borderBottom = '8px groove rgba(81, 39, 17, 0.75)';
  sellDiv.style.boxShadow = '0 0 18px #888888';
  sellDiv.style.position = 'absolute';
  sellDiv.style.left = player.faction.name === 'saint' ? '560px' : '290px';
  sellDiv.style.top = '50px';
  sellDiv.style.minHeight = height + 'px';
  sellDiv.style.width = width + 'px';
  sellDiv.style.paddingBottom = '10px';

  var sellTitle = document.createElement('h1');
  sellTitle.textContent = 'Equipment';
  sellTitle.style.textAlign = 'center';

  sellDiv.appendChild(sellTitle);

  // Titre weapon
  var weaponTitle = document.createElement('h5');
  weaponTitle.textContent = '~ Weapon ~';
  weaponTitle.style.textAlign = 'center';
  weaponTitle.style.marginTop = '10px';

  sellDiv.appendChild(weaponTitle);

  // DIV weapon
  var weaponDiv = document.createElement('div');
  weaponDiv.id = 'weaponEquipment';
  weaponDiv.dataset.category = 'weapon';
  weaponDiv.style.display = 'flex';
  weaponDiv.style.justifyContent = 'space-around';
  weaponDiv.style.alignItems = 'center';
  weaponDiv.style.position = 'relative';
  weaponDiv.style.backgroundColor = 'gainsboro';
  weaponDiv.style.border = '2px solid black';
  weaponDiv.style.borderBottom = 'none';
  weaponDiv.style.borderTopLeftRadius = '20px';
  weaponDiv.style.borderTopRightRadius = '4px';
  weaponDiv.style.boxSizing = 'border-box';
  weaponDiv.style.margin = 'auto';
  weaponDiv.style.marginTop = '6px';
  weaponDiv.style.width = '90%';
  weaponDiv.style.height = '50px';

  var weaponImageDiv = document.createElement('div');
  weaponImageDiv.style.backgroundImage = 'url("../../assets/images/shop/unknown-small.png")';
  weaponImageDiv.style.backgroundRepeat = 'no-repeat';
  weaponImageDiv.style.backgroundPosition = 'center';
  weaponImageDiv.style.display = 'inline-block';
  // weaponImageDiv.style.padding = '4px';
  weaponImageDiv.style.width = '20%';
  weaponImageDiv.style.height = '100%';
  weaponImageDiv.style.textAlign = 'center';
  weaponImageDiv.style.lineHeight = '46px';

  var weaponNameDiv = document.createElement('div');
  weaponNameDiv.id = 'weaponSellName';
  weaponNameDiv.textContent = 'no weapon';
  weaponNameDiv.style.display = 'inline-block';
  weaponNameDiv.style.fontWeight = 'bold';
  weaponNameDiv.style.textSize = '20px';
  weaponNameDiv.style.width = '80%';
  weaponNameDiv.style.height = '100%';
  weaponNameDiv.style.textAlign = 'center';
  weaponNameDiv.style.lineHeight = '46px';

  weaponDiv.appendChild(weaponImageDiv);
  weaponDiv.appendChild(weaponNameDiv);
  sellDiv.appendChild(weaponDiv);

  var weaponDiv2 = document.createElement('div');
  weaponDiv2.id = 'weaponSellDiv';
  weaponDiv2.dataset.category = 'weapon';
  weaponDiv2.style.display = 'flex';
  weaponDiv2.style.justifyContent = 'space-around';
  weaponDiv2.style.alignItems = 'center';
  weaponDiv2.style.position = 'relative';
  weaponDiv2.style.backgroundColor = 'gainsboro';
  weaponDiv2.style.border = '2px solid black';
  weaponDiv2.style.borderTop = 'none';
  weaponDiv2.style.borderBottomLeftRadius = '4px';
  weaponDiv2.style.borderBottomRightRadius = '20px';
  weaponDiv2.style.boxSizing = 'border-box';
  weaponDiv2.style.margin = 'auto';
  // weaponDiv2.style.marginTop = '6px';
  weaponDiv2.style.width = '90%';
  weaponDiv2.style.height = '50px';

  var weaponSellDiv = document.createElement('div');
  weaponSellDiv.style.display = 'inline-block';
  weaponSellDiv.style.fontWeight = 'bold';
  weaponSellDiv.style.textSize = '20px';
  weaponSellDiv.style.width = '50%';
  weaponSellDiv.style.height = '100%';
  weaponSellDiv.style.textAlign = 'center';
  weaponSellDiv.style.lineHeight = '46px';

  var weaponSellButton = document.createElement('span');
  weaponSellButton.id = 'weaponSellButton';
  weaponSellButton.dataset.name = 'none';
  weaponSellButton.textContent = 'SELL';
  weaponSellButton.style.color = 'white';
  weaponSellButton.style.backgroundColor = '#6666FF';
  weaponSellButton.style.padding = '4px 8px';
  weaponSellButton.style.borderRadius = '4px';
  weaponSellButton.style.cursor = 'pointer';

  weaponSellDiv.appendChild(weaponSellButton);

  var weaponSellPriceDiv = document.createElement('div');
  weaponSellPriceDiv.id = 'weaponSellPrice';
  weaponSellPriceDiv.textContent = '?';
  weaponSellPriceDiv.style.display = 'inline-block';
  weaponSellPriceDiv.style.backgroundImage = 'url("../../assets/images/shop/gold-small.png")';
  weaponSellPriceDiv.style.backgroundRepeat = 'no-repeat';
  weaponSellPriceDiv.style.backgroundPosition = 'center';
  weaponSellPriceDiv.style.fontWeight = 'bold';
  weaponSellPriceDiv.style.textShadow = '0 0 20px #ffffff, 0 0 20px #ffffff, 0 0 20px #ffffff';
  weaponSellPriceDiv.style.width = '50%';
  weaponSellPriceDiv.style.height = '100%';
  weaponSellPriceDiv.style.textAlign = 'center';
  weaponSellPriceDiv.style.lineHeight = '46px';

  weaponDiv2.appendChild(weaponSellDiv);
  weaponDiv2.appendChild(weaponSellPriceDiv);
  sellDiv.appendChild(weaponDiv2);


  // Titre armor
  var armorTitle = document.createElement('h5');
  armorTitle.textContent = '~ Armor ~';
  armorTitle.style.textAlign = 'center';
  armorTitle.style.marginTop = '10px';

  sellDiv.appendChild(armorTitle);

  // DIV armor
  var armorDiv = document.createElement('div');
  armorDiv.id = 'armorEquipment';
  armorDiv.dataset.category = 'armor';
  armorDiv.style.display = 'flex';
  armorDiv.style.justifyContent = 'space-around';
  armorDiv.style.alignItems = 'center';
  armorDiv.style.position = 'relative';
  armorDiv.style.backgroundColor = 'gainsboro';
  armorDiv.style.border = '2px solid black';
  armorDiv.style.borderBottom = 'none';
  armorDiv.style.borderTopLeftRadius = '20px';
  armorDiv.style.borderTopRightRadius = '4px';
  armorDiv.style.boxSizing = 'border-box';
  armorDiv.style.margin = 'auto';
  armorDiv.style.marginTop = '6px';
  armorDiv.style.width = '90%';
  armorDiv.style.height = '50px';

  var armorImageDiv = document.createElement('div');
  armorImageDiv.style.backgroundImage = 'url("../../assets/images/shop/unknown-small.png")';
  armorImageDiv.style.backgroundRepeat = 'no-repeat';
  armorImageDiv.style.backgroundPosition = 'center';
  armorImageDiv.style.display = 'inline-block';
  // armorImageDiv.style.padding = '4px';
  armorImageDiv.style.width = '20%';
  armorImageDiv.style.height = '100%';
  armorImageDiv.style.textAlign = 'center';
  armorImageDiv.style.lineHeight = '46px';

  var armorNameDiv = document.createElement('div');
  armorNameDiv.id = 'armorSellName';
  armorNameDiv.textContent = 'no armor';
  armorNameDiv.style.display = 'inline-block';
  armorNameDiv.style.fontWeight = 'bold';
  armorNameDiv.style.textSize = '20px';
  armorNameDiv.style.width = '80%';
  armorNameDiv.style.height = '100%';
  armorNameDiv.style.textAlign = 'center';
  armorNameDiv.style.lineHeight = '46px';

  armorDiv.appendChild(armorImageDiv);
  armorDiv.appendChild(armorNameDiv);
  sellDiv.appendChild(armorDiv);

  var armorDiv2 = document.createElement('div');
  armorDiv2.id = 'armorSellDiv';
  armorDiv2.dataset.category = 'armor';
  armorDiv2.style.display = 'flex';
  armorDiv2.style.justifyContent = 'space-around';
  armorDiv2.style.alignItems = 'center';
  armorDiv2.style.position = 'relative';
  armorDiv2.style.backgroundColor = 'gainsboro';
  armorDiv2.style.border = '2px solid black';
  armorDiv2.style.borderTop = 'none';
  armorDiv2.style.borderBottomLeftRadius = '4px';
  armorDiv2.style.borderBottomRightRadius = '20px';
  armorDiv2.style.boxSizing = 'border-box';
  armorDiv2.style.margin = 'auto';
  // armorDiv2.style.marginTop = '6px';
  armorDiv2.style.width = '90%';
  armorDiv2.style.height = '50px';

  var armorSellDiv = document.createElement('div');
  armorSellDiv.style.display = 'inline-block';
  armorSellDiv.style.fontWeight = 'bold';
  armorSellDiv.style.textSize = '20px';
  armorSellDiv.style.width = '50%';
  armorSellDiv.style.height = '100%';
  armorSellDiv.style.textAlign = 'center';
  armorSellDiv.style.lineHeight = '46px';

  var armorSellButton = document.createElement('span');
  armorSellButton.id = 'armorSellButton';
  armorSellButton.dataset.name = 'none';
  armorSellButton.textContent = 'SELL';
  armorSellButton.style.color = 'white';
  armorSellButton.style.backgroundColor = '#6666FF';
  armorSellButton.style.padding = '4px 8px';
  armorSellButton.style.borderRadius = '4px';
  armorSellButton.style.cursor = 'pointer';

  armorSellDiv.appendChild(armorSellButton);

  var armorSellPriceDiv = document.createElement('div');
  armorSellPriceDiv.id = 'armorSellPrice';
  armorSellPriceDiv.textContent = '?';
  armorSellPriceDiv.style.display = 'inline-block';
  armorSellPriceDiv.style.backgroundImage = 'url("../../assets/images/shop/gold-small.png")';
  armorSellPriceDiv.style.backgroundRepeat = 'no-repeat';
  armorSellPriceDiv.style.backgroundPosition = 'center';
  armorSellPriceDiv.style.fontWeight = 'bold';
  armorSellPriceDiv.style.textShadow = '0 0 20px #ffffff, 0 0 20px #ffffff, 0 0 20px #ffffff';
  armorSellPriceDiv.style.width = '50%';
  armorSellPriceDiv.style.height = '100%';
  armorSellPriceDiv.style.textAlign = 'center';
  armorSellPriceDiv.style.lineHeight = '46px';

  armorDiv2.appendChild(armorSellDiv);
  armorDiv2.appendChild(armorSellPriceDiv);
  sellDiv.appendChild(armorDiv2);

  document.querySelector('#gameCanvas').appendChild(sellDiv);

  // Events sur les boutons
  $('#weaponSellButton').on('click', Game.sellWeapon);
  $('#armorSellButton').on('click', Game.sellArmor);
}

Game.addAreas = function() {
    areas.area1.sprite = game.add.sprite(650, 1200, 'area1');
    game.physics.enable(areas.area1.sprite);
    areas.area1.sprite.body.allowGravity = false;
    areas.area1.sprite.body.immovable = true;
    areas.area1.sprite.body.setSize(75, 77, 0, 0);
    areas.area1.sprite.saintsPoint = 0;
    areas.area1.sprite.zombiesPoint = 0;
    areas.area1.sprite.status = 'neutral';
    areas.area1.hitbox = game.add.sprite(575, 1125, 'area-hitbox');
    game.physics.arcade.enable(areas.area1.hitbox);

    areas.area2.sprite = game.add.sprite(1200, 1800, 'area2');
    game.physics.enable(areas.area2.sprite);
    areas.area2.sprite.body.allowGravity = false;
    areas.area2.sprite.body.immovable = true;
    areas.area2.sprite.body.setSize(80, 75, 0, 0);
    areas.area2.sprite.saintsPoint = 0;
    areas.area2.sprite.zombiesPoint = 0;
    areas.area2.sprite.status = 'neutral';
    areas.area2.hitbox = game.add.sprite(1125, 1725, 'area-hitbox');
    game.physics.arcade.enable(areas.area2.hitbox);


    areas.area3.sprite = game.add.sprite(1200, 600, 'area3');
    game.physics.enable(areas.area3.sprite);
    areas.area3.sprite.body.allowGravity = false;
    areas.area3.sprite.body.immovable = true;
    areas.area3.sprite.body.setSize(75, 77, 0, 0);
    areas.area3.sprite.saintsPoint = 0;
    areas.area3.sprite.zombiesPoint = 0;
    areas.area3.sprite.status = 'neutral';
    areas.area3.hitbox = game.add.sprite(1125, 525, 'area-hitbox');
    game.physics.arcade.enable(areas.area3.hitbox);

    areas.area4.sprite = game.add.sprite(1750, 1200, 'area4');
    game.physics.enable(areas.area4.sprite);
    areas.area4.sprite.body.allowGravity = false;
    areas.area4.sprite.body.immovable = true;
    areas.area4.sprite.body.setSize(75, 92, 0, 0);
    areas.area4.sprite.saintsPoint = 0;
    areas.area4.sprite.zombiesPoint = 0;
    areas.area4.sprite.status = 'neutral';
    areas.area4.hitbox = game.add.sprite(1675, 1125, 'area-hitbox');
    game.physics.arcade.enable(areas.area4.hitbox);
};

Game.addSafeZones = function() {
    safeZones.saint = game.add.group();
    safeZones.saint.enableBody = true;
    var safeSaint = safeZones.saint.create(0, 900, null);
    safeSaint.body.immovable = true;
    safeSaint.body.setSize(300, 600, 0, 0);

    safeZones.zombie = game.add.group();
    safeZones.zombie.enableBody = true;
    var safeZombie = safeZones.zombie.create(2100, 900, null);
    safeZombie.body.immovable = true;
    safeZombie.body.setSize(300, 600, 0, 0);
};

// Met à jour le texte au dessus de player
Game.updatePlayerHeadText = function() {
    if (player.data.isAlive) {
        player.headText.text = player.user.username + '\n\u2764' + player.data.stats.currenthp;
    }
    else {
        player.headText.text = player.user.username + '\n\u2764' + 'dead';
    }

    if (!attacking) {
      player.headText.x = -player.headText.width/2;
      player.headText.y = -(player.height/2 + player.headText.height/2 + 4);
    }
    else {
      player.headText.x = -player.headText.width/2;
      player.headText.y = -(player.height/2 + player.headText.height/2 + 4) + 64;
    }
};

// Met à jour le texte au dessus d'un autre joueur
Game.updateOtherPlayerHeadText = function(username) {
    var otherPlayer = Game.playerMap[username];

    if (otherPlayer.faction.name === player.faction.name) {
      if (otherPlayer.data.isAlive) {
        otherPlayer.headText.text = otherPlayer.user.username + '\n\u2764' + otherPlayer.data.stats.currenthp;
      }
      else {
        otherPlayer.headText.text = otherPlayer.user.username + '\n\u2764' + 'dead';
      }

      if (!otherPlayer.attacking) {
        otherPlayer.headText.x = -otherPlayer.headText.width/2;
        otherPlayer.headText.y = -(otherPlayer.height/2 + otherPlayer.headText.height/2) - 4;
      }
      else {
        otherPlayer.headText.x = -otherPlayer.headText.width/2;
        otherPlayer.headText.y = -(otherPlayer.height/2 + otherPlayer.headText.height/2) - 4 + 64;
      }
    }
    else {
      if (otherPlayer.data.isAlive) {
        otherPlayer.headText.text = otherPlayer.user.username;
      }
      else {
        otherPlayer.headText.text = otherPlayer.user.username + ' (dead)';
      }

      if (!otherPlayer.attacking) {
        otherPlayer.headText.x = -otherPlayer.headText.width/2;
        otherPlayer.headText.y = -(otherPlayer.height/2 + otherPlayer.headText.height/2);
      }
      else {
        otherPlayer.headText.x = -otherPlayer.headText.width/2;
        otherPlayer.headText.y = -(otherPlayer.height/2 + otherPlayer.headText.height/2) + 64;
      }
    }
};

Game.captureProgress = function (faction, points, area){
  (faction === 'saint')? bg = 'rgba(30, 144, 255, 0.6)' : bg = 'rgba(165, 42, 42, 0.6)';
  //console.log(area);
  $('.captur-progress-'+area).show();
  $('.captur-fill-'+area).width(Math.floor(points*100/15)+'%').css("background-color", bg);
}

Game.captureOff = function (faction, points, area){
  $('.captur-progress-'+area).hide();
  $('.captur-fill-'+area).width('0%');
}

Game.captureDone = function (faction, area, areaNumber){
  // console.log(faction);
  // console.log(area);
  $('#'+area).hide();
  (faction === 'saint')? $('#'+area+'-bleu').show() : $('#'+area+'-bleu').hide();
  (faction === 'zombie')? $('#'+area+'-rouge').show() : $('#'+area+'-rouge').hide();

  $('.captur-progress-'+area).hide();

  Client.updateFactionPoints();
}

Game.factionsScore = function (faction, score){
  factionPoints[faction] = score;

  $('.'+faction+'s-progress-bar').width(Math.floor(factionPoints[faction]) + '%');
  $('.'+faction+'sPoint').text(Math.floor(factionPoints[faction] * 3));
}

// Ouvre la fenêtre du marchand des Saints
Game.showShop = function() {
    var shop = document.querySelector('#' + player.faction.name + 'Shop');
    var sellEquipment = document.querySelector('#sellEquipmentWindow');

    if (shop !== null) {
      shop.style.display = 'block';
      sellEquipment.style.display = 'block';
    }
};

Game.buyItemFromShop = function(itemName, itemCategory) {
    var playerGold = player.data.inventory.gold;
    var itemInShop = shops[player.faction.name].content[itemCategory][itemName];

    if (playerGold >= itemInShop.price) {
        if (itemCategory === 'weapon' && player.data.inventory.equipment.weapon !== null) {
            console.log('You can\'t buy a weapon (' + itemName + ') if you already have one (' + player.data.inventory.equipment.weapon + ')!');
        }
        else if (itemCategory === 'armor' && player.data.inventory.equipment.armor !== null) {
            console.log('You can\'t buy an armor (' + itemName + ') if you already have one (' + player.data.inventory.equipment.armor + ')!');
        }
        else {
            Client.buyItemFromShop(itemName, itemCategory);
        }
    }
    else {
        console.log('You are too poor to buy a ' + itemInShop.name + '!');
    }
};

Game.sellWeapon = function() {
  Client.sellWeaponFromEquipment();
}

Game.sellArmor = function() {
  Client.sellArmorFromEquipment();
}

Game.updateSellEquipmentDiv = function() {
  if (player.data.inventory.equipment.weapon !== null) {
    $('#weaponSellName').text(shops[player.faction.name].content.weapon[player.data.inventory.equipment.weapon].name);
    $('#weaponSellPrice').text(Math.floor(shops[player.faction.name].content.weapon[player.data.inventory.equipment.weapon].price / 2));
    $('#weaponSellButton').attr('data-name', player.data.inventory.equipment.weapon);
  } else {
    $('#weaponSellName').text('no weapon');
    $('#weaponSellPrice').text('0');
    $('#weaponSellButton').attr('data-name', 'none');
  }

  if (player.data.inventory.equipment.armor !== null) {
    $('#armorSellName').text(shops[player.faction.name].content.armor[player.data.inventory.equipment.armor].name);
    $('#armorSellPrice').text(Math.floor(shops[player.faction.name].content.armor[player.data.inventory.equipment.armor].price / 2));
    $('#armorSellButton').attr('data-name', player.data.inventory.equipment.armor);
  } else {
    $('#armorSellName').text('no armor');
    $('#armorSellPrice').text('0');
    $('#armorSellButton').attr('data-name', 'none');
  }
}

// Ferme la fenêtre du magasin du marchand
Game.closeShop = function(evt = null) {
    // On test si le shop est ouvert
    if (player.faction.name === 'saint') {
        if (!document.getElementById('saintShop')) {
            return;
        }
    }
    else if (player.faction.name === 'zombie') {
        if (!document.getElementById('zombieShop')) {
            return;
        }
    }

    // Si l'event est null, c'est à dire qu'il ne provient pas d'un click souris
    if (evt === null) {
        if (player.faction.name === 'saint') {
            document.getElementById('saintShop').style.display = 'none';
        }
        else if (player.faction.name === 'zombie') {
            document.getElementById('zombieShop').style.display = 'none';
        }

        document.getElementById('sellEquipmentWindow').style.display = 'none';

        return;
    }

    // On récupère la position de la sourie lors du click
    var clickX = (evt.pageX - $('#saintShop').offset().left);
    var clickY = (evt.pageY - $('#saintShop').offset().top);

    // On récupère la largeur + hauteur du shop
    var divWidth = document.getElementById('saintShop').offsetWidth;
    var divHeight = document.getElementById('saintShop').offsetHeight;

    // On test s'il a cliqué sur la croix pour fermer le shop
    if (clickX >= divWidth-30 && clickX <= divWidth && clickY >= 0 && clickY <= 30) {
        document.getElementById('saintShop').style.display = 'none';
    }
};

// Ajoute sur la map les autres joueurs (ils seront stockés dans Game.playerMap)
Game.addNewPlayer = function(data) {
    var newPlayerUsername = data.user.username;

    // On ajoute des données au sprite
    // Game.playerMap[newPlayerUsername] = game.add.sprite(data.data.pos.x, data.data.pos.y, 'player_' + data.faction.name);
    Game.playerMap[newPlayerUsername] = game.add.sprite(data.data.pos.x, data.data.pos.y, 'player_' + data.data.spriteName);
    Game.playerMap[newPlayerUsername].data = data.data;
    Game.playerMap[newPlayerUsername].faction = data.faction;
    Game.playerMap[newPlayerUsername].user = data.user;

    var newPlayer = Game.playerMap[newPlayerUsername];

    game.physics.arcade.enable(newPlayer);
    newPlayer.anchor.set(0.5, 0.5);
    newPlayer.body.collideWorldBounds = true;
    newPlayer.body.setSize(30, 50, newPlayer.width/2-15, newPlayer.height/2-25+6);

    Game.addPlayerAnimation(newPlayer, true);

    if (newPlayer.faction.name === player.faction.name) {
      newPlayer.headText = game.add.text(0, 0, newPlayer.user.username + '\n\u2764' + newPlayer.data.stats.currenthp);
      newPlayer.headText.align = 'center';
      newPlayer.headText.fontSize = '2em';
      newPlayer.headText.lineSpacing = -10;
      newPlayer.headText.addColor('#6666ff', 0);
      newPlayer.headText.addColor('#ff0000', newPlayer.user.username.length);
      newPlayer.headText.addColor('#ff6666', newPlayer.user.username.length + 1);
      newPlayer.headText.setShadow(1, 1, 'rgba(0, 0, 0, 1)', 0);

      newPlayer.headText.x = -newPlayer.headText.width/2;
      newPlayer.headText.y = -(newPlayer.height/2 + newPlayer.headText.height/2) - 4;
    }
    else {
      newPlayer.headText = game.add.text(0, 0, newPlayer.user.username);
      newPlayer.headText.fontSize = '2em';
      newPlayer.headText.addColor('#ff6666', 0);
      newPlayer.headText.setShadow(1, 1, 'rgba(0, 0, 0, 1)', 0);

      newPlayer.headText.x = -newPlayer.headText.width/2;
      newPlayer.headText.y = -(newPlayer.height/2 + newPlayer.headText.height/2);
    }

    newPlayer.addChild(newPlayer.headText);

    newPlayer.orientation = 'bot';
    newPlayer.attacking = false;
    newPlayer.oldPos = {
      x: 0,
      y: 0
    };
    newPlayer.animations.play('idle_bot');
    newPlayer.animations.stop();

    // On ajoute le joueur au groupe
    playerGroup.add(newPlayer);
    // On passe tous les membres du groupe en immovable pour éviter qu'ils partent
    // dans le décors lorsque deux joueurs entrent en collision
    playerGroup.setAll('body.immovable', true);
};

// Met à jour l'inventaire du joueur (après un achat par exemple)
Game.updatePlayerInventory = function(inventory) {
    player.data.inventory = inventory;
    Game.updateHudGoldPotion();
    Game.updateHudEquipment();
    Game.updateSellEquipmentDiv();
};

// Met à jour les potions du joueur
Game.updatePlayerPotion = function(potionCount) {
    player.data.inventory.potion = potionCount;
    Game.updateHudGoldPotion();
};

// Met à jour les golds du joueur
Game.updatePlayerGold = function(goldCount) {
    player.data.inventory.gold = goldCount;
    Game.updateHudGoldPotion();
};

// Met à jour les golds d'un autre joueur
Game.updateOtherPlayerGold = function(username, goldCount) {
    Game.playerMap[username].data.inventory.gold = goldCount;
};

// Met à jour l'exp et le level du player
Game.updatePlayerExp = function(level, exp, toNextExp) {
    player.data.level = level;
    player.data.exp = exp;
    player.data.toNextExp = toNextExp;
    Game.updateHudLevelExpKD();
};

// Met à jour les stats du joueur (après un coup reçu par exemple)
Game.updatePlayerStats = function(stats) {
    player.data.stats = stats;
    Game.updatePlayerHeadText();
    Game.updateHudStats();
    Game.updateHudGoldPotion();
};

// On met à jour la position des autres joueurs en fonction des données reçu du serveur
Game.updateOtherPlayersPos = function(username, x, y) {
    if (Game.playerMap !== undefined && Game.playerMap[username] !== undefined) {
      Game.playerMap[username].oldPos.x = Game.playerMap[username].data.pos.x;
      Game.playerMap[username].oldPos.y = Game.playerMap[username].data.pos.y;

      Game.playerMap[username].data.pos.x = x;
      Game.playerMap[username].data.pos.y = y;

      // Game.playerMap[username].x = Game.playerMap[username].data.pos.x;
      // Game.playerMap[username].y = Game.playerMap[username].data.pos.y;

      // Déplace le joueur de façon plus fluide que simplement changer les positions
      game.add.tween(Game.playerMap[username]).to({x: Game.playerMap[username].data.pos.x, y: Game.playerMap[username].data.pos.y}, 50, Phaser.Easing.Linear.None, true, 0);
    }
};

// On met à jour l'inventaire des sprites des autres joueurs
Game.updateOtherPlayerInventory = function(username, inventory) {
    Game.playerMap[username].data.inventory = inventory;
};

// On met à jour les stats des sprites des autres joueurs
Game.updateOtherPlayerStats = function(username, stats) {
    Game.playerMap[username].data.stats = stats;
    Game.updateOtherPlayerHeadText(username);
};

// On met à jour l'exp et le level des sprites des autres joueurs
Game.updateOtherPlayerExp = function(username, level, exp, toNextExp) {
    Game.playerMap[username].data.level = level;
    Game.playerMap[username].data.exp = exp;
    Game.playerMap[username].data.toNextExp = toNextExp;
};

// On informe les autres joueurs qu'une capture de zone est en cours
Game.updateOtherPlayerOnArea = function(faction, points, area) {
    Game.captureProgress(faction, points, area);
    //console.log(username);
    //console.log(points);
};

// On informe les autres joueurs qu'une capture de zone est délaissée
Game.updateOtherPlayerOffArea = function(faction, points, area) {
    Game.captureOff(faction, points, area);
};

// On informe les autres joueurs qu'une zone a été capturée
Game.updateOtherPlayerAreaCaptured = function(faction, area, areaNumber) {
  Game.captureDone(faction, area, areaNumber);
};

// On informe les autres joueurs qu'une zone a été capturée
Game.updateFactionsScore = function(faction, score) {
  Game.factionsScore(faction, score);
};

// On informe les joueurs que la partie est finie
Game.updateGameEnding = function(win) {
  game.paused = true;
  game.input.enabled = false;
  player.body.velocity.x = 0;
  player.body.velocity.y = 0;
  var message = '';
  (player.faction.name === win)? message = 'You Win !' : message = 'You Lose !';
  $('#gameEnding').text(message);
  $('#gameEnding').removeClass('d-none').addClass('d-flex');
};
// Met à jour le niveau, l'exp to next level, kill and deaths dans le HUD en bas au milieu
Game.updateHudLevelExpKD = function() {
  if (player.data.level !== undefined) {
    $('#hudBotMid #levelAvatar .user.level').text(player.data.level);
  } else {
    $('#hudBotMid #levelAvatar .user.level').text('error');
  }

  if (player.data.toNextExp !== undefined) {
    $('#hudBotMid #levelAvatar .user.next-level-exp').text(player.data.toNextExp);
  } else {
    $('#hudBotMid #levelAvatar .user.next-level-exp').text('error');
  }

  if (player.data.kills !== undefined) {
    $('#hudBotMid #killsDeaths .kills-value').text(player.data.kills);
  } else {
    $('#hudBotMid #killsDeaths .kills-value').text('error');
  }

  if (player.data.deaths !== undefined) {
    $('#hudBotMid #killsDeaths .deaths-value').text(player.data.deaths);
  } else {
    $('#hudBotMid #killsDeaths .deaths-value').text('error');
  }
}

// Met à jour les stats du joueur dans le HUD en bas à droite
Game.updateHudStats = function() {
  if (player.data.stats.currenthp !== undefined) {
    $('#hudBotRight #playerStats .hp-value .current-hp').text(player.data.stats.currenthp);
  } else {
    $('#hudBotRight #playerStats .hp-value .current-hp').text('error');
  }

  if (player.data.stats.maxhp !== undefined) {
    $('#hudBotRight #playerStats .hp-value .max-hp').text(player.data.stats.maxhp);
  } else {
    $('#hudBotRight #playerStats .hp-value .max-hp').text('error');
  }

  if (player.data.stats.atk !== undefined) {
    $('#hudBotRight #playerStats .atk-value').text(player.data.stats.atk);
  } else {
    $('#hudBotRight #playerStats .atk-value').text('error');
  }

  if (player.data.stats.def !== undefined) {
    $('#hudBotRight #playerStats .def-value').text(player.data.stats.def);
  } else {
    $('#hudBotRight #playerStats .def-value').text('error');
  }

  if (player.data.stats.spd !== undefined) {
    $('#hudBotRight #playerStats .spd-value').text(player.data.stats.spd);
  } else {
    $('#hudBotRight #playerStats .spd-value').text('error');
  }
}

// Met à jour les golds et les potions du joueur dans le HUD en bas à droite
Game.updateHudGoldPotion = function() {
  if (player.data.inventory.gold !== undefined) {
    $('#hudBotRight #playerGoldsPotions .golds-value').text(player.data.inventory.gold);
  } else {
    $('#hudBotRight #playerGoldsPotions .golds-value').text('error');
  }

  if (player.data.inventory.potion !== undefined) {
    $('#hudBotRight #playerGoldsPotions .potions-value').text(player.data.inventory.potion);
  } else {
    $('#hudBotRight #playerGoldsPotions .potions-value').text('error');
  }
}

// Met à jour l'équipement du joueur dans le HUD en bas à droite
Game.updateHudEquipment = function() {
  if (player.data.inventory.equipment.weapon !== undefined && player.data.inventory.equipment.weapon !== null) {
    $('#hudBotRight #playerEquipment .weapon-name').text(shops[player.faction.name].content.weapon[player.data.inventory.equipment.weapon].name);
  }
  if (player.data.inventory.equipment.armor !== undefined && player.data.inventory.equipment.armor !== null) {
    $('#hudBotRight #playerEquipment .armor-name').text(shops[player.faction.name].content.armor[player.data.inventory.equipment.armor].name);
  }
}

// Fais jouer l'animation d'attaque d'un autre joueur
Game.playOtherPlayerAttack = function(username, attackName) {
  Game.playerMap[username].animations.play(attackName + '_' + Game.playerMap[username].orientation);
}

// Indique au serveur que le player à infligé des dégâts à un ennemi
Game.hitEnemy = function(p1Username, p2Username) {
  // Empêche les alliés de s'infliger des dégâts
  if (Game.playerMap[p2Username].faction.name === player.faction.name) {
    return;
  }

  // Test si l'enemy frappé est déjà mort
  if (Game.playerMap[p2Username].data.stats.currenthp <= 0) {
      return;
  }

  console.log(p1Username + ' hit ' + p2Username + '(frame: ' + player.animations.currentAnim.name + ' ' + player.animations.currentAnim._frameIndex + ')');
  Client.hitEnemy(p1Username, p2Username);
};

// Passe l'état 'isAlive' du player à false et déclenche son animation de mort
Game.playerDead = function(username) {
    player.data.isAlive = false;
    player.animations.play('hurt_bot', false);
};

// Passe l'état 'isAlive' du joueur à false et déclenche son animation de mort
Game.otherPlayerDead = function(username) {
    Game.playerMap[username].data.isAlive = false;
    Game.playerMap[username].animations.play('hurt_bot', false);

    game.time.events.add(5000, function() {
        Game.respawnCountdownOver(username);
    }, this);
};

// Met à jour les kills et deaths du player
Game.updatePlayerKillsDeaths = function(kills, deaths) {
  player.data.kills = kills;
  player.data.deaths = deaths;
  Game.updateHudLevelExpKD();
}

// Met à jour les kills et deaths d'un autre joueur
Game.updateOtherPlayerKillsDeaths = function(username, kills, deaths) {
  Game.playerMap[username].data.kills = kills;
  Game.playerMap[username].data.deaths = deaths;
}

// Demande au serveur de respawn un joueur
Game.respawnCountdownOver = function(username, hp) {
    Client.revivePlayer(username);
};

Game.getPlayerSpawnPoint = function() {
  var points = {
    x: 0,
    y: 0
  };

  if (player.faction.name === 'saint') {
      // Saint's safe zone
      switch (player.faction.slot) {
        case 1:
          points.x = spawnPoints.s1.x;
          points.y = spawnPoints.s1.y;
          break;
        case 2:
          points.x = spawnPoints.s2.x;
          points.y = spawnPoints.s2.y;
          break;
        case 3:
          points.x = spawnPoints.s3.x;
          points.y = spawnPoints.s3.y;
          break;
        default:
          points.x = 0;
          points.y = 0;
      }
  }
  else if (player.faction.name === 'zombie') {
      // Zombie's safe zone
      switch (player.faction.slot) {
        case 1:
          points.x = spawnPoints.z1.x;
          points.y = spawnPoints.z1.y;
          break;
        case 2:
          points.x = spawnPoints.z2.x;
          points.y = spawnPoints.z2.y;
          break;
        case 3:
          points.x = spawnPoints.z3.x;
          points.y = spawnPoints.z3.y;
          break;
        default:
          points.x = 0;
          points.y = 0;
      }
  }

  return points;
};

Game.getOtherPlayerSpawnPoint = function(otherPlayer) {
  var points = {
    x: 0,
    y: 0
  };

  if (otherPlayer.faction.name === 'saint') {
      // Saint's safe zone
      switch (otherPlayer.faction.slot) {
        case 1:
          points.x = spawnPoints.s1.x;
          points.y = spawnPoints.s1.y;
          break;
        case 2:
          points.x = spawnPoints.s2.x;
          points.y = spawnPoints.s2.y;
          break;
        case 3:
          points.x = spawnPoints.s3.x;
          points.y = spawnPoints.s3.y;
          break;
        default:
          points.x = 0;
          points.y = 0;
      }
  }
  else if (otherPlayer.faction.name === 'zombie') {
      // Zombie's safe zone
      switch (otherPlayer.faction.slot) {
        case 1:
          points.x = spawnPoints.z1.x;
          points.y = spawnPoints.z1.y;
          break;
        case 2:
          points.x = spawnPoints.z2.x;
          points.y = spawnPoints.z2.y;
          break;
        case 3:
          points.x = spawnPoints.z3.x;
          points.y = spawnPoints.z3.y;
          break;
        default:
          points.x = 0;
          points.y = 0;
      }
  }

  return points;
};

// Respawn le player
Game.respawnPlayer = function(hp) {
    player.data.isAlive = true;
    player.data.stats.currenthp = hp;

    Game.updateHudStats();

    orientation = 'bot';
    player.body.setSize(30, 50, player.width/2-15, player.height/2-25+6);

    var spawnPoint = Game.getPlayerSpawnPoint();
    player.x = spawnPoint.x;
    player.y = spawnPoint.y;

    Game.updatePlayerHeadText();
};

// Respawn un joueur
Game.respawnOtherPlayer = function(username, hp) {
    Game.playerMap[username].data.isAlive = true;
    Game.playerMap[username].data.stats.currenthp = hp;

    var spawnPoint = Game.getOtherPlayerSpawnPoint(Game.playerMap[username]);
    Game.playerMap[username].x = spawnPoint.x;
    Game.playerMap[username].y = spawnPoint.y;

    Game.playerMap[username].animations.play('idle_bot', false);
    Game.playerMap[username].body.setSize(30, 50, player.width/2-15, player.height/2-25+6);

    Game.updateOtherPlayerHeadText(username);
};

// On supprime un joueur de Game.playerMap et de la map lorsqu'il se déconnecte
Game.removePlayer = function(username) {
  if (Game.playerMap.hasOwnProperty(username)) {
    Game.playerMap[username].destroy();
    delete Game.playerMap[username];
  }
};
