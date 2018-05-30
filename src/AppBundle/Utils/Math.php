<?php

namespace AppBundle\Utils;

/**
 * Math
 */
class Math
{
    /**
     * Retourne le niveau du joueur en fonction de son expérience
     *
     * @param integer $experience
     *
     * @return int
     */
    public static function getLevelFromExperience($experience)
    {
        $level = 0;
        $i = 0;

        while ($experience >= floor(100*$i + pow($i, 2.5))) {
            $i++;
        }

        $level = $i;

        return $level;
    }

    /**
     * Retourne l'expérience nécessaire pour atteindre le niveau suivant
     *
     * @param integer $experience
     *
     * @return int
     */
    public static function getExperienceToReachNextLevel($experience)
    {
        $level = self::getLevelFromExperience($experience);
        $toNext = 0;

        $toNext = floor(100*$level + pow($level, 2.5)) - $experience;

        return $toNext;
    }

    /**
     * Retourne le nombre de points à dépenser restant
     *
     * @param integer $level
     * @param integer $hp
     * @param integer $atk
     * @param integer $def
     * @param integer $spd
     *
     * @return int
     */
    public static function getRemainingPointsToSpend($level, $hp, $atk, $def, $spd)
    {
        $remainingPoints = $level - 1;
        $remainingPoints -= ($hp + $atk + $def + $spd);

        return $remainingPoints;
    }
}
