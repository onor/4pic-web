package controllers

import play.api.mvc._
import play.api.Logger
import play.api.libs.ws.WS
import play.api.libs.concurrent.Execution.Implicits._

/**
 * Proxy for Score/Leaderboard service.
 */
object ScoreService extends Controller with GameController {

  /**
   * todo: it just adds fbid to url. we need to rething this, and make fbid occurs everywhere in same place. url, header or body
   * @param fbid
   * @param weekly
   * @return
   */
  def show(fbid:String, weekly:Boolean) = WithGameKey.async(parse.anyContent) {
    implicit request => {
        WS.
          url(s"$onorUrl/client/v1/scores/gk/${request.gameKey}/fbid/${fbid}?userKey=$userKey&weekly=$weekly").
          get.map(res => {
          if (res.status == 200)
            Ok(res.json)
          else BadRequest(res.body)
        })
      }
  }

  def leaderboard(weekly:Boolean) = WithGameKey.async(parse.anyContent) {
    implicit request => {
        WS.
          url(s"$onorUrl/client/v1/scores/gk/${request.gameKey}?userKey=$userKey&weekly=$weekly").
          get.map(res => {
          if (res.status == 200)
            Ok(res.json)
          else BadRequest(res.body)
        })
      }
  }

}
