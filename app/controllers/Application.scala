package controllers

import play.api.mvc._
import play.api.Logger
import play.api.libs.json._
import play.api.libs.ws.WS
import play.api.libs.concurrent.Execution.Implicits._

object Application extends Controller with GameController {

  def index = Action {
    implicit request =>
      Ok(views.html.index())
  }

  def parseNamespace(str: String) =  {
    val facebookNamespace = str.replaceAll("http://apps.facebook.com/", "").replaceAll("https://apps.facebook.com/", "").replaceAll("/", "")
		val URI = s"$onorUrl/client/v1/games/facebookNamespace/$facebookNamespace?userKey=$userKey"
    Logger.error("Facebook namespace: " + facebookNamespace + " URI " + URI)
      WS.
        url(URI).
        get.map(res => if (res.status == 200) { Logger.error("FN OK " + res.json);res.json.\("gameKey").asOpt[Int]} else {Logger.error("FN KO " + res.status + " res " + res.body); None})
  }


  def indexPost() = Action {
    implicit request =>
      Logger.info("INDEX POST")

      def callback(gameKey: Int) = s"http://${request.host}/gameKey/$gameKey/facebook/login"

      Async{
      parseNamespace(request.headers("Referer")) map {
        case Some(gameKey) => {
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
        case None => NotFound("game")
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
          get.map(res => {
            val backgrounds = (res.json \ "design" \ "backgrounds").as[Option[Map[String,String]]].getOrElse(Map())
            Ok(views.txt.app((res.json \ "backgroundUrl").as[String], backgrounds)).as(CSS)
          })
      }
  }

}
