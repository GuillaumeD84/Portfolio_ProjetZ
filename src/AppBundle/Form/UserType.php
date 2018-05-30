<?php

namespace AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

use Symfony\Component\Form\Extension\Core\Type\RepeatedType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;

use Symfony\Component\Validator\Constraints as Constraint;

class UserType extends AbstractType
{
    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('username', null, array(
                'label' => 'Username',
                'attr' => array(
                    'placeholder' => 'Choose a username',
                ),
                'constraints' => array(
                    new Constraint\NotBlank(),new Constraint\Regex(array(
                        'pattern' => '/^[a-zA-Z0-9]+$/',
                        'message' => 'This username does not match the requirements.'
                    )),
                ),
            ))
            ->add('email', null, array(
                'label' => 'Email',
                'attr' => array(
                    'placeholder' => 'Your email',
                ),
                'constraints' => array(
                    new Constraint\NotBlank(),
                ),
            ))
            ->add('password', RepeatedType::class, array(
                'type' => PasswordType::class,
                'invalid_message' => 'Passwords doesn\'t match.',
                'options' => array('attr' => array('class' => 'password-field')),
                'first_options'  => array(
                    'label' => 'Password',
                    'attr' => array(
                        'placeholder' => 'Choose your password wisely',
                    ),
                ),
                'second_options' => array(
                    'label' => 'Repeat password',
                    'attr' => array(
                        'placeholder' => 'Please repeat your password',
                    ),
                ),
                'constraints' => array(
                    new Constraint\NotBlank(),
                ),
            ))
        ;
    }

    /**
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
