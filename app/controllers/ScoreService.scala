package controllers

import play.api.mvc._
import play.api.Logger
import play.api.libs.ws.WS
import play.api.libs.concurrent.Execution.Implicits._

object ScoreService extends Controller {

  val onorUrl = play.api.Play.current.configuration.getString("onorplatform.url").get
  val userKey = "4b1469e3ff90b438ef0134b1cb266c06"
  val GAMEKEY = "gameKey"

  def show(levelPack:Int) = Action { implicit request  =>
    request.session.get(GAMEKEY).map(_.toInt) match {
      case Some(gameKey) => Async {
        val leaderboardKey = "todo"
        val id = request.session.get("fbid")
        WS.
          url(s"$onorUrl/client/v1/scores/ld/$leaderboardKey/user/$id/provider/facebook?userKey=$userKey").
          get.map(res => {
          if(res.status == 200)
            Ok(res.json)
          else BadRequest(res.body)
        })
      }

      case None => BadRequest("")
    }
  }

  def create(levelPack:Int) = Action { implicit request  =>
    request.session.get(GAMEKEY).map(_.toInt) match {
      case Some(gameKey) => Async {
        val leaderboardKey = "todo"
        val id = request.session.get("fbid")
        WS.
          url(s"$onorUrl/client/v1/scores/ld/$leaderboardKey/user/$id/provider/facebook?userKey=$userKey").
          post(request.body.asJson.get).map(res => { //todo move get
          if(res.status == 200)
            Ok(res.json)
          else BadRequest(res.body)
        })
      }

      case None => BadRequest("")
    }
  }

  def update(levelPack:Int) = Action { implicit request  =>
    request.session.get(GAMEKEY).map(_.toInt) match {
      case Some(gameKey) => Async {
        val leaderboardKey = "todo"
        val id = request.session.get("fbid")
        WS.
          url(s"$onorUrl/client/v1/scores/ld/$leaderboardKey/user/$id/provider/facebook?userKey=$userKey").
          post(request.body.asJson.get).map(res => { //todo move get
          if(res.status == 200)
            Ok(res.json)
          else BadRequest(res.body)
        })
      }

      case None => BadRequest("")
    }
  }

}
