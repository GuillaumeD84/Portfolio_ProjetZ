<?php

namespace AppBundle\Controller\Admin;

use AppBundle\Entity\User;
use AppBundle\Entity\Role;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Doctrine\ORM\EntityManagerInterface;

/**
 * User controller.
 *
 * @Route("admin/users")
 */
class UserController extends Controller
{
    /**
     * Lists all user entities.
     *
     * @Route("/", name="admin_users_index")
     * @Method("GET")
     */
    public function indexAction()
    {
        $em = $this->getDoctrine()->getManager();

        $users = $em->getRepository('AppBundle:User')->findAll();

        return $this->render('admin/user/index.html.twig', array(
            'users' => $users,
        ));
    }

    /**
     * Creates a new user entity.
     *
     * @Route("/new", name="admin_users_new")
     * @Method({"GET", "POST"})
     */
    public function newAction(Request $request, UserPasswordEncoderInterface $passwordEncoder)
    {
        $user = new User();
        $form = $this->createForm('AppBundle\Form\AdminUserType', $user);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $password = $passwordEncoder->encodePassword($user, $user->getPassword());
            $user->setPassword($password);

            $em = $this->getDoctrine()->getManager();

            if ($user->getRole() == null) {
                // valeur par defaut du role: ROLE_USER si aucun role n'a été sélectionné
                $roleRepository = $this->getDoctrine()->getRepository(Role::class);
                $roleUser = $roleRepository->findOneBy(['status' => 'ROLE_USER']);
                $user->setRole($roleUser);
            }


            $em->persist($user);
            $em->flush();

            return $this->redirectToRoute('admin_users_show', array('id' => $user->getId()));
        }

        return $this->render('admin/user/new.html.twig', array(
            'user' => $user,
            'form' => $form->createView(),
        ));
    }

    /**
     * Finds and displays a user entity.
     *
     * @Route("/{id}", name="admin_users_show")
     * @Method("GET")
     */
    public function showAction(User $user)
    {
        return $this->render('admin/user/show.html.twig', array(
            'user' => $user,
        ));
    }

    /**
     * Displays a form to edit an existing user entity.
     *
     * @Route("/{id}/edit", name="admin_users_edit")
     * @Method({"GET", "POST"})
     */
    public function editAction(Request $request, User $user)
    {
        $editForm = $this->createForm('AppBundle\Form\AdminEditUserType', $user);
        $editForm->handleRequest($request);

        if ($editForm->isSubmitted() && $editForm->isValid()) {
            $this->getDoctrine()->getManager()->flush();

            return $this->redirectToRoute('admin_users_edit', array('id' => $user->getId()));
        }

        return $this->render('admin/user/edit.html.twig', array(
            'user' => $user,
            'edit_form' => $editForm->createView(),
        ));
    }

    /**
     * Enable - Disable an user
     *
     * @Route("/isactive/", name="change_isactive")
     * @Method({"GET", "POST"})
     */
    public function activeAction(Request $request, EntityManagerInterface $em)
    {
        $id = $request->request->get('id');

        $reponse = $this->getDoctrine()->getRepository(User::class)->findOneById($id);

        $moderate = $reponse->getIsActive();
        if($moderate == 0) {
            $reponse->setIsActive(1);
            $class = "Disable";
            $message = "Yes";
        } else {
            $reponse->setIsActive(0);
            $class = "Enable";
            $message= "No";
        }

        $em->persist($reponse);
        $em->flush();

        $data = ['message' => $message, 'class' => $class];

        return $this->json($data);
    }

}
