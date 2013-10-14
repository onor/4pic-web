package controllers

import play.api.mvc._
import play.api.Logger
import play.api.libs.ws.WS
import play.api.libs.concurrent.Execution.Implicits._

object ScoreService extends Controller with GameController {

  def show(fbid:String, weekly:Boolean) = WithGameKey(p = parse.anyContent) {
    implicit request =>
      Async {
        WS.
          url(s"$onorUrl/client/v1/scores/gk/${request.gameKey}/fbid/${fbid}?userKey=$userKey&weekly=$weekly").
          get.map(res => {
          if (res.status == 200)
            Ok(res.json)
          else BadRequest(res.body)
        })
      }
  }

  def leaderboard(weekly:Boolean) = WithGameKey(p = parse.anyContent) {
    implicit request =>
      Async {
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
