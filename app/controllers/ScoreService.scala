package controllers

import play.api.mvc._
import play.api.Logger
import play.api.libs.ws.WS
import play.api.libs.concurrent.Execution.Implicits._

object ScoreService extends Controller with GameController {

  private def ldKey(gameKey:Int, levelPack:Int) = s"${gameKey}_levelpack_$levelPack"

  def show(levelPack: Int) = WithGameKey(p = parse.anyContent) {
    implicit request =>
      Async {
        val leaderboardKey = ldKey(request.gameKey, levelPack)
        WS.
          url(s"$onorUrl/client/v1/scores/ld/$leaderboardKey/user/${request.fbid}/provider/facebook?userKey=$userKey").
          get.map(res => {
          if (res.status == 200)
            Ok(res.json)
          else BadRequest(res.body)
        })
      }
  }

  def leaderboard(levelPack: Option[Int]) = WithGameKey(p = parse.anyContent) {
    implicit request =>
      Async {
        val leaderboardKey = ldKey(request.gameKey, levelPack.get)//todo
        WS.
          url(s"$onorUrl/client/v1/scores/ld/$leaderboardKey?userKey=$userKey").
          get.map(res => {
          if (res.status == 200)
            Ok(res.json)
          else BadRequest(res.body)
        })
      }
  }

  def create(levelPack: Int) = WithGameKey(p = parse.anyContent) {
    implicit request =>
      Async {
        val leaderboardKey = ldKey(request.gameKey, levelPack)
        WS.
          url(s"$onorUrl/client/v1/scores/ld/$leaderboardKey/user/${request.fbid}/provider/facebook?userKey=$userKey").
          post(request.body.asJson.get).map(res => {
          //todo move get
          if (res.status == 200)
            Ok(res.json)
          else BadRequest(res.body)
        })
      }
  }

  def update(levelPack: Int) = WithGameKey(p = parse.anyContent) {
    implicit request =>
      Async {
        val leaderboardKey = ldKey(request.gameKey, levelPack)
        WS.
          url(s"$onorUrl/client/v1/scores/ld/$leaderboardKey/user/${request.fbid}/provider/facebook?userKey=$userKey").
          post(request.body.asJson.get).map(res => {
          //todo move get
          if (res.status == 200)
            Ok(res.json)
          else BadRequest(res.body)
        })
      }
  }

}
