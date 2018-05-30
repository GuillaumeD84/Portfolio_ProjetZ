<?php

namespace AppBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * FinishedGame
 *
 * @ORM\Table(name="finished_game")
 * @ORM\Entity(repositoryClass="AppBundle\Repository\FinishedGameRepository")
 */
class FinishedGame
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
     * @ORM\Column(name="title", type="string", length=255)
     */
    private $title;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="played_at", type="datetime")
     */
    private $playedAt;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="finished_at", type="datetime")
     */
    private $finishedAt;

    /**
     *  @var Faction
     *
     * @ORM\ManyToOne(targetEntity="Faction", inversedBy="finishedGames", cascade={"persist"})
     */
    private $faction;

    /**
     * @var Players
     *
     * @ORM\OneToMany(targetEntity="Players", mappedBy="finishedGame")
     */
    private $players;

    public function __construct()
    {
        $this->players = new ArrayCollection;
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
     * Set title
     *
     * @param string $title
     *
     * @return FinishedGame
     */
    public function setTitle($title)
    {
        $this->title = $title;

        return $this;
    }

    /**
     * Get title
     *
     * @return string
     */
    public function getTitle()
    {
        return $this->title;
    }

    /**
     * Set playedAt
     *
     * @param \DateTime $playedAt
     *
     * @return FinishedGame
     */
    public function setPlayedAt($playedAt)
    {
        $this->playedAt = $playedAt;

        return $this;
    }

    /**
     * Get playedAt
     *
     * @return \DateTime
     */
    public function getPlayedAt()
    {
        return $this->playedAt;
    }

    /**
     * Set finishedAt
     *
     * @param \DateTime $finishedAt
     *
     * @return FinishedGame
     */
    public function setFinishedAt($finishedAt)
    {
        $this->finishedAt = $finishedAt;

        return $this;
    }

    /**
     * Get finishedAt
     *
     * @return \DateTime
     */
    public function getFinishedAt()
    {
        return $this->finishedAt;
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
 * Get the value of Players
 *
 * @return mixed
 */
public function getPlayers()
{
    return $this->players;
}

/**
 * Set the value of Players
 *
 * @param Players Players
 *
 * @return self
 */
public function addPlayer(Players $player)
{
    $this->players[] = $player;

    return $this;
}
}
