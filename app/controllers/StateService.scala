package controllers

import play.api.mvc._
import play.api.Logger
import play.api.libs.ws.WS
import play.api.libs.concurrent.Execution.Implicits._

object StateService extends Controller with GameController {

  def show = WithGameKey(p = parse.anyContent) {
    implicit request =>
      Async {
        val uri = s"$onorUrl/client/v1/games/4pics1word/gk/${request.gameKey}/user/${request.fbid}/provider/facebook?userKey=$userKey"
        WS.
          url(uri).
          get.map(res => {
          if (res.status == 200)
            Ok(res.json)
          else BadRequest(res.body)
        })
      }
  }

  def resolveLevel(points: Int) = WithGameKey(p = parse.anyContent) {
    implicit request =>
      Async {
        val uri = s"$onorUrl/client/v1/games/4pics1word/gk/${request.gameKey}/user/${request.fbid}/provider/facebook/points/$points?userKey=$userKey"
        WS.
          url(uri).
          put(request.body.asJson.get).map(res => {
          //todo move get
          if (res.status == 200)
            Ok(res.json)
          else BadRequest(res.body)
        })
      }
  }
	
  def seenLevel() = WithGameKey(p = parse.anyContent) {
    implicit request =>
      Async {
        val uri = s"$onorUrl/client/v1/games/4pics1word/gk/${request.gameKey}/user/${request.fbid}/provider/facebook?userKey=$userKey"
        WS.
          url(uri).
          put(request.body.asJson.get).map(res => {
          //todo move get
          if (res.status == 200)
            Ok(res.json)
          else BadRequest(res.body)
        })
      }
  }

}
