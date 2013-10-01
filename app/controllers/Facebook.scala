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

object Facebook extends Controller {

  val FBAppId = "304111289726859"
  val FBAppSecret = "bd5fa38e026ac2f5f65ce048d2d3f054"
  def FBAppCallback(gameKey:Int) = s"http://localhost:9000/gameKey/$gameKey/facebook/login"
  def FBAppUrl = "http://apps.facebook.com/fourpicbeauty-dev"
  val FBHome = "todo"

  val NETWORK_NAME = "Facebook"
  val PROTECTED_RESOURCE_URL = "https://graph.facebook.com/me"
  val EMPTY_TOKEN: Token = null
  val scope = "email,friends_online_presence"

  def fbLoginCode(gameKey:Int) = Action { implicit request =>
    val service: OAuthService = new ServiceBuilder()
      .provider(classOf[FacebookApi])
      .apiKey(FBAppId)
      .apiSecret(FBAppSecret)
      .callback(FBAppCallback(gameKey))
      .scope("email,friends_online_presence")
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
                //val fuser = FUser(uid = fUser.id, name =fUser.name, first_name = fUser.first_name, last_name = fUser.last_name )

                //database.withSession { implicit session:Session =>
                //UserService.createUserWithGameSummary(fuser, Active, None)
                //}

                Redirect(FBAppUrl).withSession(("fbid", fUser.id))
              }
              case None => BadRequest("TODO")
            }
          case (_, Some(Seq("user_denied"))) => Redirect(FBHome)
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