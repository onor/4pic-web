package controllers

import play.api.mvc._
import play.api.Logger
import play.api.libs.ws.WS
import play.api.libs.concurrent.Execution.Implicits._

object CharityService extends Controller with GameController {

  def show() = WithGameKey(p = parse.anyContent) {
    implicit request =>
      Async {
        val url = s"$onorUrl/client/v1/brands/522ccb2f490122bc02eb0929/charities?page=1&perPage=3&userKey=$userKey"
        WS.
          url(url).
          get.map(res => {
          if (res.status == 200)
            Ok(res.json)
          else BadRequest(res.body)
        })
      }
  }

  def votes() = WithGameKey(p = parse.anyContent) {
    implicit request =>
      Async {
        val url = s"$onorUrl/client/v1/charityvotes?gameKey=${request.gameKey}&userKey=$userKey"
        WS.
          url(url).
          get.map(res => {
          if (res.status == 200)
            Ok(res.json)
          else BadRequest(res.body)
        })
      }
  }

  def vote() = WithGameKey(p = parse.anyContent) {
    implicit request =>
      Async {
        val url = s"$onorUrl/client/v1/charityvotes?gameKey=${request.gameKey}&userKey=$userKey"
        WS.
          url(url).
          post(request.request.body.asJson.get).map(res => {  //todo move get
          if (res.status == 200)
            Ok(res.json)
          else BadRequest(res.body)
        })
      }
  }
}
