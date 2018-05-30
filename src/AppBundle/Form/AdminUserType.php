<?php

namespace AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Constraints\Email;

class AdminUserType extends AbstractType
{
    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('username', TextType::class, [
                'label' => 'Username',
                'attr' => [
                    'placeholder' => 'Username',
                ],
                'constraints' => new NotBlank([
                    'message' => 'Veuillez indiquer un nom d\'utilisateur.',
                ]),
            ])
            ->add('password', PasswordType::class, [
                'label' => 'password',
                'attr' => [
                    'placeholder' => 'Password',
                ],
                'constraints' => new NotBlank([
                    'message' => 'Veuillez indiquer un password.',
                ]),
            ])
            ->add('email', EmailType::class, [
                'label' => 'E-mail',
                'attr' => [
                    'placeholder' => 'E-mail',
                ],
                'constraints' => [
                    new NotBlank([
                        'message' => 'Veuillez indiquer votre e-mail.',
                    ]),
                    new Email([
                        'message' => 'L\'adresse e-mail {{ value }} est invalide.',
                    ]),
                ],
            ])
            ->add('role', null, [
                    'label' => 'Rôle de l\'utilisateur',
                    'placeholder' => 'Attribuer un rôle utilisateur...',
            ])
            ->add('isActive', null, [
                    'label' => 'Utilisateur actif ?',
            ]);
    }/**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'AppBundle\Entity\User',
            'attr' => array('novalidate' => 'novalidate'),
            'csrf_protection' => true,
            'csrf_field_name' => '_token',
            'csrf_token_id'   => 'task_item',
        ));
    }

    /**
     * {@inheritdoc}
     */
    public function getBlockPrefix()
    {
        return 'appbundle_user';
    }


}
