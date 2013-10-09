package controllers

import play.api.mvc._
import play.api.Logger
import play.api.libs.ws.WS
import play.api.libs.concurrent.Execution.Implicits._

object Application extends Controller {

  val onorUrl = play.api.Play.current.configuration.getString("onorplatform.url").get
  val userKey = "4b1469e3ff90b438ef0134b1cb266c06"
  val GAMEKEY = "gameKey"

  def index = Action { implicit request =>
    Ok(views.html.index())
  }

  def indexPost(gameKey:Int) = Action { implicit request =>
    Logger.info("INDEX POST")

    def callback(gameKey:Int) = s"http://${request.host}/gameKey/$gameKey/facebook/login"

    val settings = Facebook.facebookSettings(gameKey)
    val sr = request.body.asFormUrlEncoded.get("signed_request").head
    components.SignedRequestUtils.parseSignedRequest(sr, settings.appSecret) match {
      case Some(signedRequest) => {
        Logger.info("GOT SIGNED REQUEST")
        Redirect(routes.Application.index()).withSession(("fbid", signedRequest.user_id), (GAMEKEY, gameKey.toString))
      }
      case None => {
        Logger.info("DIDNT GET SIGNED REQUEST")
        Ok(views.html.redirect(settings.appId, callback(gameKey), Facebook.fscope))
      }
    }
  }

  def game = Action { implicit request  =>
    request.session.get(GAMEKEY).map(_.toInt) match {
      case Some(gameKey) => Async {
          WS.
            url(s"$onorUrl/client/v1/games/4pics1word/$gameKey?userKey=$userKey").
            get.map(res => Ok(res.json))
        }

      case None => BadRequest("")
    }
  }

  def angularConfig = Action { implicit request =>
    request.session.get(GAMEKEY).map(_.toInt) match {
      case Some(gameKey) => {
        val settings = Facebook.facebookSettings(gameKey)
        Ok(views.txt.config(settings.appId))
      }

      case None => BadRequest("")
    }
  }

  def appCss = Action { implicit request =>
    request.session.get(GAMEKEY).map(_.toInt) match {
      case Some(gameKey) => Async {
        WS.
          url(s"$onorUrl/client/v1/games/4pics1word/$gameKey?userKey=$userKey").
          get.map(res => Ok(views.txt.app((res.json \ "backgroundUrl").as[String])).as(CSS))
      }

      case None => BadRequest("")
    }
  }

}
