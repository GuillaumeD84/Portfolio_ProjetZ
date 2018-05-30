<?php

namespace AppBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Symfony\Component\Security\Core\User\UserInterface;
use Doctrine\ORM\Mapping as ORM;

/**
 * User
 *
 * @ORM\Table(name="user")
 * @ORM\Entity(repositoryClass="AppBundle\Repository\UserRepository")
 */
class User implements UserInterface, \Serializable
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
     * @ORM\Column(name="username", type="string", length=50, unique=true)
     */
    private $username;

    /**
     * @var string
     *
     * @ORM\Column(name="email", type="string", length=255, unique=true)
     */
    private $email;

    /**
     * @var string
     *
     * @ORM\Column(name="password", type="string", length=65)
     */
    private $password;

    /**
     * @var int
     *
     * @ORM\Column(name="experience", type="integer", nullable=true)
     */
    private $experience;

    /**
     * @var int
     *
     * @ORM\Column(name="attack", type="integer", nullable=true)
     */
    private $attack;

    /**
     * @var int
     *
     * @ORM\Column(name="defense", type="integer", nullable=true)
     */
    private $defense;

    /**
     * @var int
     *
     * @ORM\Column(name="hit_point", type="integer", nullable=true)
     */
    private $hitPoint;

    /**
     * @var int
     *
     * @ORM\Column(name="speed", type="integer", nullable=true)
     */
    private $speed;

    /**
     * @var bool
     *
     * @ORM\Column(name="is_active", type="boolean")
     */
    private $isActive;

    /**
     * @ORM\ManyToMany(targetEntity="User", mappedBy="favorite_users")
     */
    private $users;

    /**
     * @ORM\ManyToMany(targetEntity="User", inversedBy="users")
     */
    private $favorite_users;

    /**
     * @var Players
     *
     * @ORM\OneToMany(targetEntity="Players", mappedBy="user")
     */
    private $players;

    public function __construct()
    {
        $this->users = new ArrayCollection();
        $this->favorite_users = new ArrayCollection();
        $this->players = new ArrayCollection();
    }

    public function __toString()
    {
        return $this->username;
    }

    /**
     * @ORM\ManyToOne(targetEntity="Role", inversedBy="users")
     */
    private $role;

    public function getSalt()
    {
        // you *may* need a real salt depending on your encoder
        // see section on salt below
        return null;
    }

    public function getRoles()
    {
        return array($this->getRole()->getStatus());
    }

    public function eraseCredentials()
    {
    }

    /** @see \Serializable::serialize() */
    public function serialize()
    {
        return serialize(array(
            $this->id,
            $this->username,
            $this->password,
            // see section on salt below
            // $this->salt,
        ));
    }

    /** @see \Serializable::unserialize() */
    public function unserialize($serialized)
    {
        list (
            $this->id,
            $this->username,
            $this->password,
            // see section on salt below
            // $this->salt
        ) = unserialize($serialized);
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
     * Set username
     *
     * @param string $username
     *
     * @return User
     */
    public function setUsername($username)
    {
        $this->username = $username;

        return $this;
    }

    /**
     * Get username
     *
     * @return string
     */
    public function getUsername()
    {
        return $this->username;
    }

    /**
     * Set email
     *
     * @param string $email
     *
     * @return User
     */
    public function setEmail($email)
    {
        $this->email = $email;

        return $this;
    }

    /**
     * Get email
     *
     * @return string
     */
    public function getEmail()
    {
        return $this->email;
    }

    /**
     * Set password
     *
     * @param string $password
     *
     * @return User
     */
    public function setPassword($password)
    {
        $this->password = $password;

        return $this;
    }

    /**
     * Get password
     *
     * @return string
     */
    public function getPassword()
    {
        return $this->password;
    }

    /**
     * Set experience
     *
     * @param integer $experience
     *
     * @return User
     */
    public function setExperience($experience)
    {
        $this->experience = $experience;

        return $this;
    }

    /**
     * Get experience
     *
     * @return int
     */
    public function getExperience()
    {
        return $this->experience;
    }

    /**
     * Set attack
     *
     * @param integer $attack
     *
     * @return User
     */
    public function setAttack($attack)
    {
        $this->attack = $attack;

        return $this;
    }

    /**
     * Get attack
     *
     * @return int
     */
    public function getAttack()
    {
        return $this->attack;
    }

    /**
     * Set defense
     *
     * @param integer $defense
     *
     * @return User
     */
    public function setDefense($defense)
    {
        $this->defense = $defense;

        return $this;
    }

    /**
     * Get defense
     *
     * @return int
     */
    public function getDefense()
    {
        return $this->defense;
    }

    /**
     * Set hitPoint
     *
     * @param integer $hitPoint
     *
     * @return User
     */
    public function setHitPoint($hitPoint)
    {
        $this->hitPoint = $hitPoint;

        return $this;
    }

    /**
     * Get hitPoint
     *
     * @return int
     */
    public function getHitPoint()
    {
        return $this->hitPoint;
    }

    /**
     * Set speed
     *
     * @param integer $speed
     *
     * @return User
     */
    public function setSpeed($speed)
    {
        $this->speed = $speed;

        return $this;
    }

    /**
     * Get speed
     *
     * @return int
     */
    public function getSpeed()
    {
        return $this->speed;
    }

    /**
     * Set isActive
     *
     * @param boolean $isActive
     *
     * @return User
     */
    public function setIsActive($isActive)
    {
        $this->isActive = $isActive;

        return $this;
    }

    /**
     * Get isActive
     *
     * @return bool
     */
    public function getIsActive()
    {
        return $this->isActive;
    }

    /**
     * Get the value of Users
     *
     * @return mixed
     */
    public function getUsers()
    {
        return $this->users;
    }

    /**
     * Set the value of Users
     *
     * @param mixed users
     *
     * @return self
     */
    public function addUser(User $user)
    {
        $this->users[] = $user;

        return $this;
    }

    /**
     * Get the value of Favorite Users
     *
     * @return mixed
     */
    public function getFavoriteUsers()
    {
        return $this->favorite_users;
    }

    /**
     * Set the value of Favorite Users
     *
     * @param mixed favorite_users
     *
     * @return self
     */
    public function addFavoriteUser(User $favorite_user)
    {
        $this->favorite_users[] = $favorite_user;

        return $this;
    }

    /**
     * remove a Favorite Users
     *
     * @param mixed favorite_users
     *
     * @return self
     */
    public function removeFavoriteUser(User $favorite_user)
    {
        $this->favorite_users->removeElement($favorite_user);

        return $this;
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
     * Set the value of Users
     *
     * @param mixed users
     *
     * @return self
     */
    public function setUsers($users)
    {
        $this->users = $users;

        return $this;
    }

    /**
     * Set the value of Favorite Users
     *
     * @param mixed favorite_users
     *
     * @return self
     */
    public function setFavoriteUsers($favorite_users)
    {
        $this->favorite_users = $favorite_users;

        return $this;
    }

    /**
     * Set the value of Players
     *
     * @param Players players
     *
     * @return self
     */
    public function setPlayers(Players $players)
    {
        $this->players = $players;

        return $this;
    }

    /**
     * Get the value of Role
     *
     * @return mixed
     */
    public function getRole()
    {
        return $this->role;
    }

    /**
     * Set the value of Role
     *
     * @param mixed role
     *
     * @return self
     */
    public function setRole($role)
    {
        $this->role = $role;

        return $this;
    }

}
