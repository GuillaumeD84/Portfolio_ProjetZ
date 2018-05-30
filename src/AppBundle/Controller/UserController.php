<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\HttpFoundation\JsonResponse;

use AppBundle\Entity\User;
use AppBundle\Entity\Role;
use AppBundle\Entity\Players;
use AppBundle\Entity\FinishedGame;

use AppBundle\Utils\Math;
use AppBundle\Utils\Time;

/**
 * User controller.
 *
 * @Route("user")
 */
class UserController extends Controller
{
    /**
     * Finds and displays a user entity.
     *
     * @Route("/{username}", name="user_show", requirements={"username"="\w+"})
     * @Method("GET")
     */
    public function showAction(User $user)
    {
        $fav = $user->getFavoriteUsers();

        $level = Math::getLevelFromExperience($user->getExperience());
        $toNext = Math::getExperienceToReachNextLevel($user->getExperience());
        $remainingPoints = Math::getRemainingPointsToSpend($level, $user->getHitPoint(), $user->getAttack(), $user->getDefense(), $user->getSpeed());

        // Tableau indicatif de l'expérience a atteindre pour les premiers niveau
        // $levelling = [];
        // for ($i=0; $i < 50; $i++) {
        //     $levelling[$i+1] = floor(100*$i + pow($i, 2.5));
        // }
        //
        // dump($levelling);
        $duration = [];
        $gamePlayed = count($this->getDoctrine()->getRepository(Players::class)->findByUser($user));
        $players = $this->getDoctrine()->getRepository(Players::class)->findLastTenGames($user);
        foreach ($players as $i => $player) {
            $game = $player->getFinishedGame();
            $playedAt = $game->getPlayedAt();
            $finishedAt = $game->getFinishedAt();
            $duration[$i] = explode(':', Time::duration($playedAt, $finishedAt));
            foreach ($duration[$i] as $key => $value) {
                $value = intval($value);
                if ($value < 10) {
                    $duration[$i][$key] = '0'.$value;
                }
            }
            $duration[$i] = $duration[$i][0].':'.$duration[$i][1].':'.$duration[$i][2];
        }
        $victories = $this->getDoctrine()->getRepository(User::class)->findvictories($user)[0]['value'];
        $kills = $this->getDoctrine()->getRepository(User::class)->findTotalKilledEnnemies($user)[0];
        $deaths = $this->getDoctrine()->getRepository(User::class)->findTotalDeaths($user)[0];
        if ($deaths[1] == 0) {
            $deaths[1] = 1;
        }
        $kdRatio = $kills[1] / $deaths[1];


        return $this->render('user/profile.html.twig', array(
            'user' => $user,
            'favs' => $fav,
            'level' => $level,
            'toNext' => $toNext,
            'remainingPoints' => $remainingPoints,
            'gamePlayed' => $gamePlayed,
            'victories' => $victories,
            'kdRatio' => $kdRatio,
            'lastGames' => $players,
            'durations' => $duration,
        ));
    }

    /**
     * @Route("/signup", name="user_signup")
     * @Method("POST")
     */
    public function signupAction(Request $request, UserPasswordEncoderInterface $encoder)
    {
        $user = new User();

        $form = $this::createForm('AppBundle\Form\UserType', $user);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $em = $this->getDoctrine()->getManager();

            // Hash le mot de passe
            $encoded = $encoder->encodePassword($user, $user->getPassword());
            // Renseigne le nouveau mot de passe
            $user->setPassword($encoded);

            // valeur par defaut du role: ROLE_USER
            $roleRepository = $this->getDoctrine()->getRepository(Role::class);
            $roleUser = $roleRepository->findOneBy(['status' => 'ROLE_USER']);
            $user->setRole($roleUser);

            $user->setIsActive(true);
            // dump($user);

            $em->persist($user);
            $em->flush();

            return $this->redirectToRoute('homepage');
        }

        $this->addFlash('danger', 'All fields are required');

        return $this->redirectToRoute('homepage');
    }

    /**
     * @Route("/{id}/favorite/{idfav}", name="user_add_fav")
     * @ParamConverter("user", class="AppBundle:User", options={"id" = "id"})
     * @ParamConverter("fav", class="AppBundle:User", options={"id" = "idfav"})
     * @Method("GET")
     */
     public function addFav(Request $request, UserPasswordEncoderInterface $encoder, User $user, User $fav)
     {
         $user->addFavoriteUser($fav);

         $em = $this->getDoctrine()->getManager();
         $em->flush();

         $this->addFlash('success', $fav->getUsername().' has been added to your favorites');

         return $this->redirectToRoute('user_show', array('username' => $fav->getUsername()));
     }

    /**
     * @Route("/{id}/remove-favorite/{idfav}", name="user_remove_fav")
     * @ParamConverter("user", class="AppBundle:User", options={"id" = "id"})
     * @ParamConverter("fav", class="AppBundle:User", options={"id" = "idfav"})
     * @Method("GET")
     */
     public function removeFav(Request $request, UserPasswordEncoderInterface $encoder, User $user, User $fav)
     {
         $user->removeFavoriteUser($fav);

         $em = $this->getDoctrine()->getManager();
         $em->flush();

         $this->addFlash('success', $fav->getUsername().' has been removed from your favorites');

         return $this->redirectToRoute('user_show', array('username' => $fav->getUsername()));
     }

    /**
     * @Route("/{id}/update/email", name="user_update_email")
     * @Method("POST")
     */
     public function updateEmail(Request $request)
     {
         $userId = $request->request->get('id');
         $email = $request->request->get('email');

         $em = $this->getDoctrine()->getManager();
         $user = $this->getDoctrine()->getRepository(User::class)->findOneById($userId);
         $user->setEmail($email);

         $em->flush();

         return $this->json($user->getEmail());
     }

    /**
     * @Route("/search", name="user_search")
     * @Method("POST")
     */
    public function search(Request $request)
    {
        $data = [];
        $search = $request->request->get('string');

        if(!empty($search)) {
            $users = $this->getDoctrine()->getRepository(User::class)->findLikeUsername($search);

            foreach($users as $user) {
                $id = $user['id'];
                $username = $user['username'];
                $data[] = [
                    $id => $username
                ];
            }
        }

        return new JsonResponse($data);
    }

    /**
     * Met à jour la base lorsque le joueur modifie ses stats bonus dans son profil
     *
     * @Route("/update-stats", name="user_update_stats")
     * @Method("POST")
     */
    public function updateBonusStats(Request $request)
    {
        // Si la requête est une requête AJAX
        if ($request->isXmlHttpRequest()) {
            // On récupère le joueur connecté
            $user = $this->container->get('security.token_storage')->getToken()->getUser();

            // On calcul le niveau du joueur + les points qu'il lui reste à dépenser
            $userLevel = Math::getLevelFromExperience($user->getExperience());
            $remainingPoints = Math::getRemainingPointsToSpend($userLevel, $user->getHitPoint(), $user->getAttack(), $user->getDefense(), $user->getSpeed());

            // On compte le nombre de points à ajouter afin de tester
            // si le joueur n'essaie pas d'ajouter plus de point qu'il ne le peut
            $countBonusToAdd = $request->request->get('hp')
                + $request->request->get('atk')
                + $request->request->get('def')
                + $request->request->get('spd')
            ;

            // S'il lui reste des points et que le nombre à ajouter ne l'excède pas
            if ($remainingPoints > 0 && $countBonusToAdd <= $remainingPoints) {
                $em = $this->getDoctrine()->getManager();

                $user->setHitPoint($user->getHitPoint() + $request->request->get('hp'));
                $user->setAttack($user->getAttack() + $request->request->get('atk'));
                $user->setDefense($user->getDefense() + $request->request->get('def'));
                $user->setSpeed($user->getSpeed() + $request->request->get('spd'));

                $em->flush();

                return $this->json([
                    'data' => 'Stats saved successfully',
                    'statsAdded' => [
                        'hp' => intval($request->request->get('hp')),
                        'atk' => intval($request->request->get('atk')),
                        'def' => intval($request->request->get('def')),
                        'spd' => intval($request->request->get('spd')),
                    ],
                ]);
            } else {
                return $this->json([
                    'data' => 'Error while saving',
                    'statsAdded' => 'none',
                ]);
            }
        }
    }
}
