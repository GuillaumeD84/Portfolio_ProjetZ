var app = {
    statList: {
        hp: 'hit_point',
        atk: 'attack',
        def: 'defense',
        spd: 'speed'
    },
    actualRemainingPoints: null,
    remainingPoints: null,
    actualStatBonus: {
        hp: null,
        atk: null,
        def: null,
        spd: null
    },
    statBonus: {
        hp: null,
        atk: null,
        def: null,
        spd: null
    },
    bonusToAdd: {
        hp: 0,
        atk: 0,
        def: 0,
        spd: 0
    },
    dirty: false,
    init: function() {
        console.log('%c Script %cprofileBonusStats.js%c loaded successfully ', 'background: #222; color: #bada55;', 'background: #222; color: orange; font-weight: bold;', 'background: #222; color: #bada55;');

        // Récupère les stats par défaut du joueur
        app.setDefaultValues();

        // Ajoute un event sur les + après 1 sec
        // fontawesome transform les <i> en <svg> lors du chargement
        // D'où l'attente forcée de 1 sec
        setTimeout(function() {
            $('.bonus-add-btn').on('click', app.addStat);
        }, 500);

        // Event sur le bouton de sauvegarde pour mettre à jour la base de données
        $('.save-bonus-stat-btn').on('click', app.saveChanges);

        // Ajoute un event sur le bouton d'annulation des modifications
        $('.cancel-bonus-stat-btn').on('click', app.cancelChanges);
    },
    // Récupère les valeurs par défaut contenues dans le front
    setDefaultValues: function() {
        app.actualRemainingPoints = parseInt($('#remainingPoints').text());
        app.remainingPoints = app.actualRemainingPoints;

        app.actualStatBonus.hp = parseInt($('#bonusHp .bonus-value').text());
        app.actualStatBonus.atk = parseInt($('#bonusAtk .bonus-value').text());
        app.actualStatBonus.def = parseInt($('#bonusDef .bonus-value').text());
        app.actualStatBonus.spd = parseInt($('#bonusSpd .bonus-value').text());

        app.statBonus.hp = app.actualStatBonus.hp;
        app.statBonus.atk = app.actualStatBonus.atk;
        app.statBonus.def = app.actualStatBonus.def;
        app.statBonus.spd = app.actualStatBonus.spd;

        console.log(
            'Remaining points [' + app.actualRemainingPoints + ']  | ',
            'hp = +' + app.actualStatBonus.hp + '%,',
            'atk = +' + app.actualStatBonus.atk + '%,',
            'def = +' + app.actualStatBonus.def + '%,',
            'spd = +' + app.actualStatBonus.spd + '%',
        );
    },
    // Ajoute 1 point dans la stat choisie
    addStat: function(evt) {
        var statToUpgrade = app.getStat(evt.target);

        if (statToUpgrade !== 'undefined') {
            $('#remainingPoints').text(--app.remainingPoints);
            app.statBonus[statToUpgrade]++;
            app.bonusToAdd[statToUpgrade]++;
            app.dirty = true;
        }

        app.updateDisplay();
    },
    // Envoi une requête AJAX pour mettre à jour la base de données
    saveChanges: function(evt) {
        $('.saving-in-progress').show();

        app.dirty = false;
        app.updateDisplay();

        $.ajax({
            url: evt.target.dataset.updateStats,
            method: 'POST',
            data: app.bonusToAdd,
        })
            .done(function(result) {
                // console.log(result.data);
                // console.log(result.statsAdded);

                $('.saving-in-progress').hide();
                app.updateData();
            })
            .fail(function(result) {
                console.log('AJAX request failed');
            });
    },
    // Retourne le string de la statistique à augmenter ('hp', 'atk', etc ...)
    getStat: function(targetBtn) {
        if (targetBtn.classList.contains('bonus-add-btn')) {
            var btnPressed = targetBtn;
        }
        else {
            var btnPressed = targetBtn.parentElement;
        }

        // console.log(btnPressed.nodeName);
        var statSelected = btnPressed.parentElement.parentElement.id;
        var statToUpgrade = '';

        switch(statSelected) {
            case 'bonusHp':
                statToUpgrade = 'hp';
                break;
            case 'bonusAtk':
                statToUpgrade = 'atk';
                break;
            case 'bonusDef':
                statToUpgrade = 'def';
                break;
            case 'bonusSpd':
                statToUpgrade = 'spd';
                break;
            default:
                statToUpgrade = 'undefined';
        }

        return statToUpgrade;
    },
    // Annule les changements
    cancelChanges: function() {
        app.dirty = false;

        app.remainingPoints = app.actualRemainingPoints;
        $('#remainingPoints').text(app.actualRemainingPoints);

        app.statBonus.hp = app.actualStatBonus.hp;
        app.statBonus.atk = app.actualStatBonus.atk;
        app.statBonus.def = app.actualStatBonus.def;
        app.statBonus.spd = app.actualStatBonus.spd;

        $.each(app.bonusToAdd, function(key, value) {
            app.bonusToAdd[key] = 0;
        });

        app.updateDisplay();
    },
    // Met à jour l'affichage
    updateDisplay: function() {
        if (app.dirty) {
            $('#saveBonusStatRow').show();
        }
        else {
            $('#saveBonusStatRow').hide();
        }

        $('#bonusHp .bonus-value').text(app.statBonus.hp);
        $('#bonusAtk .bonus-value').text(app.statBonus.atk);
        $('#bonusDef .bonus-value').text(app.statBonus.def);
        $('#bonusSpd .bonus-value').text(app.statBonus.spd);

        if (app.remainingPoints <= 0) {
            $('.bonus-add-btn').hide();
        }
        else if (app.remainingPoints > 0) {
            $('.bonus-add-btn').show();
        }
    },
    // Met à jour les données sauvegardées côté front après une requête AJAX
    updateData: function() {
        $.each(app.bonusToAdd, function(key, value) {
            app.bonusToAdd[key] = 0;
        });

        app.actualStatBonus.hp = app.statBonus.hp;
        app.actualStatBonus.atk = app.statBonus.atk;
        app.actualStatBonus.def = app.statBonus.def;
        app.actualStatBonus.spd = app.statBonus.spd;

        app.actualRemainingPoints = app.remainingPoints;
    }
};

$(app.init);
