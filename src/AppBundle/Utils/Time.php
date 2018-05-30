<?php

namespace AppBundle\Utils;

/**
 * Time
 */
class Time
{
    /**
     * Retourne un interval entre 2 dates
     */
     public static function getInterval($playedAt, $finishedAt)
     {
         $datetime1 = strtotime($playedAt);
         $datetime2 = strtotime($finishedAt);
         $interval = $datetime2 - $datetime1;

         return $interval;
     }

     /**
      * Transform seconds en H-m-s
      */
      public static function transformTime($time)
      {
          $result = [];
          $result['hours'] = intval($time / 3600);
          $result['minutes'] = intval(($time - ($result['hours'] * 3600)) / 60);
          $result['seconds'] = $time - ($result['hours'] * 3600) - ($result['minutes'] * 60);

          return $result;
      }

     /**
      * calculate duration between time and now
      */
      public static function duration($start, $end = null)
      {
          if (null == $end) {
             $end = new \Datetime();
          }
          $duration = self::transformTime(self::getInterval($start->format('Y-m-d H:i:s'), $end->format('Y-m-d H:i:s')));
          return $duration['hours'].':'.$duration['minutes'].':'.$duration['seconds'];
      }

}
