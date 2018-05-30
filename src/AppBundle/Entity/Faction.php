<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use AppBundle\Entity\FinishedGame;

/**
 * Faction
 *
 * @ORM\Table(name="faction")
 * @ORM\Entity(repositoryClass="AppBundle\Repository\FactionRepository")
 */
class Faction
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
     * @ORM\Column(name="name", type="string", length=50, unique=true)
     */
    private $name;

    /**
     * @var int
     *
     * @ORM\Column(name="base_attack", type="integer")
     */
    private $baseAttack;

    /**
     * @var int
     *
     * @ORM\Column(name="base_defense", type="integer")
     */
    private $baseDefense;

    /**
     * @var int
     *
     * @ORM\Column(name="base_hit_point", type="integer")
     */
    private $baseHitPoint;

    /**
     * @var int
     *
     * @ORM\Column(name="base_speed", type="integer")
     */
    private $baseSpeed;

    /**
     * @var Players
     *
     * @ORM\OneToMany(targetEntity="Players", mappedBy="faction")
     */
    private $players;

    /**
     * @var FinishedGame
     *
     * @ORM\OneToMany(targetEntity="FinishedGame", mappedBy="faction")
     */
    private $finishedGames;

    public function __construct()
    {
        $this->players = new ArrayCollection();
        $this->finishedGames = new ArrayCollection();
    }

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
     * @return Faction
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
     * Set baseAttack
     *
     * @param integer $baseAttack
     *
     * @return Faction
     */
    public function setBaseAttack($baseAttack)
    {
        $this->baseAttack = $baseAttack;

        return $this;
    }

    /**
     * Get baseAttack
     *
     * @return int
     */
    public function getBaseAttack()
    {
        return $this->baseAttack;
    }

    /**
     * Set baseDefense
     *
     * @param integer $baseDefense
     *
     * @return Faction
     */
    public function setBaseDefense($baseDefense)
    {
        $this->baseDefense = $baseDefense;

        return $this;
    }

    /**
     * Get baseDefense
     *
     * @return int
     */
    public function getBaseDefense()
    {
        return $this->baseDefense;
    }

    /**
     * Set baseHitPoint
     *
     * @param integer $baseHitPoint
     *
     * @return Faction
     */
    public function setBaseHitPoint($baseHitPoint)
    {
        $this->baseHitPoint = $baseHitPoint;

        return $this;
    }

    /**
     * Get baseHitPoint
     *
     * @return int
     */
    public function getBaseHitPoint()
    {
        return $this->baseHitPoint;
    }

    /**
     * Set baseSpeed
     *
     * @param integer $baseSpeed
     *
     * @return Faction
     */
    public function setBaseSpeed($baseSpeed)
    {
        $this->baseSpeed = $baseSpeed;

        return $this;
    }

    /**
     * Get baseSpeed
     *
     * @return int
     */
    public function getBaseSpeed()
    {
        return $this->baseSpeed;
    }

    /**
     * Get the value of Players
     *
     * @return Players
     */
    public function getPlayers()
    {
        return $this->players;
    }

    /**
     * Set the value of Players
     *
     * @param Players players
     *
     * @return self
     */
    public function addPlayer(Players $player)
    {
        $this->players[] = $player;

        return $this;
    }

    /**
     * Get the value of Finished Games
     *
     * @return FinishedGame
     */
    public function getFinishedGames()
    {
        return $this->finishedGames;
    }

    /**
     * Set the value of Finished Games
     *
     * @param FinishedGame finishedGames
     *
     * @return self
     */
    public function addFinishedGame(FinishedGame $finishedGame)
    {
        $this->finishedGames[] = $finishedGame;

        return $this;
    }

}
