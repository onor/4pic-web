package controllers

import play.api.mvc._
import play.api.Logger
import play.api.libs.ws.WS
import play.api.libs.concurrent.Execution.Implicits._

object ScoreService extends Controller with GameController {

  def show(levelPack: Int) = WithGameKey(p = parse.anyContent) {
    implicit request =>
      Async {
        val leaderboardKey = "todo"
        val id = request.session.get("fbid")
        WS.
          url(s"$onorUrl/client/v1/scores/ld/$leaderboardKey/user/$id/provider/facebook?userKey=$userKey").
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
        val leaderboardKey = "todo"
        val id = request.session.get("fbid")
        WS.
          url(s"$onorUrl/client/v1/scores/ld/$leaderboardKey/user/$id/provider/facebook?userKey=$userKey").
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
        val leaderboardKey = "todo"
        val id = request.session.get("fbid")
        WS.
          url(s"$onorUrl/client/v1/scores/ld/$leaderboardKey/user/$id/provider/facebook?userKey=$userKey").
          post(request.body.asJson.get).map(res => {
          //todo move get
          if (res.status == 200)
            Ok(res.json)
          else BadRequest(res.body)
        })
      }
  }

}
