package controllers

import play.api.mvc._
import play.api.Logger
import play.api.libs.json._
import play.api.libs.ws.WS
import play.api.libs.concurrent.Execution.Implicits._

object Application extends Controller {
  
  val onorUrl = play.api.Play.current.configuration.getString("onorplatform.url").get
  val userKey = "4b1469e3ff90b438ef0134b1cb266c06"

  //todo it should be moved to facebook class
  def callback(gameKey: Int, request:Request[_]) = s"https://${request.host}/$gameKey/"

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
					Ok(views.html.index(gameKey, settings.appId, signedRequest.user_id, onorUrl))			
        }
        case None => {
          Logger.info("DIDNT GET SIGNED REQUEST")
          Ok(views.html.redirect(settings.appId, callback(gameKey, request), Facebook.fscope))
        }
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
