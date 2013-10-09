package controllers

import play.api.mvc._
import play.api.Logger
import play.api.libs.ws.WS
import play.api.libs.concurrent.Execution.Implicits._

object Application extends Controller with GameController {

  def index = Action {
    implicit request =>
      Ok(views.html.index())
  }

  def indexPost(gameKey: Int) = Action {
    implicit request =>
      Logger.info("INDEX POST")

      def callback(gameKey: Int) = s"http://${request.host}/gameKey/$gameKey/facebook/login"

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

  def game = WithGameKey(p = parse.anyContent) {
    implicit request =>
      Async {
        WS.
          url(s"$onorUrl/client/v1/games/4pics1word/${request.gameKey}?userKey=$userKey").
          get.map(res => Ok(res.json))
      }
  }

  def angularConfig = WithGameKey(p = parse.anyContent) {
    implicit request =>
      val settings = Facebook.facebookSettings(request.gameKey)
      Ok(views.txt.config(settings.appId))
  }

  def appCss = WithGameKey(p = parse.anyContent) {
    implicit request =>
      Async {
        WS.
          url(s"$onorUrl/client/v1/games/4pics1word/${request.gameKey}?userKey=$userKey").
          get.map(res => Ok(views.txt.app((res.json \ "backgroundUrl").as[String])).as(CSS))
      }
  }

}
