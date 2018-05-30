<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Symfony\Component\Validator\Constraints\DateTime;

use AppBundle\Entity\User;
use AppBundle\Entity\Role;

use AppBundle\Form\ContactType;

use AppBundle\Utils\Time;

class DefaultController extends Controller
{
    /**
     * Page d'accueil du site
     *
     * @Route("/", name="homepage")
     */
    public function indexAction()
    {
        $formSignUp = $this::createForm('AppBundle\Form\UserType');

        $em = $this->getDoctrine()->getManager();
        $lastOngoingGames = $em->getRepository('AppBundle:OngoingGame')->getLastCreatedGame(4);

        return $this->render('default/index.html.twig', array(
            'formSignUp' => $formSignUp->createView(),
            'lastOngoingGames' => $lastOngoingGames,
         ));
    }

    /**
     * Page contenant le formulaire de contact admin
     *
     * @Route("/contact", name="contact")
     */
    public function contactAction(Request $request, UserPasswordEncoderInterface $encoder, \Swift_Mailer $mailer)
    {
        $formSignUp = $this::createForm('AppBundle\Form\UserType');

        $isConnected = ($this->isGranted(['IS_AUTHENTICATED_FULLY'])) ? true : false;
        $formContact = $this->createForm(ContactType::class, null,
            array('isConnected' => $isConnected));
        $formContact->handleRequest($request);

        if ($formContact->isSubmitted() && $formContact->isValid()) {
            // on récupère les infos du formulaire
            $data = $formContact->getData();

            // $sender récupère les infos de l'expéditeur
            if($this->isGranted(['IS_AUTHENTICATED_FULLY'])){
                $nameSender = $this->getUser()->getUsername();
                $emailSender = $this->getUser()->getEmail();
            } else {
                $nameSender = $data['name'];
                $emailSender = $data['email'];
            }

            // $receiver récupère l'adresse du destinataire
            ////////////////////////////////////////
            // A modifier avec adresse de l'admin //
            ////////////////////////////////////////
            $nameReceiver = "ProjetZ";
            $emailReceiver = "projetz.oclock@gmail.com";
            // password = oclock.projetz2018@gmail.com
            // SwiftMailer
            // https://symfony.com/doc/3.4/email.html
            $message = $this->getSwiftMessage($nameSender, $emailSender, $nameReceiver, $emailReceiver, $data['message']);

            $result = $mailer->send($message);

            $this->addFlash('success', 'Your message has been sent correctly, thank you!');

            return $this->redirectToRoute('contact');
        }

        return $this->render('default/contact.html.twig', array(
            'formSignUp' => $formSignUp->createView(),
            'formContact' => $formContact->createView(),
        ));
    }

    /**
     * Page contenant le formulaire de contact d'un player
     *
     * @Route("/contact/{username}", name="contact_player", requirements={"username"="\w+"})
     */
    public function contactPlayerAction(Request $request, UserPasswordEncoderInterface $encoder, \Swift_Mailer $mailer, User $user)
    {
        $formSignUp = $this::createForm('AppBundle\Form\UserType');

        $isConnected = ($this->isGranted(['IS_AUTHENTICATED_FULLY'])) ? true : false;
        $formContact = $this->createForm(ContactType::class, null,array(
                'action' =>  $this->generateUrl('contact_player', array('username' => $user->getUsername())),
                'isConnected' => $isConnected,
            ));
        $formContact->handleRequest($request);

        if ($formContact->isSubmitted() && $formContact->isValid()) {
            // on récupère les infos du formulaire
            $data = $formContact->getData();

            // $sender récupère les infos de l'expéditeur
            $nameSender = $this->getUser()->getUsername();
            $emailSender = $this->getUser()->getEmail();

            // $receiver récupère l'adresse du destinataire
            $nameReceiver = $user->getUsername();
            $emailReceiver = $user->getEmail();

            // SwiftMailer
            // https://symfony.com/doc/3.4/email.html
            $message = $this->getSwiftMessage($nameSender, $emailSender, $nameReceiver, $emailReceiver, $data['message']);

            $result = $mailer->send($message);

            $this->addFlash('success', 'Your message has been sent correctly, thank you!');

            return $this->redirectToRoute('contact_player', array( 'username' => $user->getUsername()));
        }

        return $this->render('default/contact.html.twig', array(
            'formSignUp' => $formSignUp->createView(),
            'formContact' => $formContact->createView(),
            'user' => $user,
        ));
    }

    /**
     * Page de la FAQ
     *
     * @Route("/faq", name="faq")
     */
    public function faqAction()
    {
        $formSignUp = $this::createForm('AppBundle\Form\UserType');

        return $this->render('default/faq.html.twig', array(
            'formSignUp' => $formSignUp->createView(),
         ));
    }

    /**
     * Page des statistiques
     *
     * @Route("/statistics", name="statistics")
     */
    public function statisticsAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();

        if ($request->isXmlHttpRequest()) {
            switch ($request->query->get('choice')) {
                case 'level_desc':
                    $data = $em->getRepository('AppBundle:User')->getByExperienceDESC();
                    break;

                case 'victories_desc':
                    $data = $em->getRepository('AppBundle:User')->findPodiumMostVictoryDESC();
                    break;

                case 'ennemies_killed_desc':
                    $data = $em->getRepository('AppBundle:User')->findPodiumKilledEnnemiesDESC();
                    break;

                case 'player_revived_desc':
                    $data = $em->getRepository('AppBundle:User')->findPodiumReviveAlliesDESC();
                break;

                case 'game_played_desc':
                    $data = $em->getRepository('AppBundle:User')->findPodiumPlayedGameDESC();
                break;

                default:
                    $data = $em->getRepository('AppBundle:User')->getByExperienceDESC();
                    break;
            }

            return $this->json([
                'data' => $data
            ]);
        }

        $usersLadder = $em->getRepository('AppBundle:User')->getByExperienceDESC();
        $totalGamePlayed = $em->getRepository('AppBundle:finishedGame')->CountAllGamePlayed();
        $totalFactionGameWon = $em->getRepository('AppBundle:finishedGame')->CountAllFactionGameVictory();
        $totalKilledByFaction = $em->getRepository('AppBundle:finishedGame')->CountAllKilledByFaction();
        $totalRevivedByFaction = $em->getRepository('AppBundle:finishedGame')->CountAllRevivedByFaction();

        $allGames = $em->getRepository('AppBundle:finishedGame')->findAll();

        $allMatchs = [];
        $shortestMatchTmp = null;
        foreach ($allGames as $index => $oneGame) {
            $playedAt = $oneGame->getPlayedAt();
            $finishedAt = $oneGame->getFinishedAt();

            $duration = explode(':', Time::duration($playedAt, $finishedAt));
            $hours[] = $duration[0];
            $minutes[] = $duration[1];
            $seconds[] = $duration[2];
            $durations[] = $duration[0]*3600 + $duration[1]*60 + $duration[2];

            foreach ($duration as $key => $value) {
                $value = intval($value);
                if ($value < 10) {
                    $duration[$key] = '0'.$value;
                }
            }
            $winner = $oneGame->getFaction()->getName();
            $allMatchs[] = ['winner' => $winner, 'duration' => $duration[0].':'.$duration[1].':'.$duration[2]];
        }

        $longestMatch = max($durations);
        $longestMatch = Time::transformTime($longestMatch);
        foreach ($longestMatch as $key => $value) {
            $value = intval($value);
            if ($value < 10) {
                $longestMatch[$key] = '0'.$value;
            }
        }
        $longestMatch = $longestMatch['hours'].':'.$longestMatch['minutes'].':'.$longestMatch['seconds'];

        $shortestMatch = min($durations);
        $shortestMatch = Time::transformTime($shortestMatch);
        foreach ($shortestMatch as $key => $value) {
            $value = intval($value);
            if ($value < 10) {
                $shortestMatch[$key] = '0'.$value;
            }
        }
        $shortestMatch = $shortestMatch['hours'].':'.$shortestMatch['minutes'].':'.$shortestMatch['seconds'];

        $averageMatch = Time::transformTime((array_sum($hours) * 3600 + array_sum($minutes) * 60 + array_sum($seconds)) / count($durations));
        foreach ($averageMatch as $key => $value) {
            $value = intval($value);
            if ($value < 10) {
                $averageMatch[$key] = '0'.$value;
            }
        }

        $averageMatch = $averageMatch['hours'].':'.$averageMatch['minutes'].':'.$averageMatch['seconds'];

        return $this->render('default/statistics.html.twig', array(
            'usersLadder' => $usersLadder,
            'totalGamePlayed' => $totalGamePlayed[0],
            'totalFactionGameWon' => $totalFactionGameWon,
            'totalKilledByFaction' => $totalKilledByFaction,
            'totalRevivedByFaction' => $totalRevivedByFaction,
            'longestMatch' => $longestMatch,
            'shortestMatch' => $shortestMatch,
            'averageMatch' => $averageMatch,
            'allMatchs' => $allMatchs,
         ));
    }

    /**
     * Retourne un email SwiftMailer
     */
    private function getSwiftMessage($nameSender, $emailSender, $nameReceiver, $emailReceiver, $body)
    {
        $email = (new \Swift_Message('Projet Z - New Message'))
            ->setFrom([$emailSender => $nameSender]) // expéditeur
            ->setTo([$emailReceiver => $nameReceiver]) // destinataire
            ->setBody(
                $this->renderView(
                    'emails/contact.html.twig', array(
                        'sender' => $nameSender,
                        'message' => $body
                    )
                ),
                    'text/html'
                ) // Corps du message
            ;

        return $email;
    }
}
