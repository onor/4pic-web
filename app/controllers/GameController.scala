package controllers

import play.api.libs.concurrent.Execution.Implicits._
import play.api.mvc._
import play.api.libs.json.Json
import play.api.libs.json.JsString

import play.api.libs.ws.WS
import scala.concurrent.Future
import controllers.Default._
import controllers.GameKeyFbidRequest
import controllers.GameKeyRequest
import scala.Some
import play.api.mvc.SimpleResult

case class GameKeyRequest[A](gameKey:Int, request: Request[A]) extends WrappedRequest[A](request)
case class GameKeyFbidRequest[A](gameKey:Int, fbid:String, request: Request[A]) extends WrappedRequest[A](request)

object WithGameKey extends ActionBuilder[GameKeyRequest] {

  val GAMEKEY = "gameKey"

  def invokeBlock[A](request: Request[A], block: (GameKeyRequest[A]) => Future[SimpleResult]) = {
    request.session.get(GAMEKEY).map(_.toInt) match {
      case Some(gameKey) => {
        block(GameKeyRequest(gameKey, request))
      }
      case None => Future{BadRequest("Missing gameKey.")}
    }
  }

}

object WithGameKeyAndFbid extends ActionBuilder[GameKeyFbidRequest] {

  val GAMEKEY = "gameKey"

  def invokeBlock[A](request: Request[A], block: (GameKeyFbidRequest[A]) => Future[SimpleResult]) = {
    (request.session.get(GAMEKEY).map(_.toInt), request.session.get("fbid")) match {
      case (Some(gameKey), Some(fbid)) => {
        block(GameKeyFbidRequest(gameKey,fbid, request))
      }
      case _ => Future{BadRequest("Missing gameKey or fbid!")}
    }
  }

}

/**
 * Helpers for extracting gameKey and fbid from cookie.
 */
trait GameController extends Controller {
  import play.api.Play

  val onorUrl = play.api.Play.current.configuration.getString("onorplatform.url").get
  val userKey = "4b1469e3ff90b438ef0134b1cb266c06"
  val GAMEKEY = "gameKey"

}