<?php

namespace AppBundle\DataFixtures;

use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\Persistence\ObjectManager;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;

use AppBundle\Service\Slugger;

use Faker;

use AppBundle\Entity\Role;
use AppBundle\Entity\User;

class AppFixtures extends Fixture
{
    private $encoder;
    private $slugger;

    public function __construct(UserPasswordEncoderInterface $encoder, Slugger $slugger)
    {
        $this->encoder = $encoder;
        $this->slugger = $slugger;
    }

    public function load(ObjectManager $manager)
    {
        // On crée une instance de Faker en anglais
        $generator = Faker\Factory::create('en_EN');

        // On passe le Manager de Doctrine à Faker !
        $populator = new Faker\ORM\Doctrine\Populator($generator, $manager);

        // Role
        $roles = array('admin', 'manager', 'user');
        $rolesEntities = array();

        for ($i=0; $i < count($roles); $i++) {
            $role = new Role();
            $role->setStatus('ROLE_'.strtoupper($roles[$i]));

            $rolesEntities[] = $role;
            $manager->persist($role);
        }

        // User
        $users = array('admin', 'manager', 'user', 'simon', 'romain', 'guillaume');
        $usersEntities = array();

        for ($i=0; $i < count($users); $i++) {
            $user = new User();
            $user->setUsername($users[$i]);
            $user->setEmail(strtolower($users[$i]).'.email@projetz.com');
            $user->setPassword($this->encoder->encodePassword($user, $users[$i]));
            $user->setIsActive(true);

            $user->setExperience(mt_rand(1, 10000));
            $user->setAttack(0);
            $user->setDefense(0);
            $user->setHitPoint(0);
            $user->setSpeed(0);

            if ($i <= 2) {
                $user->setRole($rolesEntities[$i]);
            } else {
                $user->setRole($rolesEntities[2]);
                $usersEntities[] = $user;
            }

            $manager->persist($user);
        }

        $populator->addEntity('AppBundle\Entity\User', 20, array(
            'username' => function() use ($generator) { return strtolower($generator->unique()->firstName()); },
            'role' => $rolesEntities[2],
            'isActive' => true,
            'experience' => function() use ($generator) { return $generator->numberBetween(0, 10000); },
            'attack' => function() use ($generator) { return 0; },
            'defense' => function() use ($generator) { return 0; },
            'hitPoint' => function() use ($generator) { return 0; },
            'speed' => function() use ($generator) { return 0; },
        ),
        array(
            function($user) {
                $user->setEmail($user->getUsername().'.email@projetz.com');
                $user->setPassword($this->encoder->encodePassword($user, $user->getUsername()));
            },
        ));

        // Preset Sentence
        $populator->addEntity('AppBundle\Entity\PresetSentence', 10, array(
            'message' => function() use ($generator) { return $generator->unique()->sentence($nbWords = 6, $variableNbWords = true); },
            'targetEnnemies' => function() use ($generator) { return $generator->randomElement($array = array (true, false)); },
        ));

        // Faction
        $populator->addEntity('AppBundle\Entity\Faction', 2, array(
            'name' => function() use ($generator) { return $generator->unique()->randomElement($array = array ('Saint', 'Zombie')); },
            'baseAttack' => function() use ($generator) { return $generator->randomElement($array = array (80, 90, 100, 110, 120)); },
            'baseDefense' => function() use ($generator) { return $generator->randomElement($array = array (80, 90, 100, 110, 120)); },
            'baseHitPoint' => function() use ($generator) { return $generator->randomElement($array = array (80, 90, 100, 110, 120)); },
            'baseSpeed' => function() use ($generator) { return $generator->randomElement($array = array (80, 90, 100, 110, 120)); },
        ));

        // Item category
        $populator->addEntity('AppBundle\Entity\ItemCategory', 4, array(
            'name' => function() use ($generator) { return $generator->unique()->jobTitle(); },
        ));

        // Item
        $populator->addEntity('AppBundle\Entity\Item', 12, array(
            'name' => function() use ($generator) { return $generator->unique()->citySuffix(); },
            'bonusAttack' => function() use ($generator) { return $generator->randomElement($array = array (-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5)); },
            'bonusDefense' => function() use ($generator) { return $generator->randomElement($array = array (-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5)); },
            'bonusHitPoint' => function() use ($generator) { return $generator->randomElement($array = array (-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5)); },
            'bonusSpeed' => function() use ($generator) { return $generator->randomElement($array = array (-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5)); },
        ));

        // Finished Game
        $populator->addEntity('AppBundle\Entity\FinishedGame', 8, array(
            'title' => function() use ($generator) { return $generator->unique()->colorName(); },
            'playedAt' => function() use ($generator) { return $generator->dateTimeBetween($startDate = '-2 days', $endDate = '-1 day', $timezone = null); },
            'finishedAt' => function() use ($generator) { return $generator->dateTimeBetween($startDate = '-1 day', $endDate = 'now', $timezone = null); },
        ));

        // Players
        $populator->addEntity('AppBundle\Entity\Players', 48, array(
            'gold' => function() use ($generator) { return $generator->numberBetween($min = 1000, $max = 5000); },
            'killed' => function() use ($generator) { return $generator->numberBetween($min = 0, $max = 25); },
            'revive' => function() use ($generator) { return $generator->numberBetween($min = 0, $max = 25); },
            'death' => function() use ($generator) { return $generator->numberBetween($min = 0, $max = 25); },
            'level' => function() use ($generator) { return $generator->numberBetween($min = 5, $max = 15); },
        ));

        // // Ongoing Game
        // $populator->addEntity('AppBundle\Entity\OngoingGame', 5, array(
        //     'name' => function() use ($generator) { return $generator->unique()->colorName(); },
        //     'createdAt' => function() use ($generator) { return $generator->dateTimeBetween($startDate = '-1 hour', $endDate = 'now', $timezone = null); },
        //     ),
        //     array(
        //         function($ongoingGame) { $ongoingGame->setSlug($this->slugger->slugify($ongoingGame->getName())); },
        //     )
        // );

        $insertedEntities = $populator->execute();

        $insertedUser = $insertedEntities['AppBundle\Entity\User'];
        $insertedFaction = $insertedEntities['AppBundle\Entity\Faction'];
        $insertedFinishedGame = $insertedEntities['AppBundle\Entity\FinishedGame'];
        $insertedPlayers = $insertedEntities['AppBundle\Entity\Players'];

        // On distribue équitablement la faction dans laquelle se sont retrouvé les joueurs
        $chunckedPlayer = array_chunk($insertedPlayers, count($insertedPlayers)/2);

        for ($i=0; $i < 2; $i++) {
            for ($j=0; $j < count($chunckedPlayer[$i]); $j++) {
                $chunckedPlayer[$i][$j]->setFaction($insertedFaction[$i]);

            }
        }

        // On distribue équitablement les parties dans laquelle se sont retrouvé les joueurs
        $chunckedPlayer = array_chunk($insertedPlayers, count($insertedPlayers)/8);

        for ($i=0; $i < count($insertedFinishedGame); $i++) {
            for ($j=0; $j < count($chunckedPlayer[$i]); $j++) {
                $chunckedPlayer[$i][$j]->setFinishedGame($insertedFinishedGame[$i]);
            }
        }

        // user_user
        // Ajoute pour chaque joueur, 3 à 12 joueurs en favoris.
        foreach($insertedUser as $user) {
            // On fait une copie des joueurs ajoutés par faker
            $usersTemp = $insertedUser;
            // On choisi aléatoirement le nombre de joueur à ajouter
            $userFavCount = mt_rand(3, 12);
            for($i = 1; $i <= $userFavCount; $i++) {
                // On ajoute un joueur random en fav (qui n'est pas lui même)
                $randIndex = array_rand($usersTemp);
                if ($insertedUser[$randIndex] !== $user) {
                    $user->addFavoriteUser($insertedUser[$randIndex]);
                }
                // On le retire ensuite du tableau pour éviter les doublons
                unset($usersTemp[$randIndex]);
            }
        }

        // finished_game_players
        // On ajoute 6 joueurs, 3 saints et 3 zombies pour chaque partie
        // foreach($insertedFinishedGame as $game) {
        //     // On fait une copie des joueurs ajoutés par faker
        //     $saintsTemp = $chunckedPlayer[0];
        //     $zombiesTemp = $chunckedPlayer[1];
        //
        //     for($i = 1; $i <= 3; $i++) {
        //         // On ajoute un saint random à la partie
        //         $randIndex = array_rand($saintsTemp);
        //         $game->addPlayer($saintsTemp[$randIndex]);
        //         // On le retire ensuite du tableau pour éviter les doublons
        //         unset($saintsTemp[$randIndex]);
        //     }
        //
        //     for($i = 1; $i <= 3; $i++) {
        //         // On ajoute un zombie random à la partie
        //         $randIndex = array_rand($zombiesTemp);
        //         $game->addPlayer($zombiesTemp[$randIndex]);
        //         // On le retire ensuite du tableau pour éviter les doublons
        //         unset($zombiesTemp[$randIndex]);
        //     }
        // }

        $manager->flush();
    }
}
