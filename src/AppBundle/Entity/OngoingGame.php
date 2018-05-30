<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * OngoingGame
 *
 * @ORM\Table(name="ongoing_game")
 * @ORM\Entity(repositoryClass="AppBundle\Repository\OngoingGameRepository")
 */
class OngoingGame
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
     * @ORM\Column(name="name", type="string", length=255)
     */
    private $name;

    /**
     * @var string
     *
     * @ORM\Column(name="slug", type="string", length=255)
     */
    private $slug;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="created_at", type="datetime")
     */
    private $createdAt;

    /**
     * @ORM\ManyToOne(targetEntity="User")
     */
    private $saint_1;

    /**
     * @ORM\ManyToOne(targetEntity="User")
     */
    private $saint_2;

    /**
     * @ORM\ManyToOne(targetEntity="User")
     */
    private $saint_3;

    /**
     * @ORM\ManyToOne(targetEntity="User")
     */
    private $zombie_1;

    /**
     * @ORM\ManyToOne(targetEntity="User")
     */
    private $zombie_2;

    /**
     * @ORM\ManyToOne(targetEntity="User")
     */
    private $zombie_3;



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
     * Set name
     *
     * @param string $name
     *
     * @return OngoingGame
     */
    public function setName($name)
    {
        $this->name = $name;

        return $this;
    }

    /**
     * Get name
     *
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * Set slug
     *
     * @param string $slug
     *
     * @return OngoingGame
     */
    public function setSlug($slug)
    {
        $this->slug = $slug;

        return $this;
    }

    /**
     * Get slug
     *
     * @return string
     */
    public function getSlug()
    {
        return $this->slug;
    }

    /**
     * Set createdAt
     *
     * @param \DateTime $createdAt
     *
     * @return OngoingGame
     */
    public function setCreatedAt($createdAt)
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    /**
     * Get createdAt
     *
     * @return \DateTime
     */
    public function getCreatedAt()
    {
        return $this->createdAt;
    }

    /**
     * Get the value of Saint 1
     *
     * @return mixed
     */
    public function getSaint1()
    {
        return $this->saint_1;
    }

    /**
     * Set the value of Saint 1
     *
     * @param mixed saint_1
     *
     * @return self
     */
    public function setSaint1($saint_1)
    {
        $this->saint_1 = $saint_1;

        return $this;
    }

    /**
     * Get the value of Saint 2
     *
     * @return mixed
     */
    public function getSaint2()
    {
        return $this->saint_2;
    }

    /**
     * Set the value of Saint 2
     *
     * @param mixed saint_2
     *
     * @return self
     */
    public function setSaint2($saint_2)
    {
        $this->saint_2 = $saint_2;

        return $this;
    }

    /**
     * Get the value of Saint 3
     *
     * @return mixed
     */
    public function getSaint3()
    {
        return $this->saint_3;
    }

    /**
     * Set the value of Saint 3
     *
     * @param mixed saint_3
     *
     * @return self
     */
    public function setSaint3($saint_3)
    {
        $this->saint_3 = $saint_3;

        return $this;
    }

    /**
     * Get the value of Zombie 1
     *
     * @return mixed
     */
    public function getZombie1()
    {
        return $this->zombie_1;
    }

    /**
     * Set the value of Zombie 1
     *
     * @param mixed zombie_1
     *
     * @return self
     */
    public function setZombie1($zombie_1)
    {
        $this->zombie_1 = $zombie_1;

        return $this;
    }

    /**
     * Get the value of Zombie 2
     *
     * @return mixed
     */
    public function getZombie2()
    {
        return $this->zombie_2;
    }

    /**
     * Set the value of Zombie 2
     *
     * @param mixed zombie_2
     *
     * @return self
     */
    public function setZombie2($zombie_2)
    {
        $this->zombie_2 = $zombie_2;

        return $this;
    }

    /**
     * Get the value of Zombie 3
     *
     * @return mixed
     */
    public function getZombie3()
    {
        return $this->zombie_3;
    }

    /**
     * Set the value of Zombie 3
     *
     * @param mixed zombie_3
     *
     * @return self
     */
    public function setZombie3($zombie_3)
    {
        $this->zombie_3 = $zombie_3;

        return $this;
    }

}
