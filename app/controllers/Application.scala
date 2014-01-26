package controllers

import play.api.mvc._
import play.api.Logger
import play.api.libs.json._
import play.api.libs.ws.WS
import play.api.libs.concurrent.Execution.Implicits._
import play.api.cache.Cached
import play.api.Play.current
import scala.concurrent.Future

case class FacebookSettings(namespace:String, appId:String, appSecret:String) {
  val appUrl = s"https://apps.facebook.com/$namespace"
}

case class Prize(
  _id: String,
  prizetype: String = "real",
  version: Int,
  title: String,
  tags: Seq[String],
  brand: String,
  sku: String,
  description: String,
  retail: Double,
  cost: Double,
  image: String,
  logo: String,
  points: Option[Int])

case class Campaign(
  _id: String,
  version: Int,
  prize: Option[Prize],
  giveAway: Option[Prize],
  name: String,
  description: String)

case class PartyCharity(
  _id:String,
  name: String,
  charity: Charity)

case class Charity(
  about: String,
  heartImpact: Option[String],
  logoColor: String)

object Application extends Controller {
  
  private implicit val format = Json.format[Prize]
  private implicit val format2 = Json.format[Campaign]
  private implicit val format3 = Json.format[Charity]
  private implicit val format4 = Json.format[PartyCharity]
  
  val onorUrl = play.api.Play.current.configuration.getString("onorplatform.url").get
  
  def facebookSettings(gameKey:Int) = (gameKey, play.api.Play.isDev(play.api.Play.current)) match {
    case (116262036, true) => FacebookSettings("fourpicbeauty-dev","304111289726859","bd5fa38e026ac2f5f65ce048d2d3f054")
    case (116262036, false) => FacebookSettings("fourpicweb", "583608191697375","618a6da80479f556e7a72c9780fcbefa")
    case (101347603, true) => FacebookSettings("celebbistro-dev","1400328356875796","aef84bb41bceedb63dc0b2d3eb9cc9ea")
  }
  
  def loadTestAuth = Action {
    Ok("42")
  }
  
  def loadTestAuth2 = Action {
    Ok("42")
  }

  def indexPost(gameKey: Int) =  {
    Action { implicit request =>
      Logger.error(s"host ${request.host} domain ${request.domain} uri ${request.uri}" )
      val baseUrl = request.host
      val settings = facebookSettings(gameKey)
      Ok(views.html.index(gameKey, settings, onorUrl, baseUrl))
    }
  }

  def index(gameKey: Int) = {
    Action { implicit request =>
      Logger.error(s"host ${request.host} domain ${request.domain} uri ${request.uri}" )
      val baseUrl = request.host
      val settings = facebookSettings(gameKey)
      Ok(views.html.index(gameKey, settings, onorUrl, baseUrl))
    }
  }
    
  def prizes(gameKey:Int, points:Int) = Action.async {
    def locked(prize:Option[Prize]) = {prize.get.points.get > points}

    WS.url(onorUrl + "/client/v2/campaignsavailable").withHeaders("gameKey" -> gameKey.toString).get.map{ res =>
      val campaigns = res.json.as[List[Campaign]].sortBy(_.prize.get.points.getOrElse(0))
      Ok(views.html.prizes(campaigns, campaigns.grouped(3).toVector, campaigns.grouped(1).toVector, points, locked _))
    }  
  }
  
  def charities(gameKey:Int) = Action.async {
    WS.url(onorUrl + "/client/v1/charities").withHeaders("gameKey" -> gameKey.toString).get.map{ res =>
      val charities = res.json.as[List[PartyCharity]]
      Ok(views.html.charities(charities = charities, grouped2 = charities.grouped(2).toVector, grouped3 = charities.grouped(3).toVector))
    }  
  }
  
  def charityGame(gameKey:Int, charityId:String, fbid:String) = Action.async {
    WS.url(onorUrl + "/client/v1/charities/" + charityId).withHeaders("gameKey" -> gameKey.toString).get.map{ res =>
      val charity = res.json.as[PartyCharity]
      val settings = facebookSettings(gameKey)
      Ok(views.html.charityGame(settings = settings, charity = charity))    
    }
  }

}
