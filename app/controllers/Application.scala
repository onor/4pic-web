package controllers

import play.api.mvc._
import play.api.Logger
import play.api.libs.json._
import play.api.libs.ws.WS
import play.api.libs.concurrent.Execution.Implicits._

case class FacebookSettings(namespace:String, appId:String, appSecret:String) {
  val appUrl = s"https://apps.facebook.com/$namespace"
  val appHome = s"https://www.facebook.com/appcenter/$namespace"
}

object Application extends Controller {
  
  val onorUrl = play.api.Play.current.configuration.getString("onorplatform.url").get
  val userKey = "4b1469e3ff90b438ef0134b1cb266c06"

  //todo it should be moved to facebook class
  def callback(gameKey: Int, request:Request[_]) = s"https://${request.host}/$gameKey/"
  
  def facebookSettings(gameKey:Int) = (gameKey, play.api.Play.isDev(play.api.Play.current)) match {
    case (116262036, true) => FacebookSettings("fourpicbeauty-dev","304111289726859","bd5fa38e026ac2f5f65ce048d2d3f054")
    case (116262036, false) => FacebookSettings("fourpicweb", "583608191697375","618a6da80479f556e7a72c9780fcbefa")
    case (101347603, true) => FacebookSettings("celebbistro-dev","1400328356875796","aef84bb41bceedb63dc0b2d3eb9cc9ea")
  }

  /**
   * Handles first request made from facebook to ur app. gameKey is extracted from url, and added to session cookie.
   * Also checks if user is authenticated. It should almost always be authenticated, because currently facebook handles permissions before it contacts app.
   */
  def indexPost(gameKey:Int) = Action {
    implicit request =>
      val settings = facebookSettings(gameKey)     
	  Ok(views.html.index(gameKey, settings.appId, onorUrl))			       
  }
  
  def index(gameKey:Int) = Action {
    implicit request =>
      val settings = facebookSettings(gameKey)   
	  Ok(views.html.index(gameKey, settings.appId, onorUrl))			
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
