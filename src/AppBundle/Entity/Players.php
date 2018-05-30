<?php

namespace AppBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use AppBundle\Entity\FinishedGame;

/**
 * Players
 *
 * @ORM\Table(name="players")
 * @ORM\Entity(repositoryClass="AppBundle\Repository\PlayersRepository")
 */
class Players
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
     * @var int
     *
     * @ORM\Column(name="gold", type="integer")
     */
    private $gold;

    /**
     * @var int
     *
     * @ORM\Column(name="killed", type="integer")
     */
    private $killed;

    /**
     * @var int
     *
     * @ORM\Column(name="revive", type="integer")
     */
    private $revive;

    /**
     * @var int
     *
     * @ORM\Column(name="death", type="integer")
     */
    private $death;

    /**
     * @var int
     *
     * @ORM\Column(name="level", type="integer")
     */
    private $level;

    /**
     *  @var User
     *
     * @ORM\ManyToOne(targetEntity="User", inversedBy="players", cascade={"persist"})
     */
    private $user;

    /**
     *  @var Faction
     *
     * @ORM\ManyToOne(targetEntity="Faction", inversedBy="players", cascade={"persist"})
     */
    private $faction;

    /**
     *  @var FinishedGame
     *
     * @ORM\ManyToOne(targetEntity="FinishedGame", inversedBy="players", cascade={"persist"})
     */
    private $finishedGame;


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
     * Set gold
     *
     * @param integer $gold
     *
     * @return Players
     */
    public function setGold($gold)
    {
        $this->gold = $gold;

        return $this;
    }

    /**
     * Get gold
     *
     * @return int
     */
    public function getGold()
    {
        return $this->gold;
    }

    /**
     * Set killed
     *
     * @param integer $killed
     *
     * @return Players
     */
    public function setKilled($killed)
    {
        $this->killed = $killed;

        return $this;
    }

    /**
     * Get killed
     *
     * @return int
     */
    public function getKilled()
    {
        return $this->killed;
    }

    /**
     * Set revive
     *
     * @param integer $revive
     *
     * @return Players
     */
    public function setRevive($revive)
    {
        $this->revive = $revive;

        return $this;
    }

    /**
     * Get revive
     *
     * @return int
     */
    public function getRevive()
    {
        return $this->revive;
    }

    /**
     * Set death
     *
     * @param integer $death
     *
     * @return Players
     */
    public function setDeath($death)
    {
        $this->death = $death;

        return $this;
    }

    /**
     * Get death
     *
     * @return int
     */
    public function getDeath()
    {
        return $this->death;
    }

    /**
     * Set level
     *
     * @param integer $level
     *
     * @return Players
     */
    public function setLevel($level)
    {
        $this->level = $level;

        return $this;
    }

    /**
     * Get level
     *
     * @return int
     */
    public function getLevel()
    {
        return $this->level;
    }

    /**
     * Get the value of User
     *
     * @return User
     */
    public function getUser()
    {
        return $this->user;
    }

    /**
     * Set the value of User
     *
     * @param User user
     *
     * @return self
     */
    public function setUser(User $user)
    {
        $this->user = $user;

        return $this;
    }

    /**
     * Get the value of Faction
     *
     * @return Faction
     */
    public function getFaction()
    {
        return $this->faction;
    }

    /**
     * Set the value of Faction
     *
     * @param Faction faction
     *
     * @return self
     */
    public function setFaction(Faction $faction)
    {
        $this->faction = $faction;

        return $this;
    }


    /**
     * Get the value of Finished Game
     *
     * @return FinishedGame
     */
    public function getFinishedGame()
    {
        return $this->finishedGame;
    }

    /**
     * Set the value of Finished Game
     *
     * @param FinishedGame finishedGame
     *
     * @return self
     */
    public function setFinishedGame(FinishedGame $finishedGame)
    {
        $this->finishedGame = $finishedGame;

        return $this;
    }

}
