<?php

namespace AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

use Symfony\Component\Form\Extension\Core\Type as FormType;
use Symfony\Component\Validator\Constraints as Constraint;

use AppBundle\Entity\User;

class ContactType extends AbstractType
{
    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $isConnected = $options['isConnected'];

        if (empty($isConnected)) {
            $builder
                ->add('name', FormType\TextType::class, array(
                    'label' => 'Name',
                    'attr' => array(
                        'placeholder' => 'your name'
                    ),
                    'constraints' => array(
                        new Constraint\NotBlank(),
                    ),
                ))
                ->add('email', FormType\EmailType::class, array(
                    'label' => 'Email',
                    'attr' => array(
                        'placeholder' => 'your email',

                    ),
                    'constraints' => array(
                        new Constraint\NotBlank(),
                    ),
                ));
        }

        $builder
            // ->add('username', FormType\TextType::class, array(
            //     'label' => 'Username',
            //     'attr' => array(
            //         'placeholder' => 'username of the player you want to contact'
            //     ),
            //     'constraints' => array(
            //         new Constraint\NotBlank(),
            //     ),
            // ))
            // ->add('adminRecipient', FormType\CheckboxType::class, array(
            //     'label' => 'Send this message to an admin instead',
            // ))
            ->add('message', FormType\TextareaType::class, array(
                'label' => 'Your message',
                'attr' => array(
                    'placeholder' => 'Type your message here',
                    'class' => 'textarea-contact',
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
            'attr' => array('novalidate' => 'novalidate'),
            'csrf_protection' => true,
            'csrf_field_name' => '_token',
            'csrf_token_id'   => 'task_item',
            'isConnected' => null,
        ));
    }
}
