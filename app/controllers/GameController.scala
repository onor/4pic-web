package controllers

import play.api.libs.concurrent.Execution.Implicits._
import play.api.mvc._
import play.api.libs.json.Json
import play.api.libs.json.JsString

import play.api.libs.ws.WS

case class GameKeyRequest[A](gameKey:Int, fbid:String, request: Request[A]) extends WrappedRequest(request)

trait GameController extends Controller {
  import play.api.Play

  val onorUrl = play.api.Play.current.configuration.getString("onorplatform.url").get
  val userKey = "4b1469e3ff90b438ef0134b1cb266c06"
  val GAMEKEY = "gameKey"

  def WithGameKey[A](p: BodyParser[A])(f: GameKeyRequest[A] => Result) = Action(p) { implicit request =>

    (request.session.get(GAMEKEY).map(_.toInt), request.session.get("fbid")) match {
      case (Some(gameKey), Some(fbid)) => Async {
        WS.
          url(s"$onorUrl/client/v1/games/4pics1word/$gameKey?userKey=$userKey").
          get.map(res => if (res.status == 200) f(GameKeyRequest(gameKey, fbid, request)) else NotFound("game"))
      }

      case _ => BadRequest("Missing gameKey or fbid")
    }
  }
}