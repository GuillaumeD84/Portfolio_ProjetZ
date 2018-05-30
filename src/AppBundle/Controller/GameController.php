<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use AppBundle\Entity\OngoingGame;
use AppBundle\Utils\Math;
use AppBundle\Utils\Time;
use AppBundle\Service\Slugger;

class GameController extends Controller
{
    /**
    * Page de recherche de partie existante
    *
    * @Route("/game/search", name="game_search")
    */
    public function searchGameAction()
    {
        $games = $this->getDoctrine()->getRepository(OngoingGame::class)->findAll();

        return $this->render('game/search.html.twig', [
            'games' => $games,
        ]);
    }

    /**
    * Page de création d'une nouvelle partie
    *
    * @Route("/game/new", name="game_new")
    */
    public function newGameAction(Request $request, Slugger $slugger)
    {
        $game = new OngoingGame();
        $gameForm = $this::createForm('AppBundle\Form\GameType', $game);
        $gameForm->handleRequest($request);

        if ($gameForm->isSubmitted() && $gameForm->isValid()) {
            $em = $this->getDoctrine()->getManager();

            $game->setSlug($slugger->slugify($game->getName()));
            $game->setCreatedAt(new \Datetime());

            $em->persist($game);
            $em->flush();

            // $this->addFlash(
            //     'success',
            //     'The game "'. $game->getName() .'" has been successfully created!'
            // );

            return $this->redirectToRoute('game', array(
                'slug' => $game->getSlug(),
            ));
        }

        return $this->render('game/new.html.twig', array(
            'form' => $gameForm->createView(),
        ));
    }

    /**
    * Accède à la page d'une partie
    *
    * @Route("/game/fight/{slug}", name="game")
    */
    public function gameAction(OngoingGame $game = null, $slug)
    {
        if (!$this->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_FULLY')) {
            throw $this->createAccessDeniedException();
        }

        // Si la partie que le joueur essaie de rejoindre n'éxiste pas
        // on le redirige vers l'accueil
        if (empty($game)) {
            $this->addFlash(
                'warning',
                'The game "'. $slug .'" does not exist.'
            );

            return $this->redirectToRoute('homepage');
        }

        $user = $this->container->get('security.token_storage')->getToken()->getUser();

        // Test si le joueur est déjà présent en bdd dans la partie
        // en cas de bug ou d'erreur de non suppression lors de la déconnexion
        $isPlayerInGame = false;
        $slotGet = ['getSaint1', 'getSaint2', 'getSaint3', 'getZombie1', 'getZombie2', 'getZombie3'];
        $slotSet = ['setSaint1', 'setSaint2', 'setSaint3', 'setZombie1', 'setZombie2', 'setZombie3'];
        for ($i=0; $i < count($slotGet); $i++) {
            $functionGet = $slotGet[$i];
            $userSlot = $game->$functionGet();
            if ($userSlot === $user) {
                //dump($user->getUsername() . ' has been found at slot ' . ($i <= 2 ? 'saint'.($i+1) : 'zombie'.($i+1-3)));
                $isPlayerInGame = true;
                $slot = ($i <= 2 ? 's'.($i+1) : 'z'.($i+1-3));
                // $functionSet = $slotSet[$i];
                // $game->$functionSet(NULL);
            }
        }

        if (!$isPlayerInGame) {
          // Variables permettant de déterminer la faction et le slot d'un joueur
          $saintsCount = 0;
          $zombiesCount = 0;
          // Slots disponibles
          $saintsSlots = ['1' => 's1', '2' => 's2', '3' => 's3'];
          $zombiesSlots = ['1' => 'z1', '2' => 'z2', '3' => 'z3'];
          $factionList = array('Saint', 'Zombie');

          // On compte le nombre de 'saint' dans la partie
          // On retire des slots disponibles ceux déjà occupés
          if ($game->getSaint1() !== null) {
            $saintsCount++;
            unset($saintsSlots['1']);
          }
          if ($game->getSaint2() !== null) {
            $saintsCount++;
            unset($saintsSlots['2']);
          }
          if ($game->getSaint3() !== null) {
            $saintsCount++;
            unset($saintsSlots['3']);
          }

          // On compte le nombre de 'zombie' dans la partie
          // On retire des slots disponibles ceux déjà occupés
          if ($game->getZombie1() !== null) {
            $zombiesCount++;
            unset($zombiesSlots['1']);
          }
          if ($game->getZombie2() !== null) {
            $zombiesCount++;
            unset($zombiesSlots['2']);
          }
          if ($game->getZombie3() !== null) {
            $zombiesCount++;
            unset($zombiesSlots['3']);
          }

          // Si la partie est pleine on redirige vers la page de recherche d'une partie
          // Les autres boucles retournent s1, s2, s3, z1, z2 ou z3 correspondant
          // à la faction et au slot que le joueur occupera
          if ($saintsCount === 3 && $zombiesCount === 3) {
            $this->addFlash(
              'warning',
              'The game "'. $game->getName() .'" is full.'
            );

            return $this->redirectToRoute('game_search');
          } else if ($saintsCount === $zombiesCount) {
            $faction = $factionList[mt_rand(0, count($factionList) - 1)];
            if ($faction === 'Saint') {
              $slot = $saintsSlots[array_rand($saintsSlots)];
            } else {
              $slot = $zombiesSlots[array_rand($zombiesSlots)];
            }
          } else if ($saintsCount < $zombiesCount) {
            $faction = 'Saint';
            $slot = $saintsSlots[array_rand($saintsSlots)];
          } else {
            $faction = 'Zombie';
            $slot = $zombiesSlots[array_rand($zombiesSlots)];
          }

          // On met à jour la base de donnée en fonction du slot attribué
          $columnToUpdateFunction = 'set' . $faction . $slot[1];
          $game->$columnToUpdateFunction($user);

          $em = $this->getDoctrine()->getManager();
          $em->flush();
        }

        return $this->render('game/game.html.twig', array(
            'game' => $game,
            'playerSlot' => $slot
        ));
    }
}
