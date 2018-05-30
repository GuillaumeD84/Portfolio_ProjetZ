<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * PresetSentence
 *
 * @ORM\Table(name="preset_sentence")
 * @ORM\Entity(repositoryClass="AppBundle\Repository\PresetSentenceRepository")
 */
class PresetSentence
{
    /**
     * @var int
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(name="message", type="string", length=255)
     */
    private $message;

    /**
     * @var bool
     *
     * @ORM\Column(name="target_ennemies", type="boolean")
     */
    private $targetEnnemies;


    /**
     * Get id
     *
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set message
     *
     * @param string $message
     *
     * @return PresetSentence
     */
    public function setMessage($message)
    {
        $this->message = $message;

        return $this;
    }

    /**
     * Get message
     *
     * @return string
     */
    public function getMessage()
    {
        return $this->message;
    }

    /**
     * Set targetEnnemies
     *
     * @param boolean $targetEnnemies
     *
     * @return PresetSentence
     */
    public function setTargetEnnemies($targetEnnemies)
    {
        $this->targetEnnemies = $targetEnnemies;

        return $this;
    }

    /**
     * Get targetEnnemies
     *
     * @return bool
     */
    public function getTargetEnnemies()
    {
        return $this->targetEnnemies;
    }
}

