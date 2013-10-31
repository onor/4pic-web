package controllers

import play.api.mvc._
import play.api.Logger
import play.api.libs.ws.WS
import play.api.libs.concurrent.Execution.Implicits._
import play.api.libs.json.JsValue

/**
 * Proxy for gamestate/cloudsave service.
 * It adds fbid to all http requests, and tweeks urls.
 * todo: code redundancy. we should make one simple method, to do the proxy stuff.
 */
object StateService extends Controller with GameController {

  def show = WithGameKeyAndFbid.async(parse.anyContent) {
    implicit request => {
      val uri = s"$onorUrl/client/v1/games/4pics1word/gk/${request.gameKey}/user/${request.fbid}/provider/facebook?userKey=$userKey"
      proxyGet(uri)
    }
  }

  def resolveLevel(points: Int) = WithGameKeyAndFbid.async(parse.json) {
    implicit request => {
      val uri = s"$onorUrl/client/v1/games/4pics1word/gk/${request.gameKey}/user/${request.fbid}/provider/facebook/points/$points?userKey=$userKey"
      proxyPost(uri, request.body)
    }
  }

  def hint(hint: Int) = WithGameKeyAndFbid.async(parse.json) {
    implicit request => {
      val uri = s"$onorUrl/client/v1/games/4pics1word/gk/${request.gameKey}/user/${request.fbid}/provider/facebook/hint/$hint?userKey=$userKey"
      proxyPost(uri, request.body)
    }
  }

  def seenLevel() = WithGameKeyAndFbid.async(parse.json) {
    implicit request => {
      val uri = s"$onorUrl/client/v1/games/4pics1word/gk/${request.gameKey}/user/${request.fbid}/provider/facebook?userKey=$userKey"
      proxyPost(uri, request.body)
    }
  }

}
