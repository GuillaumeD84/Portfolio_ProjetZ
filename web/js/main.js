function initGame(data) {
    defaultPlayerData = data.player;
    shops = data.shops;
    dataMap = data.map;
    game = new Phaser.Game(800, 600, Phaser.AUTO, 'gameCanvas');
    game.state.add('Game', Game);
    game.state.start('Game');
};
