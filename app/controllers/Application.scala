package controllers

import play.api.mvc._
import play.api.Logger
import play.api.libs.json._
import play.api.libs.ws.WS
import play.api.libs.concurrent.Execution.Implicits._

object Application extends Controller with GameController {

  /*
  def parseNamespace(str: String) =  {
    val facebookNamespace = str.replaceAll("http://apps.facebook.com/", "").replaceAll("https://apps.facebook.com/", "").replaceAll("/", "")
		val URI = s"$onorUrl/client/v1/games/facebookNamespace/$facebookNamespace?userKey=$userKey"
    Logger.error("Facebook namespace: " + facebookNamespace + " URI " + URI)
      WS.
        url(URI).
        get.map(res => if (res.status == 200) { Logger.error("FN OK " + res.json);res.json.\("gameKey").asOpt[Int]} else {Logger.error("FN KO " + res.status + " res " + res.body); None})
  }*/

  //todo it should be moved to facebook class
  def callback(gameKey: Int, request:Request[_]) = s"http://${request.host}/gameKey/$gameKey/facebook/login"

  /**
   * Handles first request made from facebook to ur app. gameKey is extracted from url, and added to session cookie.
   * Also checks if user is authenticated. It should almost always be authenticated, because currently facebook handles permissions before it contacts app.
   */
  def indexPost(gameKey:Int) = Action {
    implicit request =>
      Logger.info("INDEX POST")

      val settings = Facebook.facebookSettings(gameKey)
      val sr = request.body.asFormUrlEncoded.get("signed_request").head
      components.SignedRequestUtils.parseSignedRequest(sr, settings.appSecret) match {
        case Some(signedRequest) => {
          Logger.info("GOT SIGNED REQUEST")
					Ok(views.html.index(gameKey, settings.appId)).withSession(("fbid", signedRequest.user_id), (GAMEKEY, gameKey.toString))			
        }
        case None => {
          Logger.info("DIDNT GET SIGNED REQUEST")
          Ok(views.html.redirect(settings.appId, callback(gameKey, request), Facebook.fscope))
        }
      }
  }

  /**
   * Proxy for game entity.
   */
  def game = WithGameKey.async(parse.anyContent) {
    implicit request => {
        WS.
          url(s"$onorUrl/client/v1/games/4pics1word/${request.gameKey}?userKey=$userKey").
          get.map(res => Ok(res.json))
      }
  }

  /**
   * Returns css for 4pics1word specific to gameKey.
   * todo support for other types of games.
   * @param gameKey
   */
  def appCss(gameKey:Int) = Action.async(parse.anyContent) {
    implicit request => {
        WS.
          url(s"$onorUrl/client/v1/games/4pics1word/${gameKey}?userKey=$userKey").
          get.map(res => {
            val backgrounds = (res.json \ "design" \ "backgrounds").as[Option[Map[String,String]]].getOrElse(Map())
            Ok(views.txt.app((res.json \ "backgroundUrl").as[String], backgrounds)).as(CSS)
          })
      }
  }

}
