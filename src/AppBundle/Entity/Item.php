<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Item
 *
 * @ORM\Table(name="item")
 * @ORM\Entity(repositoryClass="AppBundle\Repository\ItemRepository")
 */
class Item
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
     * @ORM\Column(name="name", type="string", length=255, unique=true)
     */
    private $name;

    /**
     * @var int
     *
     * @ORM\Column(name="bonus_attack", type="integer", nullable=true)
     */
    private $bonusAttack;

    /**
     * @var int
     *
     * @ORM\Column(name="bonus_defense", type="integer", nullable=true)
     */
    private $bonusDefense;

    /**
     * @var int
     *
     * @ORM\Column(name="bonus_hit_point", type="integer", nullable=true)
     */
    private $bonusHitPoint;

    /**
     * @var int
     *
     * @ORM\Column(name="bonus_speed", type="integer", nullable=true)
     */
    private $bonusSpeed;

    /**
     *
     * @ORM\ManyToOne(targetEntity="ItemCategory", inversedBy="items")
     */
    private $category;


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
     * @return Item
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
     * Set bonusAttack
     *
     * @param integer $bonusAttack
     *
     * @return Item
     */
    public function setBonusAttack($bonusAttack)
    {
        $this->bonusAttack = $bonusAttack;

        return $this;
    }

    /**
     * Get bonusAttack
     *
     * @return int
     */
    public function getBonusAttack()
    {
        return $this->bonusAttack;
    }

    /**
     * Set bonusDefense
     *
     * @param integer $bonusDefense
     *
     * @return Item
     */
    public function setBonusDefense($bonusDefense)
    {
        $this->bonusDefense = $bonusDefense;

        return $this;
    }

    /**
     * Get bonusDefense
     *
     * @return int
     */
    public function getBonusDefense()
    {
        return $this->bonusDefense;
    }

    /**
     * Set bonusHitPoint
     *
     * @param integer $bonusHitPoint
     *
     * @return Item
     */
    public function setBonusHitPoint($bonusHitPoint)
    {
        $this->bonusHitPoint = $bonusHitPoint;

        return $this;
    }

    /**
     * Get bonusHitPoint
     *
     * @return int
     */
    public function getBonusHitPoint()
    {
        return $this->bonusHitPoint;
    }

    /**
     * Set bonusSpeed
     *
     * @param integer $bonusSpeed
     *
     * @return Item
     */
    public function setBonusSpeed($bonusSpeed)
    {
        $this->bonusSpeed = $bonusSpeed;

        return $this;
    }

    /**
     * Get bonusSpeed
     *
     * @return int
     */
    public function getBonusSpeed()
    {
        return $this->bonusSpeed;
    }
}
