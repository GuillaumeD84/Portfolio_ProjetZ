<?php

namespace AppBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

use AppBundle\Entity\Item;

/**
 * ItemCategory
 *
 * @ORM\Table(name="item_category")
 * @ORM\Entity(repositoryClass="AppBundle\Repository\ItemCategoryRepository")
 */
class ItemCategory
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
     *
     * @ORM\OneToMany(targetEntity="Item", mappedBy="category")
     */
    private $items;

    public function __construct()
    {
        $this->items = new ArrayCollection;
    }

    public function addItem(Item $item)
    {
        $this->items[] = $item;
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
     * @return ItemCategory
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
}
