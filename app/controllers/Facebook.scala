package controllers

import play.api._
import play.api.mvc._
import play.api.Logger

import play.api.libs.json._
import play.api.libs.json.util._
import play.api.libs.json.Reads._
import play.api.libs.functional.syntax._
import play.api.libs.json.Json

import java.util._

import org.scribe.builder._
import org.scribe.builder.api._
import org.scribe.model._
import org.scribe.oauth._

import models._
import components._

import play.api.Play.current

case class FacebookUser(
  id: String,
  username: Option[String],
  email: Option[String],
  name: String,
  first_name: String,
  last_name: String,
  gender: String,
  birthday: Option[String],
  link: String)

case class FacebookSettings(appId:String, appSecret:String, appUrl:String, appHome:String)

object Facebook extends Controller {

  def facebookSettings(gameKey:Int) = if (play.api.Play.isDev(play.api.Play.current)) {
     FacebookSettings(
       "304111289726859",
       "bd5fa38e026ac2f5f65ce048d2d3f054",
       "http://apps.facebook.com/fourpicbeauty-dev",
       "todo")
  } else {
    FacebookSettings(
      "583608191697375",
      "618a6da80479f556e7a72c9780fcbefa",
      "http://apps.facebook.com/fourpicweb",
      "todo")
  }

  val NETWORK_NAME = "Facebook"
  val PROTECTED_RESOURCE_URL = "https://graph.facebook.com/me"
  val EMPTY_TOKEN: Token = null
  val fscope = "email,friends_online_presence"

  def fbLoginCode(gameKey:Int) = Action { implicit request =>

    val host = s"http://${request.host}"
    def callback(key:Int) = s"$host/gameKey/$key/facebook/login"

    val settings = facebookSettings(gameKey)

    val service: OAuthService = new ServiceBuilder()
      .provider(classOf[FacebookApi])
      .apiKey(settings.appId)
      .apiSecret(settings.appSecret)
      .callback(callback(gameKey))
      .scope(fscope)
      .build()

    val authorizationUrl = service.getAuthorizationUrl(EMPTY_TOKEN);


    try {
        (request.queryString.get("code"), request.queryString.get("error_reason")) match {
          case (Some(Seq(code)), _) =>
            val verifier: Verifier = new Verifier(code)
            val accessToken: Token = service.getAccessToken(EMPTY_TOKEN, verifier)
            val request2: OAuthRequest = new OAuthRequest(Verb.GET, PROTECTED_RESOURCE_URL)
            service.signRequest(accessToken, request2)
            val response: org.scribe.model.Response = request2.send()
            Logger.debug("Code received is:" + response.getCode())
            val body = response.getBody()
            implicit val reads = Json.reads[FacebookUser]
            reads.reads(Json.parse(body)).asOpt match {
              case Some(fUser) => {
                //todo
                Redirect(settings.appUrl).withSession(("fbid", fUser.id))
              }
              case None => BadRequest("TODO")
            }
          case (_, Some(Seq("user_denied"))) => Redirect(settings.appHome)
          case _ =>
            Logger.debug("I should not be here => Code received is invalid or empty")
            BadRequest("Unknown Error")
        }
      } catch {
        case exp: Exception =>
          Logger.error("Sorry, an error has occurred. Message from server is: " + exp.getMessage())
          exp.printStackTrace()
          BadRequest(exp.getMessage)
      }
  }
}